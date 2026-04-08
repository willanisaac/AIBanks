import { useEffect, useState } from 'react';

import { ThemeContext } from './ThemeContextBase';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    console.log('Setting data-theme to:', theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    console.log('toggleTheme called, current theme:', theme);
    setTheme(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      console.log('new theme:', newTheme);
      return newTheme;
    });
  };

  const value = {
    theme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}