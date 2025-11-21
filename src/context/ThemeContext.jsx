import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark-mode');
    document.documentElement.classList.add('light-mode');
  }, []);

  const themeContextValue = {
    theme: 'light',
    toggleTheme: () => {},
  };

  return <ThemeContext.Provider value={themeContextValue}>{children}</ThemeContext.Provider>;
};

