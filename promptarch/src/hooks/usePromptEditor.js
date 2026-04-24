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
      setTone('balanced'); setStyle('modern');
    } else if (category === 'mobile') {
      newStack.flutter = true; newStack.swift = true; newStack.kotlin = true; newStack.objective_c = true;
      setTone('balanced'); setStyle('modern');
    } else if (category === 'windows') {
      newStack.c_sharp = true; newStack.dot_net = true;
      setTone('professional'); setStyle('corporate');
    } else if (category === 'engineering') {
      newStack.matlab = true; newStack.python_sci = true; newStack.latex = true; newStack.solidworks = true;
      setTone('technical'); setStyle('classic');
    } else if (category === 'fluid_mechanics') {
      newStack.ansys_fluent = true; newStack.openfoam = true; newStack.matlab = true; newStack.python_sci = true; newStack.latex = true;
      setTone('technical'); setStyle('classic');
    } else if (category === 'general') {
      newStack.python_sci = true; newStack.latex = true; newStack.google_scholar = true; newStack.jupyter = true;
      setTone('balanced'); setStyle('modern');
    } else if (category === 'picture') {
      setTone('creative'); setStyle('modern');
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

    const stackList = Object.keys(techStack).filter(k => techStack[k]).map(k => k.replace(/_/g, ' ')).join(', ');
    const isTechCategory = ['web', 'mobile', 'windows'].includes(selectedCategory);
    const isEngCategory = ['engineering', 'fluid_mechanics'].includes(selectedCategory);
    const isGeneralCategory = selectedCategory === 'general';

    let sections = `--- SYSTEM INSTRUCTION ---
### ROLE
${role}

### TASK
${task}
`;

    // Tools / Stack section — shown for ALL categories that have them
    if (stackList) {
      sections += `
### ${isTechCategory ? 'TECH STACK' : 'TOOLS & SOFTWARE'}
${stackList}
`;
    }

    // Tone & Style
    sections += `
### TONE & STYLE
- Tone: ${tone}
- Style: ${style}${designFocus ? `\n- Focus: ${designFocus}` : ''}
`;

    // Category-specific enhancement sections
    if (isEngCategory) {
      sections += `
### METHODOLOGY
- State all assumptions explicitly before solving.
- Show step-by-step derivations with equations.
- Use SI units unless otherwise specified.
- Cite relevant standards (ISO, ASME, DIN, Eurocode) where applicable.

### OUTPUT FORMAT
- Present calculations in structured steps.
- Use tables for parametric comparisons.
- Write equations in LaTeX notation when possible.
- Include unit checks and dimensional analysis.
- Provide diagrams descriptions where helpful.
`;
    }

    if (selectedCategory === 'fluid_mechanics') {
      sections += `
### FLUID MECHANICS SPECIFICS
- Identify flow regime (laminar/turbulent) via Reynolds number.
- Specify governing equations and simplifying assumptions.
- For CFD: recommend mesh strategy, turbulence model, and solver settings.
- For analytical: start from Navier-Stokes and simplify systematically.
- Include boundary conditions and initial conditions.
`;
    }

    if (isGeneralCategory) {
      sections += `
### RESEARCH APPROACH
- Provide structured analysis with clear headings.
- Distinguish between facts, theories, and speculation.
- Include multiple perspectives on debated topics.
- Cite sources and suggest further reading.

### OUTPUT FORMAT
- Executive summary first, then detailed breakdown.
- Use bullet points, tables, and numbered lists for clarity.
- Include a "Key Takeaways" section at the end.
`;
    }

    // Rules section
    if (customRules.length > 0) {
      sections += `
### RULES
${customRules.join('\n')}`;
    }

    return sections;
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
            dot_net: { type: "BOOLEAN" },
            matlab: { type: "BOOLEAN" },
            python_sci: { type: "BOOLEAN" },
            latex: { type: "BOOLEAN" },
            ansys_fluent: { type: "BOOLEAN" },
            openfoam: { type: "BOOLEAN" },
            solidworks: { type: "BOOLEAN" },
            autocad: { type: "BOOLEAN" },
            google_scholar: { type: "BOOLEAN" },
            jupyter: { type: "BOOLEAN" },
            excel_data: { type: "BOOLEAN" }
          } 
        }, 
        customRules: { type: "ARRAY", items: { type: "STRING" } } 
      } 
    };
    
    let context = "web design system";
    let defaultTone = "balanced";
    let defaultStyle = "modern";
    if (selectedCategory === 'mobile') { context = "mobile app design system (iOS/Android)"; }
    else if (selectedCategory === 'windows') { context = "Windows desktop application design system"; defaultTone = "professional"; defaultStyle = "corporate"; }
    else if (selectedCategory === 'picture') { context = "detailed image generation prompt description"; defaultTone = "creative"; }
    else if (selectedCategory === 'engineering') { context = "engineering system design and calculations"; defaultTone = "technical"; defaultStyle = "classic"; }
    else if (selectedCategory === 'fluid_mechanics') { context = "fluid mechanics and CFD simulation expert prompt"; defaultTone = "technical"; defaultStyle = "classic"; }
    else if (selectedCategory === 'general') { context = "general knowledge and analysis prompt"; }

    const prompt = `Generate ${context} for: "${magicInput}". Pick a tone and style that best fits the domain (e.g. "technical" for engineering, "creative" for art, "professional" for business). Ensure the response fields (role, task, focus, tone, style) are tailored to this context.`;
    const result = await callGemini(prompt, schema);
    
    if (result) { 
      setRole(result.role); 
      setTask(result.task); 
      setDesignFocus(result.focus); 
      setTone(result.tone || defaultTone);
      setStyle(result.style || defaultStyle);
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
