import { useState, useEffect } from 'react';
import { loadState } from '../utils/storage';

export const useTheme = () => {
  const [theme, setTheme] = useState(() => loadState("pa_theme", "dark"));

  useEffect(() => {
    localStorage.setItem("pa_theme", JSON.stringify(theme));
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return { theme, setTheme, toggleTheme };
};
