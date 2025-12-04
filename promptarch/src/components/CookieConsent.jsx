import React, { useState, useEffect } from 'react';
import { X, Cookie, Shield, Eye, TrendingUp } from 'lucide-react';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always required
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Show banner after a brief delay for better UX
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Load saved preferences
      try {
        const savedPrefs = JSON.parse(consent);
        setPreferences(savedPrefs);
      } catch (e) {
        console.error('Error loading cookie preferences:', e);
      }
    }
  }, []);

  const saveConsent = (prefs) => {
    localStorage.setItem('cookieConsent', JSON.stringify(prefs));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setShowBanner(false);
  };

  const acceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true
    };
    setPreferences(allAccepted);
    saveConsent(allAccepted);
  };

  const acceptEssential = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false
    };
    setPreferences(essentialOnly);
    saveConsent(essentialOnly);
  };

  const saveCustomPreferences = () => {
    saveConsent(preferences);
  };

  const togglePreference = (key) => {
    if (key === 'essential') return; // Can't disable essential cookies
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 pointer-events-auto" onClick={() => {}} />
      
      {/* Banner */}
      <div className="relative w-full max-w-4xl mx-4 mb-4 bg-white dark:bg-zinc-900 rounded-lg shadow-2xl border border-zinc-200 dark:border-zinc-700 pointer-events-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Cookie className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Cookie Consent
              </h2>
            </div>
          </div>

          {/* Main Content */}
          {!showDetails ? (
            <div className="space-y-4">
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                We use cookies and similar technologies to provide essential website functionality, 
                analyze usage patterns, and improve your experience. By clicking "Accept All", you 
                consent to our use of cookies for analytics and marketing purposes.
              </p>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                You can customize your preferences or accept only essential cookies. 
                For more information, please read our{' '}
                <a href="#privacy-policy" className="text-orange-500 hover:text-orange-600 underline">
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a href="#cookie-policy" className="text-orange-500 hover:text-orange-600 underline">
                  Cookie Policy
                </a>.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={acceptAll}
                  className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-medium transition-colors"
                >
                  Accept All
                </button>
                <button
                  onClick={acceptEssential}
                  className="px-6 py-2.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 rounded-md font-medium transition-colors"
                >
                  Essential Only
                </button>
                <button
                  onClick={() => setShowDetails(true)}
                  className="px-6 py-2.5 border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-md font-medium transition-colors"
                >
                  Customize
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
                Choose which types of cookies you want to allow. Essential cookies cannot be disabled 
                as they are necessary for the website to function properly.
              </p>

              {/* Cookie Categories */}
              <div className="space-y-3">
                {/* Essential Cookies */}
                <div className="flex items-start gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <Shield className="w-5 h-5 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                        Essential Cookies
                      </h3>
                      <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                        Always Active
                      </span>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Required for authentication, security, and basic website functionality. 
                      These cookies cannot be disabled.
                    </p>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <TrendingUp className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                        Analytics Cookies
                      </h3>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.analytics}
                          onChange={() => togglePreference('analytics')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-zinc-300 dark:bg-zinc-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                      </label>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Help us understand how visitors interact with our website to improve user experience.
                    </p>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <Eye className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                        Marketing Cookies
                      </h3>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.marketing}
                          onChange={() => togglePreference('marketing')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-zinc-300 dark:bg-zinc-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                      </label>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Used to deliver personalized content and track advertising effectiveness.
                    </p>
                  </div>
                </div>
              </div>

              {/* Custom Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                <button
                  onClick={saveCustomPreferences}
                  className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-medium transition-colors"
                >
                  Save Preferences
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-6 py-2.5 border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-md font-medium transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* Legal Notice */}
          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              By using this website, you agree to our use of cookies in accordance with our Privacy Policy. 
              You can change your cookie preferences at any time in your browser settings or by clicking 
              the cookie icon in the footer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
