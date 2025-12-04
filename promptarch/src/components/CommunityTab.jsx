import React from 'react';
import { Globe, Heart, Lock } from 'lucide-react';

export default function CommunityTab({ 
  trending, 
  user, 
  handleLike, 
  setShowSubModal, 
  t,
  setRole,
  setTask,
  setActiveTab
}) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
          <Globe size={20} className="text-industrial-500 dark:text-acid-500" />
          {t('community_title')}
        </h2>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...trending].sort((a, b) => b.likes - a.likes).map((p, index) => {
          const isLocked = index < 3 && !user?.is_pro;
          
          return (
            <div key={p.id} className={`group bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 p-6 hover:border-industrial-500 dark:hover:border-acid-500 transition-colors duration-300 relative overflow-hidden ${isLocked ? 'cursor-not-allowed' : ''}`}>
              {/* Rank Badge for Top 3 */}
              {index < 3 && (
                <div className="absolute top-0 left-0 bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 z-20">
                  #{index + 1} RANKED
                </div>
              )}

              <div className="absolute top-0 right-0 w-8 h-8 bg-zinc-100 dark:bg-zinc-800 -mr-4 -mt-4 rotate-45 border border-zinc-300 dark:border-zinc-700" />
              
              <div className={`transition-all duration-300 ${isLocked ? 'blur-sm select-none opacity-50' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700">
                      {p.username[0]}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-white uppercase">{p.username}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{new Date(p.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <button onClick={() => !isLocked && handleLike(p.id)} disabled={isLocked} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-pink-500 transition-colors">
                    <Heart size={14} className={p.likes > 0 ? "fill-pink-500 text-pink-500" : ""} /> 
                    {p.likes}
                  </button>
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-2 line-clamp-1 uppercase tracking-tight">{p.role}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 mb-6 leading-relaxed font-mono">{p.task}</p>
              </div>

              {/* Locked Overlay */}
              {isLocked ? (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/10 dark:bg-black/10 backdrop-blur-[2px]">
                  <Lock size={24} className="text-zinc-900 dark:text-white mb-2" />
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white mb-3">Top 3 Locked</p>
                  <button 
                    onClick={() => setShowSubModal(true)}
                    className="bg-industrial-600 dark:bg-acid-600 text-white dark:text-black px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-industrial-500 dark:hover:bg-acid-500 transition-colors shadow-lg"
                  >
                    {t('upgrade_btn')}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {setRole(p.role); setTask(p.task); setActiveTab('editor');}} 
                  className="w-full py-2 text-[10px] font-bold uppercase tracking-widest border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-colors mt-4 relative z-0"
                >
                  {t('use_template')}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
