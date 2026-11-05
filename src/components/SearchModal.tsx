import React, { useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import { Search, X, ExternalLink, Command, Tag, ShieldCheck, AlertTriangle } from 'lucide-react';
import type { ResourceItem } from '../types';
import { useCurrentLang } from '../utils/i18n';
import { FmhyStarIcon, FmhyInfoIcon, GithubIcon } from './icons/FmhyIcons';

interface SearchModalProps {
  resources: ResourceItem[];
}

const CATEGORY_LABELS: Record<string, { zh: string; en: string }> = {
  ai: { zh: 'AI 神器', en: 'AI Tools' },
  adblock: { zh: '去广告', en: 'Adblock' },
  media: { zh: '影音媒体', en: 'Media' },
  software: { zh: '系统工具', en: 'Software' },
  books: { zh: '电子书', en: 'Books' },
  dev: { zh: '开发者', en: 'Dev' },
};

export const SearchModal: React.FC<SearchModalProps> = ({ resources }) => {
  const [lang] = useCurrentLang();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize Fuse.js with bilingual search keys
  const fuse = React.useMemo(() => {
    return new Fuse(resources, {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'description', weight: 0.25 },
        { name: 'descriptionEn', weight: 0.25 },
        { name: 'tags', weight: 0.15 },
        { name: 'tagsEn', weight: 0.15 },
        { name: 'category', weight: 0.1 },
      ],
      threshold: 0.35,
      ignoreLocation: true,
    });
  }, [resources]);

  // Search results
  const results = React.useMemo(() => {
    if (!query.trim()) {
      return resources.slice(0, 8); // show trending 8 by default
    }
    return fuse.search(query).map((res) => res.item).slice(0, 10);
  }, [query, fuse, resources]);

  // Global shortcut listener (Cmd+K / Ctrl+K / Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDownInModal = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, results.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        window.open(results[selectedIndex].url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  return (
    <>
      {/* Trigger Button inside Header / Navbar */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200/80 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-xs transition-all cursor-pointer group"
        aria-label={lang === 'en' ? 'Quick Global Search' : '快速全局搜索'}
      >
        <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
        <span className="hidden sm:inline">
          {lang === 'en' ? 'Search resources...' : '全站资源毫秒级搜索...'}
        </span>
        <span className="sm:hidden">{lang === 'en' ? 'Search' : '搜索'}</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 text-[10px] font-mono text-slate-500 dark:text-slate-400">
          <Command className="w-2.5 h-2.5" /> K
        </kbd>
      </button>

      {/* Modal Backdrop & Container */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-20 px-4 sm:px-6">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-[#0B111E] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
            {/* Input Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              <Search className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDownInModal}
                placeholder={
                  lang === 'en'
                    ? 'Type a keyword (e.g., AI, Adblock, Streaming, Books, Dev)...'
                    : '键入关键词（如: AI, 免费, 视频, 局域网, 密码, 书籍）...'
                }
                className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-white/[0.03]">
              {results.length === 0 ? (
                <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                  {lang === 'en' ? 'No matching open-source resources found for ' : '未找到与 “'}
                  <span className="text-cyan-600 dark:text-cyan-400">{query}</span>
                  {lang === 'en' ? '' : '” 相关的开源资源'}
                  <p className="text-xs text-slate-400 mt-1">
                    {lang === 'en'
                      ? 'Try another keyword or submit a new resource on GitHub!'
                      : '换个关键词试试，或直接在 GitHub 提交新资源推荐！'}
                  </p>
                </div>
              ) : (
                results.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  const isStarred = item.isStarred || item.featured;
                  const desc = lang === 'en' && item.descriptionEn ? item.descriptionEn : item.description;
                  const catLabel = CATEGORY_LABELS[item.category]?.[lang] || item.category;

                  return (
                    <div
                      key={item.id}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
                      className={`group flex items-start justify-between gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30'
                          : 'hover:bg-slate-50 dark:hover:bg-white/[0.03] border border-transparent'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        {/* Title Row with FMHY Icons */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isStarred && (
                            <span title="FMHY Star" className="shrink-0">
                              <FmhyStarIcon className="w-3.5 h-3.5 shrink-0" />
                            </span>
                          )}
                          <span
                            className={`font-semibold text-sm ${
                              isSelected ? 'text-cyan-700 dark:text-cyan-300' : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {item.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20 font-medium">
                            {catLabel}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400 truncate max-w-[180px]">
                            {item.url.replace(/^https?:\/\//, '')}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1 font-normal">
                          {desc}
                        </p>

                        {/* Tags */}
                        <div className="flex items-center gap-1.5 mt-2">
                          {(lang === 'en' && item.tagsEn ? item.tagsEn : item.tags).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1"
                            >
                              <Tag className="w-2.5 h-2.5 opacity-50" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right Verification Status & Direct Icon */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0 pt-0.5">
                        {item.safeguardStatus === 'verified' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {lang === 'en' ? 'Clean' : '纯净'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {lang === 'en' ? 'Caution' : '避坑'}
                          </span>
                        )}
                        <ExternalLink
                          className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${
                            isSelected ? 'text-cyan-600 dark:text-cyan-400 opacity-100' : 'text-slate-400'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="px-4 py-2.5 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <span>
                  <kbd className="px-1 py-0.5 rounded bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 font-mono">↑</kbd>{' '}
                  <kbd className="px-1 py-0.5 rounded bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 font-mono">↓</kbd>{' '}
                  {lang === 'en' ? 'Navigate' : '切换'}
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 font-mono">Enter</kbd>{' '}
                  {lang === 'en' ? 'Visit' : '直达'}
                </span>
              </div>
              <span className="text-cyan-600 dark:text-cyan-400/80">
                {lang === 'en' ? '⚡ Sub-millisecond Fuzzy Search' : '⚡ 毫秒级模糊检索'}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
