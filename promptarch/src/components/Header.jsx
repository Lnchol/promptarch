import React, { useState } from 'react';
import { Cpu, Globe, Sun, Moon } from 'lucide-react';

export default function Header({ t, theme, toggleTheme, lang, setLang, activeTab, setActiveTab }) {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  return (
    <>
      {/* DESKTOP HEADER */}
      <header className="hidden md:block sticky top-0 z-50 bg-zinc-50/90 dark:bg-black/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-900 dark:bg-acid-500 rounded-none flex items-center justify-center border border-zinc-900 dark:border-acid-400">
              <Cpu size={18} className="text-white dark:text-black" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white uppercase">
              {t('app_name')}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800">
              {['editor', 'library', 'community', 'account'].map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)} 
                  className={`uppercase text-xs font-bold px-4 py-1.5 transition-all flex items-center gap-2 ${
                    activeTab === tab 
                      ? 'bg-white dark:bg-zinc-800 text-industrial-600 dark:text-acid-400 border border-zinc-300 dark:border-zinc-700 shadow-sm' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-300'
                  }`}
                >
                  {t(`nav_${tab}`) || tab}
                </button>
              ))}
            </nav>

            <div className="h-6 w-px bg-zinc-300 dark:bg-zinc-800" />

            <div className="relative">
              <button 
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="p-2 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-2"
              >
                <Globe size={18} />
                <span className="text-xs font-bold uppercase">{lang}</span>
              </button>
              
              {langDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 shadow-xl z-50 flex flex-col">
                  {['en', 'tr', 'de', 'es', 'jp', 'cn'].map(l => (
                    <button 
                      key={l}
                      onClick={() => {setLang(l); setLangDropdownOpen(false);}}
                      className="px-4 py-3 text-left text-xs font-bold uppercase hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                    >
                      {l === 'en' ? 'English' : l === 'tr' ? 'Türkçe' : l === 'de' ? 'Deutsch' : l === 'es' ? 'Español' : l === 'jp' ? '日本語' : '中文'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={toggleTheme} 
              aria-label="Toggle theme"
              className="p-2 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE HEADER */}
      <header className="md:hidden sticky top-0 z-50 bg-zinc-50/90 dark:bg-black/90 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 px-4 h-14 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-zinc-900 dark:bg-acid-500 rounded-none flex items-center justify-center">
              <Cpu size={16} className="text-white dark:text-black" />
            </div>
            <h1 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
              PromptArch
            </h1>
          </div>
          <button 
            onClick={toggleTheme} 
            aria-label="Toggle theme"
            className="p-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
      </header>
    </>
  );
}
