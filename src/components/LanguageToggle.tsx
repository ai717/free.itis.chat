import React, { useEffect, useState } from 'react';
import { useCurrentLang, updateStaticDOMTexts } from '../utils/i18n';
import type { Lang } from '../types';

export const LanguageToggle: React.FC = () => {
  const [lang, setLang] = useCurrentLang();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Sync initial DOM attributes and any static text on first load
    updateStaticDOMTexts(lang);
  }, [lang]);

  if (!mounted) {
    return (
      <div className="flex items-center p-0.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/[0.04] text-[11px] font-semibold text-slate-500">
        <span className="px-2 py-1 rounded-lg bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs">
          CH
        </span>
        <span className="px-2 py-1">EN</span>
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label="Language Selector"
      className="flex items-center p-0.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/[0.04] text-[11px] font-semibold shadow-xs"
    >
      <button
        type="button"
        onClick={() => setLang('zh')}
        title="切换为简体中文"
        className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
          lang === 'zh'
            ? 'bg-white dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 shadow-xs font-bold'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`}
      >
        CH
      </button>

      <span className="text-slate-300 dark:text-slate-700 select-none text-[10px]">|</span>

      <button
        type="button"
        onClick={() => setLang('en')}
        title="Switch to English"
        className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
          lang === 'en'
            ? 'bg-white dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 shadow-xs font-bold'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`}
      >
        EN
      </button>
    </div>
  );
};
