import React, { useState } from 'react';
import { Zap, CheckCircle, Lock, Plus } from 'lucide-react';

export default function SubscriptionModal({ show, onClose, onSubscribe, t }) {
  const [isNative, setIsNative] = useState(false);

  if (!show) return null;

  const handleNativeSubscribe = async (platform) => {
    // For Iyzico, we treat 'monthly' and 'yearly' as platforms here for simplicity in the UI call
    // But actually onSubscribe is passed 'monthly' or 'yearly'
  };
  
  const handleIyzicoPayment = async (type) => {
    try {
      const res = await onSubscribe(type); // This now returns the Iyzico response
      if (res && res.status === 'success') {
        // Iyzico returns HTML content for the checkout form
        const checkoutContent = res.checkoutFormContent;
        const scriptMatch = checkoutContent.match(/<script type="text\/javascript">(.*?)<\/script>/s);
        
        // We need to inject this HTML into a container
        const container = document.getElementById('iyzico-checkout-form');
        if (container) {
           container.innerHTML = checkoutContent;
           // Execute the script manually
           if (scriptMatch && scriptMatch[1]) {
             eval(scriptMatch[1]);
           }
        }
      } else {
        alert("Payment initialization failed: " + (res?.errorMessage || "Unknown error"));
      }
    } catch (e) {
      console.error(e);
      alert("Payment Error");
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/90 dark:bg-black/90 backdrop-blur-md flex items-center justify-center z-[70] p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-4xl border border-zinc-300 dark:border-zinc-700 shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh] md:max-h-none overflow-y-auto">
        {/* Left: Value Prop */}
        <div className="md:w-2/5 bg-zinc-100 dark:bg-zinc-800 p-8 md:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6 text-industrial-600 dark:text-acid-500">
              <Zap size={24} />
              <span className="font-bold uppercase tracking-widest">PromptArch Pro</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-4 uppercase tracking-tight">{t('unlock_potential')}</h2>
            <ul className="space-y-4 mt-8">
              {['unlimited', 'public', 'priority', 'early'].map(f => (
                <li key={f} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                  <CheckCircle size={16} className="text-industrial-500 dark:text-acid-500 mt-0.5 shrink-0" />
                  <span>{t(`features.${f}`)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-widest">
              <Lock size={12} />
              {t('secured_stripe')}
            </div>
          </div>
        </div>

        {/* Right: Pricing */}
        <div className="md:w-3/5 p-8 md:p-10 bg-white dark:bg-zinc-900">
          <div className="flex justify-end mb-8">
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
              <Plus size={24} className="rotate-45 text-zinc-400" />
            </button>
          </div>

          <div className="grid gap-4">
            {/* Monthly */}
            <div className="border border-zinc-300 dark:border-zinc-700 p-6 hover:border-industrial-500 dark:hover:border-acid-500 transition-colors cursor-pointer group relative" onClick={() => handleIyzicoPayment('monthly')}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-widest">{t('monthly')}</h3>
                <span className="text-xl font-bold text-zinc-900 dark:text-white">$12.99</span>
              </div>
              <p className="text-xs text-zinc-600 font-mono">{t('billed_monthly')}</p>
            </div>

            {/* Yearly */}
            <div className="border-2 border-industrial-500 dark:border-acid-500 p-6 relative cursor-pointer" onClick={() => handleIyzicoPayment('yearly')}>
              <div className="absolute -top-3 left-6 bg-industrial-500 dark:bg-acid-500 text-white dark:text-black text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
                {t('save_50')}
              </div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-widest">{t('yearly')}</h3>
                <span className="text-xl font-bold text-zinc-900 dark:text-white">$8.99<span className="text-sm font-normal text-zinc-600">/mo</span></span>
              </div>
              <p className="text-xs text-zinc-600 font-mono">{t('billed_yearly')}</p>
            </div>
          </div>

          {/* Native Options */}
          {isNative && (
            <div className="mt-6 space-y-3">
              <button onClick={() => handleNativeSubscribe('apple')} className="w-full bg-black text-white py-3 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:opacity-80 transition-opacity">
                <span className="text-lg"></span> {t('sub_apple')}
              </button>
              <button onClick={() => handleNativeSubscribe('google')} className="w-full bg-green-600 text-white py-3 font-bold uppercase tracking-widest text-xs hover:bg-green-700 transition-colors">
                {t('sub_google')}
              </button>
              <button onClick={handleRestorePurchases} className="w-full text-zinc-600 text-[10px] font-bold uppercase tracking-widest hover:text-zinc-900 dark:hover:text-zinc-300 mt-2">
                {t('restore_purchases')}
              </button>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-xs text-zinc-400 mb-4 font-mono">{t('test_mode')}</p>
            <button onClick={() => setIsNative(!isNative)} className="text-[10px] text-zinc-300 hover:text-zinc-600 mb-4 block mx-auto uppercase tracking-widest">
              {isNative ? "Switch to Web Mode" : "Switch to Native Mode"}
            </button>
            <button onClick={onClose} className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
              {t('maybe_later')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
