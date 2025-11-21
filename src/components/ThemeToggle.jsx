import React from 'react';
import { useTheme } from '../context/ThemeContext';
import '../css/theme-toggle.css';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      className="theme-toggle" 
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Chuyển sang chế độ ban ngày' : 'Chuyển sang chế độ ban đêm'}
      title={theme === 'dark' ? 'Chế độ ban ngày' : 'Chế độ ban đêm'}
    >
      <div className="theme-toggle-inner">
        <span className="theme-icon sun">☀️</span>
        <span className="theme-icon moon">🌙</span>
        <div className={`theme-slider ${theme === 'dark' ? 'dark' : 'light'}`}></div>
      </div>
    </button>
  );
}

