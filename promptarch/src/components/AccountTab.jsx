import React from 'react';
import { User, LogOut, Zap, LayoutTemplate, Share2, PenTool } from 'lucide-react';

export default function AccountTab({ 
  user, 
  myPrompts, 
  handleToggleShare, 
  setShowAuthModal, 
  setShowSubModal, 
  setAuthMode, 
  logout, 
  cancelSubscription,
  t, 
  setRole, 
  setTask, 
  setActiveTab 
}) {
  return (
    <div className="max-w-2xl mx-auto py-8">
      {!user ? (
        <div className="text-center space-y-8 border border-zinc-300 dark:border-zinc-700 p-8 bg-white dark:bg-zinc-900">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 mx-auto flex items-center justify-center mb-6 border border-zinc-300 dark:border-zinc-700">
            <User size={32} className="text-zinc-400" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight">{t('sign_in_title')}</h2>
          <p className="text-zinc-500 max-w-sm mx-auto text-sm font-mono">{t('sign_in_desc')}</p>
          <div className="flex flex-col gap-3 max-w-xs mx-auto pt-4">
            <button onClick={() => {setAuthMode('login'); setShowAuthModal(true);}} className="w-full bg-industrial-600 dark:bg-acid-600 text-white dark:text-black py-3 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity">{t('login')}</button>
            <button onClick={() => {setAuthMode('register'); setShowAuthModal(true);}} className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">{t('signup')}</button>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Profile Header */}
          <div className="flex items-center gap-6 pb-8 border-b border-zinc-300 dark:border-zinc-700">
            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl font-bold text-zinc-500 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700">
              {user.username[0]}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-wider">{user.username}</h2>
              <div className="flex items-center gap-3 mt-3">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 border ${user.is_pro ? 'bg-industrial-50 border-industrial-200 text-industrial-700 dark:bg-acid-900/20 dark:border-acid-800 dark:text-acid-400' : 'bg-zinc-100 border-zinc-300 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400'}`}>
                  {user.is_pro ? t('pro_member') : t('free_plan')}
                </span>
                {user.is_pro === 1 && (
                  <>
                    {user.subscription_type === 'yearly' ? (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border border-zinc-200 px-2 py-1 cursor-not-allowed" title="Yearly plans cannot be cancelled early">
                        Yearly Plan
                      </span>
                    ) : user.auto_renew === 0 ? (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500 border border-orange-200 px-2 py-1">
                        Ends {new Date(user.subscription_end_date).toLocaleDateString()}
                      </span>
                    ) : (
                      <button 
                        onClick={() => {
                          if (window.confirm("Cancel auto-renewal? Your access will continue until the end of the billing period.")) {
                            cancelSubscription();
                          }
                        }}
                        className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-600 border border-red-200 hover:border-red-300 px-2 py-1 transition-colors"
                      >
                        Cancel Renewal
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
            <button onClick={logout} className="text-zinc-400 hover:text-red-500 transition-colors p-2 border border-transparent hover:border-red-500">
              <LogOut size={18} />
            </button>
          </div>

          {/* Upgrade Banner */}
          {!user.is_pro && (
            <div className="bg-gradient-to-r from-industrial-600 to-industrial-800 dark:from-acid-600 dark:to-acid-800 p-8 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/20 transition-colors" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <Zap size={24} className="text-yellow-300" />
                  <h3 className="text-xl font-bold uppercase tracking-widest">{t('upgrade_title')}</h3>
                </div>
                <p className="text-white/80 text-sm mb-6 max-w-md font-mono leading-relaxed">{t('upgrade_desc')}</p>
                <button onClick={() => setShowSubModal(true)} className="bg-white text-black px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-zinc-100 transition-colors shadow-lg">
                  {t('upgrade_btn')}
                </button>
              </div>
            </div>
          )}

          {/* Saved Prompts */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <LayoutTemplate size={14} />
              {t('my_prompts')}
            </h3>
            <div className="space-y-3">
              {myPrompts.map(prompt => (
                <div key={prompt.id} className="group flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:border-industrial-500 dark:hover:border-acid-500 transition-colors">
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-white text-sm uppercase">{prompt.role}</div>
                    <div className="text-xs text-zinc-500 mt-1 line-clamp-1 font-mono">{prompt.task}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleToggleShare(prompt.id, prompt.is_shared)}
                      className={`p-2 transition-colors border ${prompt.is_shared ? 'text-industrial-600 border-industrial-200 bg-industrial-50 dark:bg-acid-900/20 dark:text-acid-400 dark:border-acid-800' : 'text-zinc-400 border-transparent hover:border-zinc-300 dark:hover:border-zinc-700'}`}
                    >
                      <Share2 size={16} />
                    </button>
                    <button 
                      onClick={() => {setRole(prompt.role); setTask(prompt.task); setActiveTab('editor');}}
                      className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                    >
                      <PenTool size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
