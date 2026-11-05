import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import type { CategoryMeta } from '../types';
import { useCurrentLang } from '../utils/i18n';

interface NavCategoriesProps {
  categories: CategoryMeta[];
  currentPath: string;
  visibleCount?: number;
}

const SHORT_NAMES_ZH: Record<string, string> = {
  ai: 'AI 神器',
  adblock: '去广告',
  media: '影音媒体',
  software: '系统工具',
  books: '电子书',
  dev: '开发者',
};

const SHORT_NAMES_EN: Record<string, string> = {
  ai: 'AI Tools',
  adblock: 'Adblock',
  media: 'Media',
  software: 'Software',
  books: 'Books',
  dev: 'Dev',
};

export const NavCategories: React.FC<NavCategoriesProps> = ({
  categories,
  currentPath,
  visibleCount = 4,
}) => {
  const [lang] = useCurrentLang();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const visibleCategories = categories.slice(0, visibleCount);
  const overflowCategories = categories.slice(visibleCount);

  // Check if current active page is in the overflow list
  const isOverflowActive = overflowCategories.some(
    (cat) => currentPath === `/${cat.id}` || currentPath === `/${cat.id}/`
  );

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const shortNames = lang === 'en' ? SHORT_NAMES_EN : SHORT_NAMES_ZH;

  return (
    <nav className="hidden lg:flex items-center gap-1 pl-3 border-l border-slate-200 dark:border-white/10 text-xs xl:text-sm shrink-0">
      {/* 首页精选 */}
      <a
        href="/"
        className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
          currentPath === '/'
            ? 'text-cyan-700 dark:text-cyan-400 bg-slate-100 dark:bg-white/[0.05]'
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.03]'
        }`}
      >
        {lang === 'en' ? 'Featured' : '首页精选'}
      </a>

      {/* 默认显示的分类 */}
      {visibleCategories.map((cat) => {
        const isActive = currentPath === `/${cat.id}` || currentPath === `/${cat.id}/`;
        const shortName = shortNames[cat.id] || (lang === 'en' ? cat.enName : cat.name.split(' ')[0]);
        return (
          <a
            key={cat.id}
            href={`/${cat.id}`}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              isActive
                ? 'text-cyan-700 dark:text-cyan-400 bg-slate-100 dark:bg-white/[0.05]'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.03]'
            }`}
          >
            {shortName}
          </a>
        );
      })}

      {/* 更多分类下拉菜单 */}
      {overflowCategories.length > 0 && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              isOpen || isOverflowActive
                ? 'text-cyan-700 dark:text-cyan-400 bg-slate-100 dark:bg-white/[0.05]'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.03]'
            }`}
          >
            <span>{lang === 'en' ? 'More' : '更多分类'}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-cyan-600 dark:text-cyan-400' : 'text-slate-400'
              }`}
            />
            {isOverflowActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            )}
          </button>

          {/* Flat Dropdown Menu Panel */}
          {isOpen && (
            <div className="absolute left-0 mt-1.5 w-80 min-w-[300px] rounded-2xl bg-white dark:bg-[#0B111E] border border-slate-300 dark:border-white/15 p-2 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>{lang === 'en' ? 'More Categories' : '更多分类'}</span>
                <span className="font-mono">{overflowCategories.length} {lang === 'en' ? 'items' : '个分类'}</span>
              </div>
              {overflowCategories.map((cat) => {
                const isActive = currentPath === `/${cat.id}` || currentPath === `/${cat.id}/`;
                return (
                  <a
                    key={cat.id}
                    href={`/${cat.id}`}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                      isActive
                        ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0" />
                      <span className="whitespace-nowrap font-medium">
                        {lang === 'en' ? cat.enName : cat.name}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 whitespace-nowrap ml-3 shrink-0">
                      {lang === 'en' ? cat.id : cat.enName}
                    </span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
