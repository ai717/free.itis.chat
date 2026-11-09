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
  privacy: '去广告与隐私',
  ai: 'AI 神器',
  video: '影视动漫',
  audio: '音乐广播',
  gaming: '游戏模拟',
  reading: '电子书',
  downloading: '高速下载',
  torrenting: '种子磁力',
  educational: '教育课程',
  mobile: '移动端',
  'linux-macos': 'Linux/Mac',
  'developer-tools': '开发者',
  'system-tools': '系统工具',
  'file-tools': '文件工具',
  'image-tools': '图像工具',
  'video-tools': '视频工具',
  'text-tools': '文本工具',
  'internet-tools': '网络工具',
  'social-media-tools': '社媒抓取',
  'gaming-tools': '游戏辅助',
  storage: '云存储',
  'non-english': '多语言',
  misc: '综合探索',
};

const SHORT_NAMES_EN: Record<string, string> = {
  privacy: 'Privacy',
  ai: 'AI Tools',
  video: 'Movies & TV',
  audio: 'Audio',
  gaming: 'Gaming',
  reading: 'Books',
  downloading: 'Downloads',
  torrenting: 'Torrents',
  educational: 'Education',
  mobile: 'Mobile',
  'linux-macos': 'Linux/Mac',
  'developer-tools': 'Dev Tools',
  'system-tools': 'System',
  'file-tools': 'File Tools',
  'image-tools': 'Image Tools',
  'video-tools': 'Video Tools',
  'text-tools': 'Text Tools',
  'internet-tools': 'Web Tools',
  'social-media-tools': 'Social Media',
  'gaming-tools': 'Game Mods',
  storage: 'Storage',
  'non-english': 'Multilingual',
  misc: 'Misc',
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
            href={`/${cat.id}/`}
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

          {/* Flat Dropdown Menu Panel with Max-Height Scrolling */}
          {isOpen && (
            <div className="absolute left-0 mt-1.5 w-84 min-w-[320px] max-h-[75vh] overflow-y-auto no-scrollbar rounded-2xl bg-white dark:bg-[#0B111E] border border-slate-300 dark:border-white/15 p-2 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-1 shadow-lg">
              <div className="sticky top-0 bg-white/95 dark:bg-[#0B111E]/95 backdrop-blur-xs px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 dark:border-white/5 mb-1">
                <span>{lang === 'en' ? 'All FMHY Categories' : '全部 FMHY 分类'}</span>
                <span className="font-mono text-cyan-600 dark:text-cyan-400">{overflowCategories.length} {lang === 'en' ? 'categories' : '个分类'}</span>
              </div>
              <div className="grid grid-cols-1 gap-0.5">
                {overflowCategories.map((cat) => {
                  const isActive = currentPath === `/${cat.id}` || currentPath === `/${cat.id}/`;
                  return (
                    <a
                      key={cat.id}
                      href={`/${cat.id}/`}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-colors ${
                        isActive
                          ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-2 shrink-0 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0" />
                        <span className="whitespace-nowrap font-medium">
                          {lang === 'en' ? cat.enName : cat.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 whitespace-nowrap ml-2 shrink-0">
                        {lang === 'en' ? cat.id : cat.enName}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
