import React, { useState, useMemo } from 'react';
import { 
  Search, Code2, Wrench, Waves, Calendar, BookOpen, 
  Copy, CheckCircle, ExternalLink, Download, ArrowRight,
  Filter, Building2, Cpu, GitBranch, Wind, Zap, Sigma, Mail, Brain, Database
} from 'lucide-react';
import { promptLibrary } from '../utils/promptLibraryData';

// Map icon names to Lucide components
const iconMap = {
  Code2, Wrench, Waves, Calendar, BookOpen, Building2, Cpu, GitBranch, Wind, Zap, Sigma, Mail, Brain, Database, Search
};

export default function LibraryTab({ t, setActiveTab, loadPromptIntoEditor }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedPrompt, setExpandedPrompt] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const categories = [
    { id: 'all', label: 'All Prompts', icon: Search },
    { id: 'dev', label: 'Software Dev', icon: Code2 },
    { id: 'engineering', label: 'Engineering', icon: Wrench },
    { id: 'fluid_mechanics', label: 'Fluid Mechanics', icon: Waves },
    { id: 'daily', label: 'Daily Life', icon: Calendar },
    { id: 'general', label: 'General Knowledge', icon: BookOpen },
  ];

  // Filter prompts based on search and category
  const filteredPrompts = useMemo(() => {
    return promptLibrary.filter(prompt => {
      const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
      
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        prompt.title.toLowerCase().includes(searchLower) ||
        prompt.description.toLowerCase().includes(searchLower) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(searchLower));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleCopy = (promptText, id) => {
    navigator.clipboard.writeText(promptText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUseInEditor = (prompt) => {
    loadPromptIntoEditor(prompt.prompt);
    setActiveTab('editor');
  };

  const handleDownload = (prompt) => {
    const blob = new Blob([prompt.prompt], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); 
    a.href = url; 
    a.download = `${prompt.id}.md`; 
    document.body.appendChild(a); 
    a.click(); 
    document.body.removeChild(a);
  };

  const getDifficultyColor = (diff) => {
    switch(diff?.toLowerCase()) {
      case 'beginner': return 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30';
      case 'intermediate': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'advanced': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30';
      case 'expert': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default: return 'text-zinc-600 bg-zinc-100 dark:text-zinc-400 dark:bg-zinc-800';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Filters */}
      <div className="space-y-4 sticky top-[64px] md:top-[64px] bg-zinc-50/95 dark:bg-black/95 backdrop-blur z-10 py-4 -mx-4 px-4 md:mx-0 md:px-0">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_prompts') || "Search templates by title, description, or tags..."}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-industrial-500 dark:focus:border-acid-500 transition-colors text-zinc-900 dark:text-zinc-300"
          />
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto custom-scrollbar pb-2 gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors border ${
                selectedCategory === cat.id
                  ? 'bg-industrial-600 dark:bg-acid-600 text-white dark:text-black border-industrial-600 dark:border-acid-600'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:border-industrial-500 dark:hover:border-acid-500'
              }`}
            >
              <cat.icon size={14} />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid md:grid-cols-12 gap-6 items-start">
        
        {/* Prompt Grid */}
        <div className={`${expandedPrompt ? 'md:col-span-5 hidden md:block' : 'md:col-span-12'} transition-all duration-300`}>
          <div className={`grid gap-4 ${expandedPrompt ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {filteredPrompts.length > 0 ? (
              filteredPrompts.map(prompt => {
                const IconComponent = iconMap[prompt.icon] || Code2;
                const isSelected = expandedPrompt?.id === prompt.id;

                return (
                  <div 
                    key={prompt.id}
                    onClick={() => setExpandedPrompt(prompt)}
                    className={`group bg-white dark:bg-zinc-900 border p-5 cursor-pointer transition-all hover:shadow-md ${
                      isSelected 
                        ? 'border-industrial-500 dark:border-acid-500 ring-1 ring-industrial-500 dark:ring-acid-500' 
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-industrial-400 dark:hover:border-acid-400'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className={`p-2 rounded-sm ${isSelected ? 'bg-industrial-100 dark:bg-acid-900/30 text-industrial-600 dark:text-acid-500' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:text-industrial-500 dark:group-hover:text-acid-500 transition-colors'}`}>
                        <IconComponent size={20} />
                      </div>
                      {prompt.difficulty && (
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm ${getDifficultyColor(prompt.difficulty)}`}>
                          {prompt.difficulty}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-2 line-clamp-1 group-hover:text-industrial-600 dark:group-hover:text-acid-500 transition-colors">
                      {prompt.title}
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-4 h-8">
                      {prompt.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {prompt.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5">
                          #{tag}
                        </span>
                      ))}
                      {prompt.tags.length > 3 && (
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-600">+{prompt.tags.length - 3}</span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center text-zinc-600 dark:text-zinc-400 border border-dashed border-zinc-300 dark:border-zinc-700">
                <Search size={32} className="mx-auto mb-4 opacity-50" />
                <p>{t('no_prompts_found') || "No prompt templates found matching your search."}</p>
              </div>
            )}
          </div>
        </div>

        {/* Expanded View */}
        {expandedPrompt && (
          <div className="md:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl sticky top-[140px] md:top-[160px] max-h-[70vh] md:max-h-[calc(100vh-200px)] flex flex-col">
            
            {/* Expanded Header */}
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setExpandedPrompt(null)}
                    className="md:hidden p-1.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                  >
                    <ArrowRight size={16} className="rotate-180" />
                  </button>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-tight">
                    {expandedPrompt.title}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDownload(expandedPrompt)}
                    className="p-2 text-zinc-600 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors"
                    title="Download Markdown"
                  >
                    <Download size={16} />
                  </button>
                  <button 
                    onClick={() => handleUseInEditor(expandedPrompt)}
                    className="p-2 text-industrial-600 dark:text-acid-500 hover:bg-industrial-50 dark:hover:bg-acid-900/30 border border-industrial-200 dark:border-acid-800 transition-colors flex items-center gap-2"
                    title="Use in Editor"
                  >
                    <ExternalLink size={16} />
                    <span className="hidden sm:inline text-xs font-bold uppercase">Use in Editor</span>
                  </button>
                </div>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {expandedPrompt.description}
              </p>
            </div>

            {/* Prompt Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar grow bg-zinc-50 dark:bg-black font-mono text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <pre className="whitespace-pre-wrap">{expandedPrompt.prompt}</pre>
            </div>

            {/* Expanded Footer / Copy Button */}
            <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => handleCopy(expandedPrompt.prompt, expandedPrompt.id)}
                className={`w-full py-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  copiedId === expandedPrompt.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-industrial-600 dark:hover:bg-acid-500 hover:text-white dark:hover:text-black'
                }`}
              >
                {copiedId === expandedPrompt.id ? (
                  <><CheckCircle size={16} /> Copied to Clipboard!</>
                ) : (
                  <><Copy size={16} /> Copy Full Prompt</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
