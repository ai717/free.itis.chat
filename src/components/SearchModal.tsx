import React, { useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import { Search, X, ExternalLink, Command, Tag, ShieldCheck, AlertTriangle } from 'lucide-react';
import type { ResourceItem } from '../types';

interface SearchModalProps {
  resources: ResourceItem[];
}

export const SearchModal: React.FC<SearchModalProps> = ({ resources }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize Fuse.js for ultra-fast local full-text search
  const fuse = React.useMemo(() => {
    return new Fuse(resources, {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'tags', weight: 0.2 },
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
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-500/30 text-slate-400 hover:text-slate-200 text-xs transition-all cursor-pointer group"
        aria-label="快速全局搜索"
      >
        <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
        <span className="hidden sm:inline">全站资源毫秒级搜索...</span>
        <span className="sm:hidden">搜索</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-slate-400">
          <Command className="w-2.5 h-2.5" /> K
        </kbd>
      </button>

      {/* Modal Backdrop & Container */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-2xl rounded-2xl bg-[#0B111E] border border-white/10 shadow-2xl shadow-cyan-950/40 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
            {/* Input Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-white/[0.02]">
              <Search className="w-5 h-5 text-cyan-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDownInModal}
                placeholder="键入关键词（如: AI, 免费, 视频, 局域网, 密码, 书籍）..."
                className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 text-slate-400 hover:text-white rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-slate-400">
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-white/[0.03]">
              {results.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  未找到与 “<span className="text-cyan-400">{query}</span>” 相关的开源资源
                  <p className="text-xs text-slate-400 mt-1">换个关键词试试，或直接在 GitHub 提交新资源推荐！</p>
                </div>
              ) : (
                results.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
                      className={`group flex items-start justify-between gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-cyan-500/10 border border-cyan-500/30'
                          : 'hover:bg-white/[0.03] border border-transparent'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold text-sm ${
                              isSelected ? 'text-cyan-300' : 'text-slate-200'
                            }`}
                          >
                            {item.name}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]">
                            {item.url.replace(/^https?:\/\//, '')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-1 font-normal">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 flex items-center gap-1"
                            >
                              <Tag className="w-2.5 h-2.5 opacity-50" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0 pt-0.5">
                        {item.safeguardStatus === 'verified' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" /> 纯净
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5" /> 避坑
                          </span>
                        )}
                        <ExternalLink
                          className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${
                            isSelected ? 'text-cyan-400 opacity-100' : 'text-slate-400'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="px-4 py-2.5 bg-white/[0.02] border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-3">
                <span>
                  <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 font-mono">↑</kbd>{' '}
                  <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 font-mono">↓</kbd> 切换
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono">Enter</kbd> 直达
                </span>
              </div>
              <span className="text-cyan-400/80">⚡ Fuse.js 毫秒级本地检索</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
