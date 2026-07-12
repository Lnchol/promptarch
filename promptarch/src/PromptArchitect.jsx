import React, { useState, useEffect, lazy, Suspense } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import EditorTab from './components/EditorTab';

// Lazy-loaded components not required for initial paint
const CookieConsent = lazy(() => import('./components/CookieConsent'));
const AuthModal = lazy(() => import('./components/AuthModal'));
const SubscriptionModal = lazy(() => import('./components/SubscriptionModal'));
const CommunityTab = lazy(() => import('./components/CommunityTab'));
const AccountTab = lazy(() => import('./components/AccountTab'));
const LibraryTab = lazy(() => import('./components/LibraryTab'));

import { useTheme } from './hooks/useTheme';
import { useLanguage } from './hooks/useLanguage';
import { useAuth } from './hooks/useAuth';
import { usePromptEditor } from './hooks/usePromptEditor';
import { apiCall, generateIdempotencyKey } from './utils/api';

export default function PromptArchitect() {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const { user, token, showAuthModal, setShowAuthModal, authMode, setAuthMode, login, register, logout, loginAnonymously, linkAccount, isAnonymous, cancelSubscription, updateUser } = useAuth();
  const editorState = usePromptEditor(token, lang);
  
  const [activeTab, setActiveTab] = useState("editor");
  const [showSubModal, setShowSubModal] = useState(false);
  
  // Data State
  const [myPrompts, setMyPrompts] = useState([]);
  const [trending, setTrending] = useState([]);

  // Effects for fetching data
  useEffect(() => {
    if (activeTab === 'community') fetchTrending();
    if (activeTab === 'account' && user) fetchMyProfile();
  }, [activeTab, user]);

  const fetchTrending = async () => {
    const res = await apiCall('/prompts/trending');
    if (!res.error) setTrending(res);
  };

  const fetchMyProfile = async () => {
    const res = await apiCall('/users/profile', 'GET', null, token);
    if (!res.error) setMyPrompts(res.prompts || []);
  };

  const handleSavePrompt = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const idempotencyKey = generateIdempotencyKey();
    
    // Use custom prompt if provided, otherwise use generated content
    const isCustom = editorState.customPrompt && editorState.customPrompt.trim().length > 0;
    const content = isCustom ? editorState.customPrompt : editorState.generatePromptContent();
    const role = isCustom ? 'Custom Prompt' : editorState.role;
    const task = isCustom ? editorState.customPrompt.substring(0, 100) + '...' : editorState.task;
    
    const res = await apiCall('/prompts', 'POST', { role, task, content, idempotencyKey, isCustom }, token);
    
    if (res.error) {
      if (res.limitReached) setShowSubModal(true);
      else alert(res.error);
    } else {
      editorState.setCopied(true);
      setTimeout(() => editorState.setCopied(false), 2000);
      if (isCustom) editorState.setCustomPrompt(''); // Clear custom prompt after save
      if (activeTab === 'account') fetchMyProfile();
    }
  };

  const handleToggleShare = async (promptId, currentlyShared) => {
    const res = await apiCall(`/prompts/${promptId}/share`, 'PATCH', { isShared: !currentlyShared }, token);
    if (res.success) {
      setMyPrompts(prev => prev.map(p => p.id === promptId ? { ...p, is_shared: res.isShared } : p));
    }
  };

  const handleLike = async (id) => {
    if (!user) return setShowAuthModal(true);
    // Placeholder for like functionality
    console.log("Like clicked for", id);
  };

  const handleSubscribe = async (type) => {
    const res = await apiCall('/payments/iyzico/initialize', 'POST', { subscriptionType: type }, token);
    return res;
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-300 font-mono selection:bg-industrial-200 dark:selection:bg-acid-900/30 transition-colors duration-300 pb-20 md:pb-0">
      <Header 
        t={t} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        lang={lang} 
        setLang={setLang} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-12">
        {activeTab === 'editor' && (
          <EditorTab 
            editorState={editorState} 
            t={t} 
            handleSavePrompt={handleSavePrompt} 
          />
        )}

        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-800 dark:border-t-zinc-400 rounded-full animate-spin"></div>
          </div>
        }>
          {activeTab === 'community' && (
            <CommunityTab 
              trending={trending} 
              user={user} 
              handleLike={handleLike} 
              setShowSubModal={setShowSubModal} 
              t={t}
              setRole={editorState.setRole}
              setTask={editorState.setTask}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'library' && (
            <LibraryTab 
              t={t}
              setActiveTab={setActiveTab}
              loadPromptIntoEditor={(promptText) => {
                editorState.setEditorMode('custom');
                editorState.setCustomPrompt(promptText);
              }}
            />
          )}

          {activeTab === 'account' && (
            <AccountTab 
              user={user} 
              myPrompts={myPrompts} 
              handleToggleShare={handleToggleShare} 
              setShowAuthModal={setShowAuthModal} 
              setShowSubModal={setShowSubModal} 
              setAuthMode={setAuthMode} 
              logout={logout} 
              cancelSubscription={cancelSubscription}
              t={t} 
              setRole={editorState.setRole} 
              setTask={editorState.setTask} 
              setActiveTab={setActiveTab} 
            />
          )}
        </Suspense>
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} t={t} />

      <Suspense fallback={null}>
        <AuthModal 
          show={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
          mode={authMode} 
          setMode={setAuthMode} 
          onLogin={login} 
          onRegister={register}
          onLoginAnonymously={loginAnonymously}
          onLinkAccount={linkAccount}
          isAnonymous={isAnonymous}
          t={t} 
        />

        <SubscriptionModal 
          show={showSubModal} 
          onClose={() => setShowSubModal(false)} 
          onSubscribe={handleSubscribe} 
          t={t} 
        />

        <CookieConsent />
      </Suspense>
    </div>
  );
}
