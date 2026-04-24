import React from 'react';
import { Home, Search, User, BookOpen } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, t }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-zinc-300 dark:border-zinc-800 pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        <button 
          onClick={() => setActiveTab('editor')}
          className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'editor' ? 'text-industrial-600 dark:text-acid-500 bg-zinc-50 dark:bg-zinc-900' : 'text-zinc-400'}`}
        >
          <Home size={20} strokeWidth={activeTab === 'editor' ? 2.5 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-wider">{t('nav_editor')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('library')}
          className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'library' ? 'text-industrial-600 dark:text-acid-500 bg-zinc-50 dark:bg-zinc-900' : 'text-zinc-400'}`}
        >
          <BookOpen size={20} strokeWidth={activeTab === 'library' ? 2.5 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-wider">{t('nav_library') || 'Library'}</span>
        </button>
        <button 
          onClick={() => setActiveTab('community')}
          className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'community' ? 'text-industrial-600 dark:text-acid-500 bg-zinc-50 dark:bg-zinc-900' : 'text-zinc-400'}`}
        >
          <Search size={20} strokeWidth={activeTab === 'community' ? 2.5 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-wider">{t('nav_community')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('account')}
          className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'account' ? 'text-industrial-600 dark:text-acid-500 bg-zinc-50 dark:bg-zinc-900' : 'text-zinc-400'}`}
        >
          <User size={20} strokeWidth={activeTab === 'account' ? 2.5 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-wider">{t('nav_account')}</span>
        </button>
      </div>
    </nav>
  );
}
