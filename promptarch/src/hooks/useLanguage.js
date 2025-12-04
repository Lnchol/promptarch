import { useState, useEffect } from 'react';
import { loadState } from '../utils/storage';
import { translations } from '../utils/translations';

export const useLanguage = () => {
  const [lang, setLang] = useState(() => loadState("pa_lang", "en"));

  useEffect(() => {
    localStorage.setItem("pa_lang", JSON.stringify(lang));
  }, [lang]);

  const t = (key) => {
    const keys = key.split('.');
    let val = translations[lang];
    for (const k of keys) val = val?.[k];
    return val || key;
  };

  return { lang, setLang, t };
};
