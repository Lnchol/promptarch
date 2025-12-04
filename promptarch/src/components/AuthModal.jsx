import React, { useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { User, UserPlus, LogIn } from 'lucide-react';

export default function AuthModal({ 
  show, 
  onClose, 
  mode, 
  setMode, 
  onLogin, 
  onRegister, 
  onLoginAnonymously,
  onLinkAccount,
  isAnonymous,
  t 
}) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [turnstileError, setTurnstileError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Skip Turnstile on localhost for development
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Allow bypass on localhost or if Turnstile fails to load
    if (!isLocalhost && !turnstileToken && !turnstileError) {
      alert("Please complete the security check.");
      return;
    }
    setIsLoading(true);
    
    // If anonymous user, link account instead of login/register
    if (isAnonymous && onLinkAccount) {
      const res = await onLinkAccount(form.email, form.password);
      if (res.success) {
        onClose();
        setForm({ email: "", password: "" });
        setTurnstileToken(null);
      } else {
        alert(res.error);
      }
    } else {
      const action = mode === 'login' ? onLogin : onRegister;
      const res = await action(form.email, form.password, turnstileToken);
      if (res.success) {
        onClose();
        setForm({ email: "", password: "" });
        setTurnstileToken(null);
      } else {
        alert(res.error);
      }
    }
    setIsLoading(false);
  };

  const handleGuestLogin = async () => {
    if (onLoginAnonymously) {
      setIsLoading(true);
      const res = await onLoginAnonymously();
      if (res.success) {
        onClose();
      } else {
        alert(res.error);
      }
      setIsLoading(false);
    }
  };

  // Determine modal title and button text
  const getTitle = () => {
    if (isAnonymous) return t('link_account') || 'Link Account';
    return mode === 'login' ? t('welcome_back') : t('create_account');
  };

  const getButtonText = () => {
    if (isAnonymous) return t('link_account') || 'Link Account';
    return mode === 'login' ? t('login') : t('signup');
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-sm p-8 border border-zinc-300 dark:border-zinc-700 shadow-2xl">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 uppercase tracking-widest flex items-center gap-2">
          {isAnonymous ? <UserPlus size={20} /> : <LogIn size={20} />}
          {getTitle()}
        </h2>
        <p className="text-xs text-zinc-500 mb-6 font-mono">
          {isAnonymous 
            ? (t('link_account_hint') || 'Link your account to save your data across devices')
            : t('enter_details')
          }
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-industrial-500 dark:focus:border-acid-500 transition-colors font-mono" 
            value={form.email} 
            onChange={e => setForm({...form, email: e.target.value})} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-industrial-500 dark:focus:border-acid-500 transition-colors font-mono" 
            value={form.password} 
            onChange={e => setForm({...form, password: e.target.value})} 
          />
          
          {/* Only show Turnstile in production */}
          {!isLocalhost && (
            <div className="flex justify-center py-2 min-h-[65px]">
              <Turnstile
                siteKey="0x4AAAAAACDrDlpAZ0k6BkOO"
                onSuccess={(token) => setTurnstileToken(token)}
                onError={() => setTurnstileError(true)}
                options={{
                  theme: 'auto',
                  size: 'normal',
                }}
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-industrial-600 dark:bg-acid-600 text-white dark:text-black font-bold py-3.5 hover:bg-industrial-500 dark:hover:bg-acid-500 transition-colors text-xs uppercase tracking-widest disabled:opacity-50"
          >
            {isLoading ? '...' : getButtonText()}
          </button>
        </form>

        {/* Guest Login Option - only show when not anonymous */}
        {!isAnonymous && onLoginAnonymously && (
          <button 
            onClick={handleGuestLogin}
            disabled={isLoading}
            className="mt-4 w-full border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-bold py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <User size={14} />
            {t('continue_as_guest') || 'Continue as Guest'}
          </button>
        )}

        {/* Toggle between login/signup - only show when not anonymous */}
        {!isAnonymous && (
          <button 
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="mt-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white w-full"
          >
            {mode === 'login' 
              ? (t('no_account') || "Don't have an account? Sign up")
              : (t('have_account') || 'Already have an account? Log in')
            }
          </button>
        )}

        <button 
          onClick={onClose} 
          className="mt-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white w-full"
        >
          {t('cancel')}
        </button>
      </div>
    </div>
  );
}
