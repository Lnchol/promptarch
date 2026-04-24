import { GoogleGenerativeAI } from "@google/generative-ai";
import { useState } from "react";

// Initialize Gemini with API key from env
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export const usePromptEditor = (token, lang) => {
  // ... state declarations ...
  const [selectedCategory, setSelectedCategory] = useState("web");
  const [role, setRole] = useState("");
  const [task, setTask] = useState("");
  const [designFocus, setDesignFocus] = useState("");
  const [techStack, setTechStack] = useState({ react: true, tailwind: true, threejs: true });
  const [customRules, setCustomRules] = useState([]);
  const [magicInput, setMagicInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  
  // New States
  const [tone, setTone] = useState("balanced");
  const [style, setStyle] = useState("modern");
  const [editorMode, setEditorMode] = useState("magic"); // 'magic' or 'custom'

  // ... handleCategoryChange and generatePromptContent ...
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    const newStack = {};
    if (category === 'web') {
      newStack.react = true; newStack.tailwind = true; newStack.threejs = true;
    } else if (category === 'mobile') {
      newStack.flutter = true; newStack.swift = true; newStack.kotlin = true; newStack.objective_c = true;
    } else if (category === 'windows') {
      newStack.c_sharp = true; newStack.dot_net = true;
    }
    setTechStack(newStack);
  };

  const generatePromptContent = () => {
    if (selectedCategory === 'picture') {
      return `--- IMAGE GENERATION PROMPT ---
### SUBJECT
${task}

### STYLE & MOOD
${designFocus}
- Tone: ${tone}
- Style: ${style}

### TECHNICAL DETAILS
${role}

### NEGATIVE PROMPT
${customRules.join(', ')}`;
    }

    const stackList = Object.keys(techStack).filter(k => techStack[k]).join(', ');
    const isTechCategory = ['web', 'mobile', 'windows'].includes(selectedCategory);

    return `--- SYSTEM INSTRUCTION ---
### ROLE
${role}

### TASK
${task}
${isTechCategory && stackList ? `\n### STACK\n${stackList}\n` : ''}
### TONE & STYLE
- Tone: ${tone}
- Style: ${style}
- Focus: ${designFocus}

### RULES
${customRules.join('\n')}`;
  };

  const callGemini = async (prompt, schema) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const langInstruction = lang ? `Respond in ${lang} language.` : "";
      const fullPrompt = prompt + ` \n\n${langInstruction}\nRespond strictly with valid JSON matching this schema: ` + JSON.stringify(schema);

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      let text = response.text();
      
      // Clean up markdown code blocks if present
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      return JSON.parse(text);
    } catch (e) {
      console.error("Gemini AI Error:", e);
      alert("AI Generation Failed: " + e.message);
      return null;
    }
  };

  const handleMagicGenerate = async () => {
    if (!magicInput.trim()) return;
    setIsAiLoading(true);
    const schema = { 
      type: "OBJECT", 
      properties: { 
        role: { type: "STRING" }, 
        task: { type: "STRING" }, 
        focus: { type: "STRING" }, 
        tone: { type: "STRING" },
        style: { type: "STRING" },
        stack: { 
          type: "OBJECT", 
          properties: { 
            threejs: { type: "BOOLEAN" }, 
            tailwind: { type: "BOOLEAN" }, 
            react: { type: "BOOLEAN" }, 
            flutter: { type: "BOOLEAN" }, 
            swift: { type: "BOOLEAN" }, 
            kotlin: { type: "BOOLEAN" }, 
            objective_c: { type: "BOOLEAN" }, 
            c_sharp: { type: "BOOLEAN" }, 
            dot_net: { type: "BOOLEAN" } 
          } 
        }, 
        customRules: { type: "ARRAY", items: { type: "STRING" } } 
      } 
    };
    
    let context = "web design system";
    if (selectedCategory === 'mobile') context = "mobile app design system (iOS/Android)";
    else if (selectedCategory === 'windows') context = "Windows desktop application design system";
    else if (selectedCategory === 'picture') context = "detailed image generation prompt description";
    else if (selectedCategory === 'engineering') context = "engineering system design and calculations";
    else if (selectedCategory === 'fluid_mechanics') context = "fluid mechanics and CFD simulation expert prompt";
    else if (selectedCategory === 'general') context = "general knowledge and analysis prompt";

    const prompt = `Generate ${context} for: "${magicInput}". Ensure the response fields (role, task, focus, tone, style) are tailored to this context.`;
    const result = await callGemini(prompt, schema);
    
    if (result) { 
      setRole(result.role); 
      setTask(result.task); 
      setDesignFocus(result.focus); 
      if (result.tone) setTone(result.tone);
      if (result.style) setStyle(result.style);
      setTechStack(prev => ({ ...prev, ...result.stack })); 
      if (result.customRules) setCustomRules(result.customRules); 
    }
    setIsAiLoading(false);
  };

  return {
    selectedCategory, handleCategoryChange,
    role, setRole,
    task, setTask,
    designFocus, setDesignFocus,
    techStack, setTechStack,
    customRules, setCustomRules,
    magicInput, setMagicInput,
    isAiLoading,
    copied, setCopied,
    tone, setTone,
    style, setStyle,
    customPrompt, setCustomPrompt,
    editorMode, setEditorMode,
    generatePromptContent,
    handleMagicGenerate
  };
};
