import React, { useEffect, useState } from 'react';
import { useCurrentLang, updateStaticDOMTexts } from '../utils/i18n';
import type { Lang } from '../types';

export const LanguageToggle: React.FC = () => {
  const [lang, setLang] = useCurrentLang();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    updateStaticDOMTexts(lang);
  }, [lang]);

  if (!mounted) {
    return (
      <div className="flex items-center p-0.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.04] text-[11px] font-semibold text-slate-500">
        <span className="px-2 py-0.5 rounded bg-white dark:bg-white/10 text-slate-900 dark:text-white">
          CH
        </span>
        <span className="px-2 py-0.5">EN</span>
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label="Language Selector"
      className="flex items-center p-0.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.04] text-[11px] font-semibold"
    >
      <button
        type="button"
        onClick={() => setLang('zh')}
        title="切换为简体中文"
        className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
          lang === 'zh'
            ? 'bg-cyan-600 text-white font-bold'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`}
      >
        CH
      </button>

      <span className="text-slate-300 dark:text-slate-700 select-none text-[10px] mx-0.5">|</span>

      <button
        type="button"
        onClick={() => setLang('en')}
        title="Switch to English"
        className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
          lang === 'en'
            ? 'bg-cyan-600 text-white font-bold'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`}
      >
        EN
      </button>
    </div>
  );
};
