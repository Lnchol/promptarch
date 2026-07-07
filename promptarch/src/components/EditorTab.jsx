import React, { useState } from 'react';
import { Sparkles, Loader2, Wand2, Globe, Smartphone, Monitor, Image as ImageIcon, Code2, Palette, Box, Command, CheckCircle, Terminal, Download, Save, ClipboardPaste, FileText, Wrench, Waves, BookOpen, Shield, ShieldCheck, ChevronDown, ChevronUp, Scan, Lightbulb, Zap, Bug, Layers, TestTube, BookMarked, Eye, BarChart3, Cloud, Layout, FolderTree, AlertTriangle } from 'lucide-react';

// Collapsible Section wrapper
function CollapsibleSection({ title, icon: Icon, children, defaultOpen = false, badge }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2">
          <Icon size={12} className="text-industrial-500 dark:text-acid-500" />
          {title}
          {badge && (
            <span className="ml-1 px-1.5 py-0.5 text-[9px] bg-industrial-100 dark:bg-acid-900/30 text-industrial-600 dark:text-acid-400 rounded-sm font-bold">
              {badge}
            </span>
          )}
        </span>
        {isOpen ? <ChevronUp size={14} className="text-zinc-400" /> : <ChevronDown size={14} className="text-zinc-400" />}
      </button>
      {isOpen && (
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

export default function EditorTab({ 
  editorState, 
  t, 
  handleSavePrompt 
}) {
  const {
    selectedCategory, handleCategoryChange,
    role, setRole,
    task, setTask,
    techStack, setTechStack,
    magicInput, setMagicInput,
    isAiLoading,
    copied,
    customPrompt, setCustomPrompt,
    editorMode, setEditorMode,
    generatePromptContent,
    handleMagicGenerate,
    // NEW: Security
    securityChecks, toggleSecurityCheck,
    getSecurityOptionsForCategory,
    // NEW: Output format
    outputFormat, setOutputFormat,
    outputSections, toggleOutputSection,
    // NEW: Project Understanding
    projectDescription, setProjectDescription,
    projectStructure, setProjectStructure,
    projectAnalysis,
    isProjectAnalyzing,
    handleProjectAnalyze,
    applyProjectAnalysis,
    // NEW: Skills
    selectedSkills, toggleSkill,
    SKILL_OPTIONS,
  } = editorState;

  // Skill icons lookup
  const skillIconLookup = {
    codeGeneration: Zap,
    debugging: Bug,
    architecture: Layers,
    testing: TestTube,
    documentation: BookMarked,
    codeReview: Eye,
    explanation: Lightbulb,
    dataAnalysis: BarChart3,
    devops: Cloud,
    uiux: Layout,
  };

  // Get content for preview based on mode
  const getPreviewContent = () => {
    if (editorMode === 'custom') {
      return customPrompt || t('custom_prompt_placeholder') || 'Your custom prompt will appear here...';
    }
    return generatePromptContent();
  };

  // Count active security checks
  const activeSecurityCount = securityChecks ? Object.values(securityChecks).filter(Boolean).length : 0;
  // Count active skills
  const activeSkillCount = selectedSkills ? Object.values(selectedSkills).filter(Boolean).length : 0;

  return (
    <div className="grid lg:grid-cols-12 gap-8 md:gap-12">
      <div className="lg:col-span-7 space-y-6 md:space-y-8">
        
        {/* MODE TOGGLE */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest border-l-2 border-industrial-500 dark:border-acid-500 pl-2">
            {t('editor_mode') || 'Editor Mode'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setEditorMode('magic')}
              className={`p-4 border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-all ${
                editorMode === 'magic' 
                  ? 'bg-industrial-600 dark:bg-acid-600 text-white dark:text-black border-industrial-600 dark:border-acid-600' 
                  : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:border-industrial-500 dark:hover:border-acid-500'
              }`}
            >
              <Sparkles size={18} />
              {t('magic_mode') || 'Magic Generator'}
            </button>
            <button
              onClick={() => setEditorMode('custom')}
              className={`p-4 border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-all ${
                editorMode === 'custom' 
                  ? 'bg-industrial-600 dark:bg-acid-600 text-white dark:text-black border-industrial-600 dark:border-acid-600' 
                  : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:border-industrial-500 dark:hover:border-acid-500'
              }`}
            >
              <FileText size={18} />
              {t('custom_mode') || 'Custom Prompt'}
            </button>
          </div>
        </div>

        {/* CUSTOM PROMPT MODE */}
        {editorMode === 'custom' && (
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-industrial-600 dark:text-acid-500 uppercase tracking-widest flex items-center gap-2">
              <ClipboardPaste size={12} />
              {t('custom_prompt_label') || 'Custom Prompt'}
            </label>
            <div className="relative group">
              <textarea 
                value={customPrompt} 
                onChange={e => setCustomPrompt(e.target.value)} 
                placeholder={t('custom_prompt_placeholder') || 'Paste or write your custom prompt here to share with the community...'}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 p-4 min-h-[300px] text-sm focus:outline-none focus:ring-1 focus:ring-industrial-500 dark:focus:ring-acid-500 transition-colors resize-none text-zinc-900 dark:text-zinc-300 shadow-sm font-mono" 
              />
              <button 
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    setCustomPrompt(text);
                  } catch (err) {
                    console.error('Failed to read clipboard:', err);
                  }
                }}
                className="absolute top-2 right-2 p-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                title={t('paste_from_clipboard') || 'Paste from clipboard'}
              >
                <ClipboardPaste size={14} />
              </button>
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-mono">
              {t('custom_prompt_hint') || 'Share prompts you\'ve created elsewhere with the community'}
            </p>
          </div>
        )}

        {/* MAGIC GENERATOR MODE */}
        {editorMode === 'magic' && (
          <>
            {/* PROJECT UNDERSTANDING */}
            <CollapsibleSection 
              title={t('project_understanding') || 'Project Understanding'} 
              icon={Scan}
              defaultOpen={false}
            >
              <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-mono mb-3">
                {t('project_understanding_hint') || 'Describe your project or paste your file structure. AI will auto-detect everything.'}
              </p>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mb-1 block">
                    {t('project_description_label') || 'Project Description'}
                  </label>
                  <textarea
                    value={projectDescription}
                    onChange={e => setProjectDescription(e.target.value)}
                    placeholder={t('project_description_placeholder') || 'Describe what your project does, its goals, target users, and key features...'}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 p-3 min-h-[100px] text-sm focus:outline-none focus:ring-1 focus:ring-industrial-500 dark:focus:ring-acid-500 transition-colors resize-none text-zinc-900 dark:text-zinc-300 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                    <FolderTree size={10} />
                    {t('project_structure_label') || 'File / Folder Structure (Optional)'}
                  </label>
                  <textarea
                    value={projectStructure}
                    onChange={e => setProjectStructure(e.target.value)}
                    placeholder={t('project_structure_placeholder') || 'Paste your project file tree, package.json, or code snippets here...'}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 p-3 min-h-[80px] text-xs focus:outline-none focus:ring-1 focus:ring-industrial-500 dark:focus:ring-acid-500 transition-colors resize-none text-zinc-900 dark:text-zinc-300 font-mono"
                  />
                </div>
                <button
                  onClick={handleProjectAnalyze}
                  disabled={isProjectAnalyzing || (!projectDescription.trim() && !projectStructure.trim())}
                  className="w-full bg-industrial-600 dark:bg-acid-600 text-white dark:text-black text-xs font-bold px-4 py-3 flex items-center justify-center gap-2 hover:bg-industrial-500 dark:hover:bg-acid-500 transition-colors uppercase tracking-wider disabled:opacity-50"
                >
                  {isProjectAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Scan size={16} />}
                  <span>{isProjectAnalyzing ? (t('analyzing') || 'Analyzing...') : (t('analyze_project') || 'Analyze Project')}</span>
                </button>

                {/* Analysis Results */}
                {projectAnalysis && (
                  <div className="border border-industrial-300 dark:border-acid-700 bg-industrial-50 dark:bg-acid-900/10 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-industrial-600 dark:text-acid-400 uppercase tracking-widest flex items-center gap-2">
                        <Lightbulb size={12} />
                        {t('analysis_results') || 'Analysis Results'}
                      </span>
                    </div>
                    {projectAnalysis.projectSummary && (
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        {projectAnalysis.projectSummary}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      {projectAnalysis.detectedCategory && (
                        <div className="bg-white dark:bg-zinc-800 p-2 border border-zinc-200 dark:border-zinc-700">
                          <span className="text-zinc-500 uppercase">Category:</span>
                          <span className="ml-1 font-bold text-zinc-800 dark:text-zinc-200">{projectAnalysis.detectedCategory}</span>
                        </div>
                      )}
                      {projectAnalysis.suggestedTone && (
                        <div className="bg-white dark:bg-zinc-800 p-2 border border-zinc-200 dark:border-zinc-700">
                          <span className="text-zinc-500 uppercase">Tone:</span>
                          <span className="ml-1 font-bold text-zinc-800 dark:text-zinc-200">{projectAnalysis.suggestedTone}</span>
                        </div>
                      )}
                      {projectAnalysis.suggestedSkills && projectAnalysis.suggestedSkills.length > 0 && (
                        <div className="col-span-2 bg-white dark:bg-zinc-800 p-2 border border-zinc-200 dark:border-zinc-700">
                          <span className="text-zinc-500 uppercase">Skills:</span>
                          <span className="ml-1 font-bold text-zinc-800 dark:text-zinc-200">{projectAnalysis.suggestedSkills.join(', ')}</span>
                        </div>
                      )}
                      {projectAnalysis.suggestedSecurityChecks && projectAnalysis.suggestedSecurityChecks.length > 0 && (
                        <div className="col-span-2 bg-white dark:bg-zinc-800 p-2 border border-zinc-200 dark:border-zinc-700">
                          <span className="text-zinc-500 uppercase">Security:</span>
                          <span className="ml-1 font-bold text-zinc-800 dark:text-zinc-200">{projectAnalysis.suggestedSecurityChecks.join(', ')}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={applyProjectAnalysis}
                      className="w-full bg-emerald-600 dark:bg-emerald-500 text-white dark:text-black text-xs font-bold px-4 py-2.5 flex items-center justify-center gap-2 hover:bg-emerald-500 dark:hover:bg-emerald-400 transition-colors uppercase tracking-wider"
                    >
                      <CheckCircle size={14} />
                      <span>{t('apply_all') || 'Apply All Suggestions'}</span>
                    </button>
                  </div>
                )}
              </div>
            </CollapsibleSection>

            {/* Magic Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-industrial-600 dark:text-acid-500 uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={12} />
                {t('magic_label')}
              </label>
              <div className="relative group">
                <div className="relative flex gap-0 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 p-0 shadow-sm focus-within:ring-1 focus-within:ring-industrial-500 dark:focus-within:ring-acid-500 transition-all">
                  <input 
                    type="text" 
                    value={magicInput} 
                    onChange={e => setMagicInput(e.target.value)} 
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleMagicGenerate();
                      }
                    }}
                    placeholder={t('magic_placeholder')}
                    className="w-full bg-transparent outline-none text-sm px-4 py-3 text-zinc-900 dark:text-white placeholder:text-zinc-400 font-mono" 
                  />
                  <button 
                    onClick={handleMagicGenerate} 
                    disabled={isAiLoading} 
                    className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white px-4 border-l border-zinc-300 dark:border-zinc-700 hover:bg-industrial-500 dark:hover:bg-acid-500 hover:text-white dark:hover:text-black transition-colors disabled:opacity-50"
                  >
                    {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-6">
              {/* CATEGORY SELECTION */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest border-l-2 border-industrial-500 dark:border-acid-500 pl-2">Category</label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {['web', 'mobile', 'windows', 'engineering', 'fluid_mechanics', 'general'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={`p-3 border text-xs font-bold uppercase tracking-wider flex flex-col items-center gap-2 transition-all ${
                        selectedCategory === cat 
                          ? 'bg-industrial-600 dark:bg-acid-600 text-white dark:text-black border-industrial-600 dark:border-acid-600' 
                          : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:border-industrial-500 dark:hover:border-acid-500'
                      }`}
                    >
                      {cat === 'web' && <Globe size={18} />}
                      {cat === 'mobile' && <Smartphone size={18} />}
                      {cat === 'windows' && <Monitor size={18} />}
                      {cat === 'picture' && <ImageIcon size={18} />}
                      {cat === 'engineering' && <Wrench size={18} />}
                      {cat === 'fluid_mechanics' && <Waves size={18} />}
                      {cat === 'general' && <BookOpen size={18} />}
                      {t(`categories.${cat}`) || cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* TARGET AI ASSISTANT / TOOL */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-l-2 border-industrial-500 dark:border-acid-500 pl-2">
                  <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">
                    Target AI Assistant
                  </label>
                  <span className="text-[9px] text-industrial-500 dark:text-acid-400 font-mono font-bold bg-industrial-100 dark:bg-acid-900/30 px-1.5 py-0.5 rounded-sm">
                    Dynamic Prompt Tuning
                  </span>
                </div>
                
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { key: 'claude', name: 'Claude', color: 'border-orange-500 hover:border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-500/5', activeColor: 'bg-orange-500 text-white dark:text-black border-orange-500' },
                    { key: 'gemini', name: 'Gemini', color: 'border-blue-500 hover:border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-500/5', activeColor: 'bg-blue-600 text-white dark:text-black border-blue-600' },
                    { key: 'chatgpt', name: 'ChatGPT', color: 'border-emerald-500 hover:border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5', activeColor: 'bg-emerald-600 text-white dark:text-black border-emerald-600' },
                    { key: 'cursor', name: 'Cursor', color: 'border-cyan-500 hover:border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-500/5', activeColor: 'bg-cyan-500 text-white dark:text-black border-cyan-500' },
                    { key: 'copilot', name: 'Copilot', color: 'border-purple-500 hover:border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-500/5', activeColor: 'bg-purple-600 text-white dark:text-black border-purple-600' },
                  ].map(tool => (
                    <button
                      key={tool.key}
                      onClick={() => editorState.setTargetTool(tool.key)}
                      type="button"
                      className={`p-2 border text-[10px] font-bold uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1 ${
                        editorState.targetTool === tool.key 
                          ? tool.activeColor 
                          : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <span className="font-bold">{tool.name}</span>
                    </button>
                  ))}
                </div>

                <div className="p-4 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                      <Lightbulb size={12} className="text-amber-500" />
                      Which tool is best for what?
                    </span>
                    <span className="text-[9px] text-zinc-400 font-mono">Compare Capabilities</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px] border-b border-zinc-200 dark:border-zinc-800 pb-3">
                    <div>
                      <span className="text-zinc-500 block uppercase">Reasoning:</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        {editorState.targetTool === 'claude' && '★★★★★ (5/5)'}
                        {editorState.targetTool === 'gemini' && '★★★★☆ (4/5)'}
                        {editorState.targetTool === 'chatgpt' && '★★★★☆ (4/5)'}
                        {editorState.targetTool === 'cursor' && '★★★★★ (5/5)'}
                        {editorState.targetTool === 'copilot' && '★★★☆☆ (3/5)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block uppercase">Context Limit:</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        {editorState.targetTool === 'claude' && '★★★★☆ (200K)'}
                        {editorState.targetTool === 'gemini' && '★★★★★ (1M-2M)'}
                        {editorState.targetTool === 'chatgpt' && '★★★☆☆ (128K)'}
                        {editorState.targetTool === 'cursor' && '★★★★☆ (IDE based)'}
                        {editorState.targetTool === 'copilot' && '★★☆☆☆ (Editor local)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block uppercase">Aesthetics / UI:</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        {editorState.targetTool === 'claude' && '★★★★★ (Excellent)'}
                        {editorState.targetTool === 'gemini' && '★★★☆☆ (Moderate)'}
                        {editorState.targetTool === 'chatgpt' && '★★★★☆ (Good)'}
                        {editorState.targetTool === 'cursor' && '★★★★☆ (IDE Custom)'}
                        {editorState.targetTool === 'copilot' && '★★☆☆☆ (Not style-focused)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block uppercase">IDE Integration:</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        {editorState.targetTool === 'claude' && '★☆☆☆☆ (Web app)'}
                        {editorState.targetTool === 'gemini' && '★☆☆☆☆ (Web app)'}
                        {editorState.targetTool === 'chatgpt' && '★☆☆☆☆ (Web app)'}
                        {editorState.targetTool === 'cursor' && '★★★★★ (Native)'}
                        {editorState.targetTool === 'copilot' && '★★★★★ (Extension)'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-mono">
                    {editorState.targetTool === 'claude' && (
                      <span><strong>Claude 3.5 Sonnet:</strong> Recommended for advanced reasoning, front-end visual components, and clean code generation. It excels at complex, modular structures, aesthetic styling, and debugging.</span>
                    )}
                    {editorState.targetTool === 'gemini' && (
                      <span><strong>Gemini 2.5 Pro/Flash:</strong> Recommended for huge codebases, deep context processing, and multi-file code review. Its 1M+ context window makes it unique for analyzing complete repositories.</span>
                    )}
                    {editorState.targetTool === 'chatgpt' && (
                      <span><strong>ChatGPT (GPT-4o):</strong> Recommended for quick scripts, general utilities, logic explanations, and standalone files. Excellent conversational coding assistant for direct copy-paste.</span>
                    )}
                    {editorState.targetTool === 'cursor' && (
                      <span><strong>Cursor IDE:</strong> Recommended for workspace-wide refactoring and real-time project edits. Formats instructions directly as a <code>.cursorrules</code> file to power inline code editing.</span>
                    )}
                    {editorState.targetTool === 'copilot' && (
                      <span><strong>GitHub Copilot:</strong> Recommended for fast, inline, real-time code auto-completions as you type. Formats instructions into a <code>copilot-instructions.md</code> file to direct the extension's context.</span>
                    )}
                  </p>
                </div>
              </div>

              {/* TONE SELECTION */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest border-l-2 border-industrial-500 dark:border-acid-500 pl-2">Tone</label>
                <div className="grid grid-cols-5 gap-2">
                  {['balanced', 'professional', 'creative', 'technical', 'minimalist'].map(tOption => (
                    <button
                      key={tOption}
                      onClick={() => editorState.setTone(tOption)}
                      className={`p-2 border text-[10px] font-bold uppercase tracking-wider transition-all ${
                        editorState.tone === tOption 
                          ? 'bg-industrial-600 dark:bg-acid-600 text-white dark:text-black border-industrial-600 dark:border-acid-600' 
                          : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:border-industrial-500 dark:hover:border-acid-500'
                      }`}
                    >
                      {tOption}
                    </button>
                  ))}
                </div>
              </div>

              {/* STYLE SELECTION */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest border-l-2 border-industrial-500 dark:border-acid-500 pl-2">Style</label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {['modern', 'classic', 'cyberpunk', 'corporate', 'playful', 'futuristic'].map(sOption => (
                    <button
                      key={sOption}
                      onClick={() => editorState.setStyle(sOption)}
                      className={`p-2 border text-[10px] font-bold uppercase tracking-wider transition-all ${
                        editorState.style === sOption 
                          ? 'bg-industrial-600 dark:bg-acid-600 text-white dark:text-black border-industrial-600 dark:border-acid-600' 
                          : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:border-industrial-500 dark:hover:border-acid-500'
                      }`}
                    >
                      {sOption}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest border-l-2 border-industrial-500 dark:border-acid-500 pl-2">{t('role_label')}</label>
                <textarea 
                  value={role} 
                  onChange={e => setRole(e.target.value)} 
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 p-4 min-h-[100px] text-sm focus:outline-none focus:border-industrial-500 dark:focus:border-acid-500 transition-colors resize-none text-zinc-900 dark:text-zinc-300 shadow-sm rounded-none" 
                  placeholder={t('role_placeholder')}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest border-l-2 border-industrial-500 dark:border-acid-500 pl-2">{t('task_label')}</label>
                <textarea 
                  value={task} 
                  onChange={e => setTask(e.target.value)} 
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 p-4 min-h-[140px] text-sm focus:outline-none focus:border-industrial-500 dark:focus:border-acid-500 transition-colors resize-none text-zinc-900 dark:text-zinc-300 shadow-sm rounded-none" 
                  placeholder={t('task_placeholder')}
                />
              </div>
              
              {/* TOOL / TECH STACK (Hidden for Picture) */}
              {selectedCategory !== 'picture' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest border-l-2 border-industrial-500 dark:border-acid-500 pl-2">
                    {['engineering', 'fluid_mechanics', 'general'].includes(selectedCategory) ? (t('tools_label') || 'Tools & Software') : 'Tech Stack'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(() => {
                      let items = [];
                      if (selectedCategory === 'web') items = ['react', 'tailwind', 'threejs', 'nextjs', 'vite', 'vanilla_js', 'typescript'];
                      else if (selectedCategory === 'mobile') items = ['flutter', 'swift', 'kotlin', 'objective_c'];
                      else if (selectedCategory === 'windows') items = ['c_sharp', 'dot_net'];
                      else if (selectedCategory === 'engineering') items = ['matlab', 'python_sci', 'latex', 'solidworks', 'autocad', 'excel_data'];
                      else if (selectedCategory === 'fluid_mechanics') items = ['ansys_fluent', 'openfoam', 'matlab', 'python_sci', 'latex', 'excel_data'];
                      else if (selectedCategory === 'general') items = ['python_sci', 'latex', 'google_scholar', 'jupyter', 'excel_data'];
                      return items.map(tech => {
                        const iconLookup = {
                          react: Code2, tailwind: Palette, threejs: Box,
                          nextjs: Layers, vite: Zap, vanilla_js: Globe, typescript: Shield,
                          flutter: Smartphone, swift: Command, kotlin: Smartphone, objective_c: Command,
                          c_sharp: Monitor, dot_net: Monitor,
                          matlab: Terminal, python_sci: Code2, latex: FileText,
                          ansys_fluent: Waves, openfoam: Waves,
                          solidworks: Box, autocad: Box,
                          google_scholar: BookOpen, jupyter: Code2, excel_data: Terminal
                        };
                        const Icon = iconLookup[tech] || Code2;
                        const displayName = tech.replace(/_/g, ' ');
                        return (
                        <label key={tech} className="flex items-start gap-3 p-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 cursor-pointer hover:border-industrial-500 dark:hover:border-acid-500 transition-colors group">
                          <div className={`w-5 h-5 mt-0.5 border flex items-center justify-center shrink-0 transition-colors ${techStack[tech] ? 'bg-industrial-500 dark:bg-acid-500 border-industrial-500 dark:border-acid-500' : 'border-zinc-400 dark:border-zinc-600 group-hover:border-industrial-500 dark:group-hover:border-acid-500'}`}>
                            {techStack[tech] && <CheckCircle size={12} className="text-white dark:text-black" />}
                          </div>
                          <input 
                            type="checkbox" 
                            checked={!!techStack[tech]} 
                            onChange={() => setTechStack(prev => ({ ...prev, [tech]: !prev[tech] }))}
                            className="hidden"
                          />
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <Icon size={14} className="text-zinc-400 dark:text-zinc-500" />
                              <span className="text-xs font-bold uppercase text-zinc-700 dark:text-zinc-300">{displayName}</span>
                            </div>
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-500 font-mono mt-1 leading-tight">{t(`tech_descriptions.${tech}`) || ''}</span>
                          </div>
                        </label>
                      )})
                    })()}
                  </div>
                </div>
              )}

              {/* SECURITY & VALIDATION CHECKS */}
              <CollapsibleSection 
                title={t('security_checks') || 'Security & Validation'} 
                icon={Shield}
                defaultOpen={false}
                badge={activeSecurityCount > 0 ? activeSecurityCount : null}
              >
                <div className="grid grid-cols-2 gap-2">
                  {getSecurityOptionsForCategory && getSecurityOptionsForCategory(selectedCategory).map(option => (
                    <label 
                      key={option.key} 
                      className="flex items-center gap-3 p-3 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 cursor-pointer hover:border-industrial-500 dark:hover:border-acid-500 transition-colors group"
                    >
                      <div className={`w-4 h-4 border flex items-center justify-center shrink-0 transition-colors ${
                        securityChecks[option.key] 
                          ? 'bg-emerald-500 dark:bg-emerald-400 border-emerald-500 dark:border-emerald-400' 
                          : 'border-zinc-400 dark:border-zinc-600 group-hover:border-emerald-500'
                      }`}>
                        {securityChecks[option.key] && <CheckCircle size={10} className="text-white dark:text-black" />}
                      </div>
                      <input 
                        type="checkbox" 
                        checked={!!securityChecks[option.key]} 
                        onChange={() => toggleSecurityCheck(option.key)}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={12} className="text-zinc-400 dark:text-zinc-500" />
                        <span className="text-[10px] font-bold uppercase text-zinc-700 dark:text-zinc-300 tracking-wider">{option.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </CollapsibleSection>

              {/* AI SKILLS SELECTION */}
              <CollapsibleSection 
                title={t('skills_selection') || 'AI Skills'} 
                icon={Zap}
                defaultOpen={false}
                badge={activeSkillCount > 0 ? activeSkillCount : null}
              >
                <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-mono mb-2">
                  {t('skills_hint') || 'Select the capabilities you need from the AI assistant.'}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {SKILL_OPTIONS && SKILL_OPTIONS.map(skill => {
                    const SkillIcon = skillIconLookup[skill.key] || Zap;
                    return (
                      <label 
                        key={skill.key} 
                        className={`flex items-start gap-3 p-3 border cursor-pointer transition-all group ${
                          selectedSkills[skill.key]
                            ? 'border-industrial-400 dark:border-acid-600 bg-industrial-50 dark:bg-acid-900/10'
                            : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:border-industrial-500 dark:hover:border-acid-500'
                        }`}
                      >
                        <div className={`w-4 h-4 mt-0.5 border flex items-center justify-center shrink-0 transition-colors ${
                          selectedSkills[skill.key]
                            ? 'bg-industrial-500 dark:bg-acid-500 border-industrial-500 dark:border-acid-500'
                            : 'border-zinc-400 dark:border-zinc-600'
                        }`}>
                          {selectedSkills[skill.key] && <CheckCircle size={10} className="text-white dark:text-black" />}
                        </div>
                        <input 
                          type="checkbox" 
                          checked={!!selectedSkills[skill.key]} 
                          onChange={() => toggleSkill(skill.key)}
                          className="hidden"
                        />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <SkillIcon size={12} className={selectedSkills[skill.key] ? 'text-industrial-500 dark:text-acid-400' : 'text-zinc-400 dark:text-zinc-500'} />
                            <span className="text-[10px] font-bold uppercase text-zinc-700 dark:text-zinc-300 tracking-wider">{skill.label}</span>
                          </div>
                          <span className="text-[9px] text-zinc-500 dark:text-zinc-500 font-mono mt-1 leading-tight">{skill.desc}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </CollapsibleSection>

              {/* OUTPUT FORMAT OPTIONS */}
              <CollapsibleSection 
                title={t('output_options') || 'Output Options'} 
                icon={FileText}
                defaultOpen={false}
              >
                {/* Format Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">
                    {t('output_format') || 'Format'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'structured', label: t('format_structured') || 'Structured', icon: Layers },
                      { key: 'conversational', label: t('format_conversational') || 'Conversational', icon: BookOpen },
                      { key: 'checklist', label: t('format_checklist') || 'Checklist', icon: CheckCircle },
                    ].map(fmt => {
                      const FmtIcon = fmt.icon;
                      return (
                        <button
                          key={fmt.key}
                          onClick={() => setOutputFormat(fmt.key)}
                          className={`p-2.5 border text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                            outputFormat === fmt.key
                              ? 'bg-industrial-600 dark:bg-acid-600 text-white dark:text-black border-industrial-600 dark:border-acid-600'
                              : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:border-industrial-500 dark:hover:border-acid-500'
                          }`}
                        >
                          <FmtIcon size={12} />
                          {fmt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section Toggles */}
                <div className="space-y-2 mt-3">
                  <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">
                    {t('included_sections') || 'Included Sections'}
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { key: 'roleSection', label: t('section_role') || 'Role' },
                      { key: 'taskSection', label: t('section_task') || 'Task' },
                      { key: 'stackSection', label: t('section_stack') || 'Stack/Tools' },
                      { key: 'toneSection', label: t('section_tone') || 'Tone & Style' },
                      { key: 'methodologySection', label: t('section_methodology') || 'Methodology' },
                      { key: 'rulesSection', label: t('section_rules') || 'Rules' },
                      { key: 'securitySection', label: t('section_security') || 'Security' },
                      { key: 'skillsSection', label: t('section_skills') || 'Skills' },
                    ].map(sec => (
                      <label key={sec.key} className="flex items-center gap-2 p-2 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors rounded-sm">
                        <div className={`w-3.5 h-3.5 border flex items-center justify-center shrink-0 transition-colors ${
                          outputSections[sec.key]
                            ? 'bg-industrial-500 dark:bg-acid-500 border-industrial-500 dark:border-acid-500'
                            : 'border-zinc-400 dark:border-zinc-600'
                        }`}>
                          {outputSections[sec.key] && <CheckCircle size={8} className="text-white dark:text-black" />}
                        </div>
                        <input 
                          type="checkbox" 
                          checked={!!outputSections[sec.key]} 
                          onChange={() => toggleOutputSection(sec.key)}
                          className="hidden"
                        />
                        <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400">{sec.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CollapsibleSection>
            </div>
          </>
        )}
      </div>

      <div className="lg:col-span-5">
        <div className="sticky top-24">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 shadow-lg flex flex-col max-h-[60vh] md:max-h-[600px]">
            <div className="p-3 border-b border-zinc-300 dark:border-zinc-700 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <Terminal size={12} />
                PREVIEW.MD
              </span>
              <div className="flex items-center gap-2">
                {editorMode === 'magic' && outputFormat && (
                  <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase">
                    {outputFormat}
                  </span>
                )}
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-zinc-300 dark:bg-zinc-700" />
                  <div className="w-2 h-2 bg-zinc-300 dark:bg-zinc-700" />
                  <div className="w-2 h-2 bg-zinc-300 dark:bg-zinc-700" />
                </div>
              </div>
            </div>
            <div className="p-6 font-mono text-xs overflow-y-auto custom-scrollbar grow bg-zinc-50 dark:bg-black text-zinc-700 dark:text-zinc-400 leading-relaxed tracking-wide border-b border-zinc-300 dark:border-zinc-700">
              <pre className="whitespace-pre-wrap">{getPreviewContent()}</pre>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 shrink-0 flex gap-2">
              <button 
                onClick={() => {
                  const content = getPreviewContent();
                  const blob = new Blob([content], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a'); a.href = url; a.download = 'prompt.md'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
                }} 
                className="p-3 border border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Download size={18} />
              </button>
              <button onClick={handleSavePrompt} className="grow bg-industrial-600 dark:bg-acid-600 text-white dark:text-black text-xs font-bold px-4 py-3 flex items-center justify-center gap-2 hover:bg-industrial-500 dark:hover:bg-acid-500 transition-colors uppercase tracking-wider">
                {copied ? <CheckCircle size={16}/> : <Save size={16} />} 
                <span>{t('save_prompt')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}