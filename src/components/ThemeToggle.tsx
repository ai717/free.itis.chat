import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useCurrentLang } from '../utils/i18n';

export const ThemeToggle: React.FC = () => {
  const [lang] = useCurrentLang();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const isEn = lang === 'en';
  const titleText = isEn
    ? (theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode')
    : (theme === 'light' ? '切换为暗色模式' : '切换为明亮模式');
  const ariaLabelText = isEn ? 'Toggle theme' : '切换主题';

  if (!mounted) {
    return (
      <button
        aria-label={ariaLabelText}
        className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-colors"
      >
        <Sun className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      title={titleText}
      aria-label={ariaLabelText}
      className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4 text-slate-700" />
      ) : (
        <Sun className="w-4 h-4 text-amber-300" />
      )}
    </button>
  );
};
