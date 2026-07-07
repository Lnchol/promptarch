import { useState } from "react";

// --- CONSTANTS ---

const SECURITY_OPTIONS = {
  tech: [
    { key: 'inputValidation', label: 'Input Validation' },
    { key: 'xssProtection', label: 'XSS Protection' },
    { key: 'sqlInjection', label: 'SQL Injection Prevention' },
    { key: 'csrfProtection', label: 'CSRF Protection' },
    { key: 'authBestPractices', label: 'Auth Best Practices' },
    { key: 'rateLimiting', label: 'Rate Limiting' },
    { key: 'dataEncryption', label: 'Data Encryption' },
    { key: 'errorHandling', label: 'Secure Error Handling' },
    { key: 'cors', label: 'CORS Configuration' },
    { key: 'csp', label: 'Content Security Policy' },
  ],
  engineering: [
    { key: 'dataValidation', label: 'Data Validation' },
    { key: 'unitVerification', label: 'Unit Verification' },
    { key: 'assumptionGuarding', label: 'Assumption Guarding' },
    { key: 'citationIntegrity', label: 'Citation Integrity' },
    { key: 'numericalStability', label: 'Numerical Stability' },
  ],
  general: [
    { key: 'factChecking', label: 'Fact Checking' },
    { key: 'sourceVerification', label: 'Source Verification' },
    { key: 'biasAwareness', label: 'Bias Awareness' },
    { key: 'citationIntegrity', label: 'Citation Integrity' },
  ],
  picture: [
    { key: 'contentSafety', label: 'Content Safety' },
    { key: 'copyrightAwareness', label: 'Copyright Awareness' },
  ],
};

const SKILL_OPTIONS = [
  { key: 'codeGeneration', label: 'Code Generation', desc: 'Write new code, refactor, optimize' },
  { key: 'debugging', label: 'Debugging', desc: 'Find and fix bugs, error analysis' },
  { key: 'architecture', label: 'Architecture', desc: 'System design, patterns, scalability' },
  { key: 'testing', label: 'Testing', desc: 'Unit tests, integration tests, TDD' },
  { key: 'documentation', label: 'Documentation', desc: 'Comments, READMEs, API docs' },
  { key: 'codeReview', label: 'Code Review', desc: 'Review, security audit, performance' },
  { key: 'explanation', label: 'Explanation', desc: 'Teach concepts, explain code' },
  { key: 'dataAnalysis', label: 'Data Analysis', desc: 'Data processing, visualization' },
  { key: 'devops', label: 'DevOps', desc: 'CI/CD, deployment, infrastructure' },
  { key: 'uiux', label: 'UI/UX', desc: 'Design systems, accessibility' },
];

// --- HELPER ---

const getSecurityOptionsForCategory = (category) => {
  if (['web', 'mobile', 'windows'].includes(category)) return SECURITY_OPTIONS.tech;
  if (['engineering', 'fluid_mechanics'].includes(category)) return SECURITY_OPTIONS.engineering;
  if (category === 'picture') return SECURITY_OPTIONS.picture;
  return SECURITY_OPTIONS.general;
};

// --- HOOK ---

export const usePromptEditor = (token, lang) => {
  // --- Existing state ---
  const [selectedCategory, setSelectedCategory] = useState("web");
  const [role, setRole] = useState("");
  const [task, setTask] = useState("");
  const [designFocus, setDesignFocus] = useState("");
  const [techStack, setTechStack] = useState({ 
    react: true, 
    tailwind: true, 
    threejs: false, 
    nextjs: false, 
    vite: false, 
    vanilla_js: false, 
    typescript: false,
    // Claude.md options
    skipFiller: true,
    codeDiffs: true,
    noExplanation: false,
    dryRunOnly: false,
    // Chat Prompt options
    markdown: true,
    stepByStep: true,
    concise: false,
    examples: true
  });
  const [customRules, setCustomRules] = useState([]);
  const [magicInput, setMagicInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [tone, setTone] = useState("balanced");
  const [style, setStyle] = useState("modern");
  const [editorMode, setEditorMode] = useState("magic"); // 'magic' or 'custom'

  // --- NEW: Target AI Tool Selector ---
  const [targetToolState, setTargetToolState] = useState("claude"); // 'claude', 'gemini', 'chatgpt', 'cursor', 'copilot'
  const targetTool = targetToolState;
  const setTargetTool = (tool) => {
    setTargetToolState(tool);
    if (tool !== 'claude' && selectedCategory === 'claude_md') {
      setSelectedCategory('web');
      setTechStack({
        react: true, 
        tailwind: true, 
        threejs: false, 
        nextjs: false, 
        vite: false, 
        vanilla_js: false, 
        typescript: false
      });
      setTone('balanced');
      setStyle('modern');
    }
  };

  // --- NEW: Security Checks ---
  const [securityChecks, setSecurityChecks] = useState({});

  const toggleSecurityCheck = (key) => {
    setSecurityChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // --- NEW: Output Format ---
  const [outputFormat, setOutputFormat] = useState('structured'); // 'structured', 'conversational', 'checklist'
  const [outputSections, setOutputSections] = useState({
    roleSection: true,
    taskSection: true,
    stackSection: true,
    toneSection: true,
    methodologySection: true,
    rulesSection: true,
    securitySection: true,
    skillsSection: true,
  });

  const toggleOutputSection = (key) => {
    setOutputSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // --- NEW: Project Understanding ---
  const [projectDescription, setProjectDescription] = useState('');
  const [projectStructure, setProjectStructure] = useState('');
  const [projectAnalysis, setProjectAnalysis] = useState(null);
  const [isProjectAnalyzing, setIsProjectAnalyzing] = useState(false);

  // --- NEW: Skills Selection ---
  const [selectedSkills, setSelectedSkills] = useState({});

  const toggleSkill = (key) => {
    setSelectedSkills(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // --- Category change ---
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    const newStack = {};
    if (category === 'web') {
      newStack.react = true; 
      newStack.tailwind = true; 
      newStack.threejs = false;
      newStack.nextjs = false; 
      newStack.vite = false; 
      newStack.vanilla_js = false; 
      newStack.typescript = false;
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
    } else if (category === 'picture') {
      setTone('creative'); setStyle('modern');
    } else if (category === 'claude_md') {
      newStack.skipFiller = true;
      newStack.codeDiffs = true;
      newStack.noExplanation = true;
      newStack.dryRunOnly = false;
      setTone('minimalist'); setStyle('modern');
    }
    setTechStack(newStack);
  };

  // --- Format output helper ---
  const formatOutput = (parts, header) => {
    if (outputFormat === 'conversational') {
      let output = '';
      parts.forEach(p => {
        const title = p.title.toLowerCase().replace(/_/g, ' ');
        const content = p.content.replace(/^- /gm, '').replace(/\n/g, ', ');
        output += `Regarding ${title}: ${content}\n\n`;
      });
      return output.trim();
    }

    if (outputFormat === 'checklist') {
      let output = header + '\n\n';
      let itemNum = 1;
      parts.forEach(p => {
        output += `${itemNum}. [${p.title}]\n`;
        const lines = p.content.split('\n');
        lines.forEach(line => {
          const cleaned = line.replace(/^- /, '').trim();
          if (cleaned) {
            output += `   ${itemNum}.${lines.indexOf(line) + 1}. ${cleaned}\n`;
          }
        });
        output += '\n';
        itemNum++;
      });
      return output.trim();
    }

    // Default: structured format (original)
    let output = '';
    if (targetTool === 'claude') {
      if (selectedCategory === 'picture') {
        output += `# IMAGE GENERATION PROMPT (Optimized for Anthropic Claude)\n\n`;
        output += `Please follow the guidelines encapsulated within the XML tags below.\n\n`;
        parts.forEach(p => {
          const tag = p.title.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_');
          output += `<${tag}>\n${p.content}\n</${tag}>\n\n`;
        });
        return output.trim();
      }

      if (selectedCategory === 'claude_md') {
        output += `# CLAUDE.md - Token-Efficient Guidelines\n\n`;
        output += `Please follow the guidelines encapsulated within the XML tags below for maximum token-efficiency and precision.\n\n`;

        // 1. Context Tag
        const hasContext = (outputSections.roleSection && role) || (outputSections.taskSection && task);
        if (hasContext) {
          output += `<project_context>\n`;
          if (outputSections.roleSection && role) {
            output += `- **Assistant Role**: ${role}\n`;
          }
          if (outputSections.taskSection && task) {
            output += `- **Primary Objective**: ${task}\n`;
          }
          output += `</project_context>\n\n`;
        }

        // 2. Token-Efficiency Coding Guidelines Tag
        if (outputSections.methodologySection) {
          output += `<coding_guidelines>\n`;
          output += `- Keep replies highly concise, focusing purely on direct modifications.\n`;
          if (techStack.codeDiffs) {
            output += `- Output ONLY target code blocks, diffs, or code fragments. Never rewrite full files or unchanged functions.\n`;
          }
          if (techStack.skipFiller) {
            output += `- Omit greetings, conversational filler, summaries, and post-chat code descriptions.\n`;
          }
          if (techStack.noExplanation) {
            output += `- Provide conceptual explanations only if explicitly requested by the user.\n`;
          }
          if (techStack.dryRunOnly) {
            output += `- Draft a step-by-step verification plan inside a <thinking> tag before generating any code changes.\n`;
          }
          output += `- Avoid silent assumptions; ask for clarification on ambiguous constraints to prevent redundant code iterations.\n`;
          output += `</coding_guidelines>\n\n`;
        }

        // 3. Behavioral Constraints Tag
        const hasBehavioral = outputSections.toneSection || (outputSections.rulesSection && customRules.length > 0);
        if (hasBehavioral) {
          output += `<behavioral_constraints>\n`;
          if (outputSections.toneSection) {
            output += `- **Response Tone**: minimalist\n`;
            output += `- **Writing Style**: modern\n`;
          }
          if (outputSections.rulesSection && customRules.length > 0) {
            output += `\n**Directives**:\n`;
            customRules.forEach(rule => {
              output += `- ${rule}\n`;
            });
          }
          output += `</behavioral_constraints>\n\n`;
        }

        // 4. Security Standards Tag
        const activeSecurityChecks = Object.keys(securityChecks).filter(k => securityChecks[k]);
        if (outputSections.securitySection && activeSecurityChecks.length > 0) {
          output += `<security_standards>\n`;
          const securityLabels = getSecurityOptionsForCategory(selectedCategory);
          activeSecurityChecks.forEach(k => {
            const option = securityLabels.find(o => o.key === k);
            const label = option ? option.label : k.replace(/([A-Z])/g, ' $1').trim();
            output += `- Enforce validation check: ${label}\n`;
          });
          output += `</security_standards>\n\n`;
        }

        // 5. Capabilities Tag
        const activeSkills = Object.keys(selectedSkills).filter(k => selectedSkills[k]);
        if (outputSections.skillsSection && activeSkills.length > 0) {
          output += `<capabilities>\n`;
          activeSkills.forEach(k => {
            const skill = SKILL_OPTIONS.find(s => s.key === k);
            const label = skill ? `${skill.label} (${skill.desc})` : k;
            output += `- Require agent capability: ${label}\n`;
          });
          output += `</capabilities>\n\n`;
        }

        return output.trim();
      }

      output += `# CLAUDE.md - Developer Guidelines\n\n`;
      output += `Please follow the guidelines encapsulated within the XML tags below.\n\n`;

      // 1. Context Tag
      const hasContext = (outputSections.roleSection && role) || 
                         (outputSections.taskSection && task) || 
                         (outputSections.stackSection && Object.keys(techStack).some(k => techStack[k]));
      
      if (hasContext) {
        output += `<project_context>\n`;
        if (outputSections.roleSection && role) {
          output += `- **Assistant Role**: ${role}\n`;
        }
        if (outputSections.taskSection && task) {
          output += `- **Primary Objective**: ${task}\n`;
        }
        const stackList = Object.keys(techStack).filter(k => techStack[k]).map(k => k.replace(/_/g, ' ')).join(', ');
        if (outputSections.stackSection && stackList) {
          output += `- **${['engineering', 'fluid_mechanics', 'general'].includes(selectedCategory) ? 'Tools & Software' : 'Tech Stack'}**: ${stackList}\n`;
        }
        output += `</project_context>\n\n`;
      }

      // 2. Coding Guidelines Tag (Category adjusted)
      if (outputSections.methodologySection) {
        output += `<coding_guidelines>\n`;
        
        // Research-backed guidelines per category
        if (selectedCategory === 'web') {
          output += `- Use functional components with hooks for clean React state management.\n`;
          output += `- Style interfaces utilizing utility-first Tailwind CSS classes.\n`;
          output += `- Adhere to strict TypeScript safety (avoid using 'any' type, define clear interfaces/types).\n`;
          output += `- Leverage semantic HTML elements for optimal accessibility (ARIA) and search layout.\n`;
          output += `- Implement modular design; files should remain focused and single-purpose.\n`;
          output += `- Do not write draft placeholders; generate complete code files where applicable.\n`;
        } else if (selectedCategory === 'mobile') {
          output += `- Structure widgets/views keeping state logic decoupled (BLoC, Riverpod, or Provider patterns).\n`;
          output += `- Ensure screens are fully responsive across phone, tablet, and foldable devices.\n`;
          output += `- Optimize animation frame rendering; dispose of controllers to prevent memory leaks.\n`;
          output += `- Adhere to platform styles (Material Design guidelines for Android, HIG for iOS).\n`;
          output += `- Handle native platform dependencies cleanly within gradle/cocoapod setups.\n`;
        } else if (selectedCategory === 'windows') {
          output += `- Organize backend logic decoupling UI from data models using WPF/WinForms MVVM pattern.\n`;
          output += `- Execute resource-intensive I/O or network API tasks asynchronously using async/await.\n`;
          output += `- Follow strict C# PascalCase naming conventions and clean namespace imports.\n`;
          output += `- Manage system resources properly; implement IDisposable for unmanaged objects.\n`;
        } else if (selectedCategory === 'engineering') {
          output += `- Explicitly state all mathematical models, simplifying assumptions, and SI units first.\n`;
          output += `- Compile parametric comparisons in markdown tables to evaluate model variants.\n`;
          output += `- Verify numerical stability and dimensional consistency in calculating steps.\n`;
          output += `- Write clean, documented calculation scripts (Python/MATLAB) with comments.\n`;
        } else if (selectedCategory === 'fluid_mechanics') {
          output += `- Identify fluid flow regime (laminar, transitional, turbulent) utilizing Reynolds number.\n`;
          output += `- Detail physical boundary conditions (inlets, outlets, walls, symmetry) explicitly.\n`;
          output += `- Suggest suitable CFD mesh configurations and solver settings (e.g. SIMPLE, PISO).\n`;
          output += `- Simplify Navier-Stokes equations systematically and show step-by-step analytical derivation.\n`;
        }
        
        // Append existing methodology parts if there are any
        parts.forEach(p => {
          if (['METHODOLOGY', 'FLUID MECHANICS SPECIFICS', 'RESEARCH APPROACH', 'OUTPUT FORMAT'].includes(p.title)) {
            output += `\n**${p.title}**:\n${p.content.split('\n').map(line => line.startsWith('-') ? line : `- ${line}`).join('\n')}\n`;
          }
        });
        
        output += `</coding_guidelines>\n\n`;
      }

      // 3. Behavioral Constraints Tag
      const hasBehavioral = outputSections.toneSection || (outputSections.rulesSection && customRules.length > 0);
      if (hasBehavioral) {
        output += `<behavioral_constraints>\n`;
        if (outputSections.toneSection) {
          output += `- **Response Tone**: ${tone}\n`;
          output += `- **Writing Style**: ${style}\n`;
          if (designFocus) {
            output += `- **Design Focus**: ${designFocus}\n`;
          }
        }
        if (outputSections.rulesSection && customRules.length > 0) {
          output += `\n**Directives**:\n`;
          customRules.forEach(rule => {
            output += `- ${rule}\n`;
          });
        }
        output += `</behavioral_constraints>\n\n`;
      }

      // 4. Security Standards Tag
      const activeSecurityChecks = Object.keys(securityChecks).filter(k => securityChecks[k]);
      if (outputSections.securitySection && activeSecurityChecks.length > 0) {
        output += `<security_standards>\n`;
        const securityLabels = getSecurityOptionsForCategory(selectedCategory);
        activeSecurityChecks.forEach(k => {
          const option = securityLabels.find(o => o.key === k);
          const label = option ? option.label : k.replace(/([A-Z])/g, ' $1').trim();
          output += `- Enforce security validation: ${label}\n`;
        });
        output += `</security_standards>\n\n`;
      }

      // 5. Capabilities Tag
      const activeSkills = Object.keys(selectedSkills).filter(k => selectedSkills[k]);
      if (outputSections.skillsSection && activeSkills.length > 0) {
        output += `<capabilities>\n`;
        activeSkills.forEach(k => {
          const skill = SKILL_OPTIONS.find(s => s.key === k);
          const label = skill ? `${skill.label} (${skill.desc})` : k;
          output += `- Require agent capability: ${label}\n`;
        });
        output += `</capabilities>\n\n`;
      }
    } else if (targetTool === 'gemini') {
      output += `# SYSTEM INSTRUCTION (Optimized for Google Gemini)\n`;
      parts.forEach(p => {
        output += `\n## ${p.title}\n${p.content}\n`;
      });
    } else if (targetTool === 'chatgpt') {
      output += `# CUSTOM INSTRUCTIONS (Optimized for OpenAI ChatGPT)\n\n`;
      output += `## Profile & Role\n`;
      const rolePart = parts.find(p => p.title === 'ROLE' || p.title === 'TECHNICAL DETAILS');
      if (rolePart) output += `${rolePart.content}\n\n`;
      
      const stackPart = parts.find(p => p.title === 'TECH STACK' || p.title === 'TOOLS & SOFTWARE');
      if (stackPart) output += `### Tech Stack & Tools\n${stackPart.content}\n\n`;
      
      output += `## Preferred Response Guidelines\n`;
      parts.forEach(p => {
        if (p.title !== 'ROLE' && p.title !== 'TECHNICAL DETAILS' && p.title !== 'TECH STACK' && p.title !== 'TOOLS & SOFTWARE') {
          output += `### ${p.title}\n${p.content}\n\n`;
        }
      });
    } else if (targetTool === 'cursor') {
      output += `# .cursorrules (Optimized for Cursor IDE)\n\n`;
      output += `You are an AI coding assistant integrated inside Cursor. Follow these instructions carefully:\n\n`;
      parts.forEach(p => {
        output += `## ${p.title}\n${p.content}\n\n`;
      });
    } else if (targetTool === 'copilot') {
      output += `# .github/copilot-instructions.md (Optimized for GitHub Copilot)\n\n`;
      parts.forEach(p => {
        output += `## ${p.title}\n${p.content}\n\n`;
      });
    } else {
      output += header + '\n';
      parts.forEach(p => {
        output += `\n### ${p.title}\n${p.content}\n`;
      });
    }
    return output.trim();
  };

  // --- Generate prompt content ---
  const generatePromptContent = () => {
    // --- PICTURE CATEGORY (special format) ---
    if (selectedCategory === 'picture') {
      const parts = [];
      if (outputSections.taskSection) parts.push({ title: 'SUBJECT', content: task });
      parts.push({ title: 'STYLE & MOOD', content: `${designFocus}\n- Tone: ${tone}\n- Style: ${style}` });
      if (outputSections.roleSection) parts.push({ title: 'TECHNICAL DETAILS', content: role });
      if (customRules.length > 0 && outputSections.rulesSection) parts.push({ title: 'NEGATIVE PROMPT', content: customRules.join(', ') });

      // Security for picture
      const activePicSecurity = Object.keys(securityChecks).filter(k => securityChecks[k]);
      if (activePicSecurity.length > 0 && outputSections.securitySection) {
        const secLabels = getSecurityOptionsForCategory('picture');
        const activeLabels = activePicSecurity.map(k => {
          const opt = secLabels.find(o => o.key === k);
          return opt ? `- ${opt.label}` : `- ${k}`;
        });
        parts.push({ title: 'CONTENT GUIDELINES', content: activeLabels.join('\n') });
      }

      return formatOutput(parts, '--- IMAGE GENERATION PROMPT ---');
    }

    // --- ALL OTHER CATEGORIES ---
    const isClaudeMdCategory = selectedCategory === 'claude_md';
    const stackList = isClaudeMdCategory 
      ? '' 
      : Object.keys(techStack).filter(k => techStack[k]).map(k => k.replace(/_/g, ' ')).join(', ');
    const isTechCategory = ['web', 'mobile', 'windows'].includes(selectedCategory);
    const isEngCategory = ['engineering', 'fluid_mechanics'].includes(selectedCategory);

    const parts = [];

    if (outputSections.roleSection) parts.push({ title: 'ROLE', content: role });
    if (outputSections.taskSection) parts.push({ title: 'TASK', content: task });
    if (stackList && outputSections.stackSection) {
      parts.push({ title: isTechCategory ? 'TECH STACK' : 'TOOLS & SOFTWARE', content: stackList });
    }
    if (outputSections.toneSection) {
      parts.push({ title: 'TONE & STYLE', content: `- Tone: ${tone}\n- Style: ${style}${designFocus ? `\n- Focus: ${designFocus}` : ''}` });
    }

    // Category-specific methodology sections
    if (isEngCategory && outputSections.methodologySection) {
      parts.push({ title: 'METHODOLOGY', content: '- State all assumptions explicitly before solving.\n- Show step-by-step derivations with equations.\n- Use SI units unless otherwise specified.\n- Cite relevant standards (ISO, ASME, DIN, Eurocode) where applicable.' });
      parts.push({ title: 'OUTPUT FORMAT', content: '- Present calculations in structured steps.\n- Use tables for parametric comparisons.\n- Write equations in LaTeX notation when possible.\n- Include unit checks and dimensional analysis.\n- Provide diagrams descriptions where helpful.' });
    }
    if (selectedCategory === 'fluid_mechanics' && outputSections.methodologySection) {
      parts.push({ title: 'FLUID MECHANICS SPECIFICS', content: '- Identify flow regime (laminar/turbulent) via Reynolds number.\n- Specify governing equations and simplifying assumptions.\n- For CFD: recommend mesh strategy, turbulence model, and solver settings.\n- For analytical: start from Navier-Stokes and simplify systematically.\n- Include boundary conditions and initial conditions.' });
    }


    // Rules
    if (customRules.length > 0 && outputSections.rulesSection) {
      parts.push({ title: 'RULES', content: customRules.join('\n') });
    }

    // Security
    const activeSecurityChecks = Object.keys(securityChecks).filter(k => securityChecks[k]);
    if (activeSecurityChecks.length > 0 && outputSections.securitySection) {
      const securityLabels = getSecurityOptionsForCategory(selectedCategory);
      const activeLabels = activeSecurityChecks.map(k => {
        const option = securityLabels.find(o => o.key === k);
        return option ? `- ${option.label}` : `- ${k.replace(/([A-Z])/g, ' $1').trim()}`;
      });
      parts.push({ title: 'SECURITY & VALIDATION', content: activeLabels.join('\n') });
    }

    // Skills
    const activeSkills = Object.keys(selectedSkills).filter(k => selectedSkills[k]);
    if (activeSkills.length > 0 && outputSections.skillsSection) {
      const skillLabels = activeSkills.map(k => {
        const skill = SKILL_OPTIONS.find(s => s.key === k);
        return skill ? `- ${skill.label}: ${skill.desc}` : `- ${k}`;
      });
      parts.push({ title: 'REQUIRED CAPABILITIES', content: skillLabels.join('\n') });
    }

    return formatOutput(parts, '--- SYSTEM INSTRUCTION ---');
  };

  // --- Call server-side API ---
  const callGemini = async (prompt, schema) => {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, schema, language: lang })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI generation failed');
      }

      return await response.json();
    } catch (e) {
      console.error("AI Generation Error:", e);
      alert("AI Generation Failed: " + e.message);
      return null;
    }
  };

  // --- Magic generate ---
  const handleMagicGenerate = async () => {
    if (!magicInput.trim()) return;
    setIsAiLoading(true);

    const stackProperties = selectedCategory === 'claude_md'
      ? {
          skipFiller: { type: "BOOLEAN" },
          codeDiffs: { type: "BOOLEAN" },
          noExplanation: { type: "BOOLEAN" },
          dryRunOnly: { type: "BOOLEAN" }
        }
      : {
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
        };

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
          properties: stackProperties
        },
        suggestedSecurityChecks: { type: "ARRAY", items: { type: "STRING" } },
        suggestedSkills: { type: "ARRAY", items: { type: "STRING" } },
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
    else if (selectedCategory === 'claude_md') { context = "CLAUDE.md developer guidelines and workspace rules"; defaultTone = "minimalist"; defaultStyle = "modern"; }

    const prompt = `Generate ${context} for: "${magicInput}". Pick a tone and style that best fits the domain (e.g. "technical" for engineering, "creative" for art, "professional" for business). Ensure the response fields (role, task, focus, tone, style, suggestedSecurityChecks, suggestedSkills) are tailored to this context. Select relevant security checks and capability skills.`;
    const result = await callGemini(prompt, schema);

    if (result) {
      setRole(result.role);
      setTask(result.task);
      setDesignFocus(result.focus);
      setTone(result.tone || defaultTone);
      setStyle(result.style || defaultStyle);
      setTechStack(prev => ({ ...prev, ...result.stack }));
      if (result.customRules) setCustomRules(result.customRules);
      
      // Auto-apply suggested security checks
      if (result.suggestedSecurityChecks) {
        const checks = {};
        result.suggestedSecurityChecks.forEach(k => { checks[k] = true; });
        setSecurityChecks(checks);
      } else {
        setSecurityChecks({});
      }

      // Auto-apply suggested skills
      if (result.suggestedSkills) {
        const skills = {};
        result.suggestedSkills.forEach(k => { skills[k] = true; });
        setSelectedSkills(skills);
      } else {
        setSelectedSkills({});
      }
    }
    setIsAiLoading(false);
  };

  // --- NEW: Project Analysis ---
  const handleProjectAnalyze = async () => {
    if (!projectDescription.trim() && !projectStructure.trim()) return;
    setIsProjectAnalyzing(true);

    const schema = {
      type: "OBJECT",
      properties: {
        detectedCategory: { type: "STRING" },
        role: { type: "STRING" },
        task: { type: "STRING" },
        suggestedTone: { type: "STRING" },
        suggestedStyle: { type: "STRING" },
        suggestedStack: {
          type: "OBJECT",
          properties: {
            threejs: { type: "BOOLEAN" }, tailwind: { type: "BOOLEAN" }, react: { type: "BOOLEAN" },
            flutter: { type: "BOOLEAN" }, swift: { type: "BOOLEAN" }, kotlin: { type: "BOOLEAN" },
            objective_c: { type: "BOOLEAN" }, c_sharp: { type: "BOOLEAN" }, dot_net: { type: "BOOLEAN" },
            matlab: { type: "BOOLEAN" }, python_sci: { type: "BOOLEAN" }, latex: { type: "BOOLEAN" },
            ansys_fluent: { type: "BOOLEAN" }, openfoam: { type: "BOOLEAN" }, solidworks: { type: "BOOLEAN" },
            autocad: { type: "BOOLEAN" }, google_scholar: { type: "BOOLEAN" }, jupyter: { type: "BOOLEAN" },
            excel_data: { type: "BOOLEAN" }
          }
        },
        suggestedSecurityChecks: { type: "ARRAY", items: { type: "STRING" } },
        suggestedSkills: { type: "ARRAY", items: { type: "STRING" } },
        customRules: { type: "ARRAY", items: { type: "STRING" } },
        projectSummary: { type: "STRING" }
      }
    };

    let prompt = `Analyze this project and generate appropriate AI assistant configuration:\n\nProject Description: ${projectDescription}`;
    if (projectStructure.trim()) {
      prompt += `\n\nProject File Structure:\n${projectStructure}`;
    }
    prompt += `\n\nBased on this project, determine:\n1. The best category (web, mobile, windows, engineering, fluid_mechanics, general, picture)\n2. An appropriate role for the AI assistant\n3. A clear task description\n4. Suggested tone and style\n5. Required tech stack (set boolean true for needed tools)\n6. Security checks needed (from: inputValidation, xssProtection, sqlInjection, csrfProtection, authBestPractices, rateLimiting, dataEncryption, errorHandling, cors, csp, dataValidation, unitVerification, assumptionGuarding, citationIntegrity, numericalStability, factChecking, sourceVerification, biasAwareness, contentSafety, copyrightAwareness)\n7. Required AI skills (from: codeGeneration, debugging, architecture, testing, documentation, codeReview, explanation, dataAnalysis, devops, uiux)\n8. Custom rules specific to this project\n9. A brief project summary`;

    const result = await callGemini(prompt, schema);

    if (result) {
      setProjectAnalysis(result);
    }
    setIsProjectAnalyzing(false);
  };

  const applyProjectAnalysis = () => {
    if (!projectAnalysis) return;
    const a = projectAnalysis;

    // Apply category
    if (a.detectedCategory) handleCategoryChange(a.detectedCategory);

    // Apply basic fields
    if (a.role) setRole(a.role);
    if (a.task) setTask(a.task);
    if (a.suggestedTone) setTone(a.suggestedTone);
    if (a.suggestedStyle) setStyle(a.suggestedStyle);

    // Apply stack
    if (a.suggestedStack) setTechStack(prev => ({ ...prev, ...a.suggestedStack }));

    // Apply security checks
    if (a.suggestedSecurityChecks) {
      const checks = {};
      a.suggestedSecurityChecks.forEach(k => { checks[k] = true; });
      setSecurityChecks(checks);
    }

    // Apply skills
    if (a.suggestedSkills) {
      const skills = {};
      a.suggestedSkills.forEach(k => { skills[k] = true; });
      setSelectedSkills(skills);
    }

    // Apply rules
    if (a.customRules) setCustomRules(a.customRules);
  };

  // --- Return ---
  return {
    // Existing
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
    handleMagicGenerate,
    // NEW: Target Tool Selector
    targetTool, setTargetTool,
    // NEW: Security
    securityChecks, setSecurityChecks, toggleSecurityCheck,
    getSecurityOptionsForCategory,
    SECURITY_OPTIONS,
    // NEW: Output format
    outputFormat, setOutputFormat,
    outputSections, toggleOutputSection,
    // NEW: Project Understanding
    projectDescription, setProjectDescription,
    projectStructure, setProjectStructure,
    projectAnalysis, setProjectAnalysis,
    isProjectAnalyzing,
    handleProjectAnalyze,
    applyProjectAnalysis,
    // NEW: Skills
    selectedSkills, setSelectedSkills, toggleSkill,
    SKILL_OPTIONS,
  };
};
