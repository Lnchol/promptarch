import React from 'react';
import { Sparkles, Loader2, Wand2, Globe, Smartphone, Monitor, Image as ImageIcon, Code2, Palette, Box, Command, CheckCircle, Terminal, Download, Save, ClipboardPaste, FileText, Wrench, Waves, BookOpen } from 'lucide-react';

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
    handleMagicGenerate
  } = editorState;

  // Get content for preview based on mode
  const getPreviewContent = () => {
    if (editorMode === 'custom') {
      return customPrompt || t('custom_prompt_placeholder') || 'Your custom prompt will appear here...';
    }
    return generatePromptContent();
  };

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
              
              {/* TECH STACK (Hidden for non-software categories) */}
              {['web', 'mobile', 'windows'].includes(selectedCategory) && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest border-l-2 border-industrial-500 dark:border-acid-500 pl-2">Tech Stack</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['react', 'tailwind', 'threejs', 'flutter', 'swift', 'kotlin', 'objective_c', 'c_sharp', 'dot_net'].map(tech => {
                      const Icon = tech === 'react' ? Code2 : tech === 'tailwind' ? Palette : tech === 'threejs' ? Box : tech === 'swift' || tech === 'objective_c' ? Command : tech === 'c_sharp' || tech === 'dot_net' ? Monitor : Smartphone;
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
                            <span className="text-xs font-bold uppercase text-zinc-700 dark:text-zinc-300">{tech.replace('_', ' ')}</span>
                          </div>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-500 font-mono mt-1 leading-tight">{t(`tech_descriptions.${tech}`)}</span>
                        </div>
                      </label>
                    )})}
                  </div>
                </div>
              )}
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
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-zinc-300 dark:bg-zinc-700" />
                <div className="w-2 h-2 bg-zinc-300 dark:bg-zinc-700" />
                <div className="w-2 h-2 bg-zinc-300 dark:bg-zinc-700" />
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