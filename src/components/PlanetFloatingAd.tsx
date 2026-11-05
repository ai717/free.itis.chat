import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Sparkles } from 'lucide-react';
import { useCurrentLang } from '../utils/i18n';

const STORAGE_KEY = 'itis_chat_ad_dismissed_at';
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

export const PlanetFloatingAd: React.FC = () => {
  const [lang] = useCurrentLang();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const dismissedAt = localStorage.getItem(STORAGE_KEY);
      if (dismissedAt) {
        const timeElapsed = Date.now() - parseInt(dismissedAt, 10);
        if (timeElapsed < TWENTY_FOUR_HOURS) {
          // Still within 24 hours, do not show
          return;
        }
      }
      // Show after a subtle 1-second delay so page loads smoothly first
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    } catch {
      setIsVisible(true);
    }
  }, []);

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    } catch {
      // Ignore storage errors in private mode
    }
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="itis.chat AI星球旅行指南"
      className="fixed bottom-3.5 right-3.5 sm:bottom-auto sm:right-5 sm:top-1/2 sm:-translate-y-1/2 z-30 group animate-in slide-in-from-right-8 fade-in duration-300"
    >
      {/* Mobile Mini Floating Pill (< sm screens) */}
      <div className="flex sm:hidden items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 dark:bg-[#0B101D]/95 text-slate-900 dark:text-white backdrop-blur-md border border-indigo-300/60 dark:border-indigo-500/40 shadow-lg shadow-indigo-500/10">
        <a
          href="https://itis.chat/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <span>{lang === 'en' ? 'AI Planet Guide' : '🪐 AI星球指南'}</span>
          <ExternalLink className="w-3 h-3 text-indigo-500 shrink-0" />
        </a>
        <button
          onClick={handleClose}
          className="ml-1 p-0.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
          title={lang === 'en' ? 'Close (hidden for 24h)' : '关闭 (24小时内不再显示)'}
          aria-label="Close Ad"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Desktop Full Floating Card (>= sm screens) */}
      <div className="hidden sm:block w-60 relative overflow-hidden rounded-2xl bg-white/95 dark:bg-[#0B101D]/90 backdrop-blur-md border border-indigo-200/80 dark:border-indigo-500/30 p-3.5 shadow-xl shadow-indigo-500/10 dark:shadow-indigo-500/20 hover:border-indigo-400 dark:hover:border-indigo-400/60 transition-all duration-300">
        {/* Ambient Cosmic Background Glow */}
        <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-linear-to-br from-indigo-500/20 via-purple-500/20 to-transparent blur-xl pointer-events-none" />
        <div className="absolute -left-6 -bottom-6 w-20 h-20 rounded-full bg-linear-to-tr from-cyan-500/15 to-transparent blur-lg pointer-events-none" />

        {/* Top Header: Badge & Close Button */}
        <div className="relative flex items-center justify-between gap-1 mb-2">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-linear-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-pink-500/20 border border-indigo-300/40 dark:border-indigo-500/30 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 tracking-wide">
            <Sparkles className="w-2.5 h-2.5 text-indigo-500 dark:text-indigo-400 animate-pulse" />
            <span>{lang === 'en' ? 'Flagship AI Hub' : '官方主站推荐'}</span>
          </div>

          {/* Close button with 24-hour tooltip */}
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title={lang === 'en' ? 'Close (hidden for 24h)' : '关闭 (24小时内不再显示)'}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Main Body: Sci-Fi Planet Icon & Title */}
        <a
          href="https://itis.chat/"
          target="_blank"
          rel="noopener noreferrer"
          className="relative block group/card"
        >
          <div className="flex items-center gap-2.5">
            {/* Pure CSS/SVG Animated Sci-Fi Planet */}
            <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
              {/* Outer Orbit Track */}
              <div
                className="absolute inset-0 rounded-full border border-indigo-400/30 dark:border-indigo-400/40 animate-spin"
                style={{ animationDuration: '10s' }}
              />
              {/* Glowing Core Planet */}
              <div className="w-5.5 h-5.5 rounded-full bg-linear-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-sm shadow-purple-500/50 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white/40 blur-[0.5px]" />
              </div>
              {/* Orbiting Satellite Spark */}
              <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-xs shadow-cyan-300 animate-pulse" />
            </div>

            {/* Typography */}
            <div className="min-w-0 flex-1">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight group-hover/card:text-indigo-600 dark:group-hover/card:text-indigo-400 transition-colors truncate">
                {lang === 'en' ? 'AI Planet Guide' : 'AI星球旅行指南'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {lang === 'en' ? 'itis.chat · Frontier AI Galaxy' : 'itis.chat · 漫游AI宇宙'}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
            {lang === 'en'
              ? 'Explore frontier AI tools, creative prompts, and real-world workflows.'
              : '探索全网前沿 AI 工具、高阶工作流与落地实战灵感。'}
          </p>

          {/* Action CTA Button */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 group-hover/card:text-indigo-700 dark:group-hover/card:text-indigo-300">
            <span className="inline-flex items-center gap-1">
              <span>{lang === 'en' ? 'Enter Galaxy' : '启航漫游'}</span>
              <ExternalLink className="w-3 h-3 group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5 transition-transform" />
            </span>
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
              itis.chat
            </span>
          </div>
        </a>
      </div>
    </aside>
  );
};
