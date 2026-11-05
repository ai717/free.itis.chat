import React, { useState, useEffect } from 'react';
import { Star, X, Check, CornerDownRight, Sparkles } from 'lucide-react';
import { useCurrentLang } from '../utils/i18n';

interface BookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcut: string;
}

export const BookmarkModal: React.FC<BookmarkModalProps> = ({ isOpen, onClose, shortcut }) => {
  const [lang] = useCurrentLang();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Auto copy site URL for convenience
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText('https://free.itis.chat/').then(() => {
          setCopied(true);
        }).catch(() => {});
      }
    } else {
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#0C121E] border border-slate-200 dark:border-white/10 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {lang === 'en' ? 'Add to Bookmarks Bar' : '一键添加到浏览器标签栏'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'en' ? 'Keep 16,000+ digital free gems handy anytime' : '永久收藏 16,000+ 免费开源数字宝藏，纯净防迷路'}
            </p>
          </div>
        </div>

        {/* Method 1: Shortcut */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
            <span>{lang === 'en' ? 'Method 1: Keyboard Shortcut' : '方式一：键盘快捷键 (最推荐)'}</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-normal">
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  {lang === 'en' ? 'URL copied' : '网址已复制'}
                </>
              ) : null}
            </span>
          </div>
          <div className="flex items-center justify-center py-2.5">
            <kbd className="px-4 py-2 text-sm font-mono font-extrabold text-cyan-700 dark:text-cyan-300 bg-white dark:bg-[#131B2A] border-2 border-cyan-400/40 rounded-xl shadow-xs tracking-wider">
              {shortcut}
            </kbd>
          </div>
          <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 leading-relaxed">
            {lang === 'en'
              ? `Press ${shortcut} on your keyboard now to save ITIS Free into your bookmarks bar.`
              : `在当前网页直接按下 ${shortcut}，即可快速加入书签并常驻标签栏。`}
          </p>
        </div>

        {/* Method 2: Drag Link to Bar */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-2">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <CornerDownRight className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>{lang === 'en' ? 'Method 2: Drag & Drop to Bar' : '方式二：拖拽直达书签栏'}</span>
          </div>
          <div className="flex items-center justify-center pt-1">
            <a
              href="https://free.itis.chat/"
              title="ITIS Free - 免费开源数字资源导航"
              draggable="true"
              onClick={(e) => e.preventDefault()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-sm border border-cyan-400/30 cursor-grab active:cursor-grabbing transition-transform hover:scale-[1.02]"
            >
              <Star className="w-3.5 h-3.5 fill-white" />
              <span>{lang === 'en' ? '★ Drag me to Bookmarks Bar' : '★ 拖拽此按钮到书签栏'}</span>
            </a>
          </div>
          <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
            {lang === 'en' ? 'Tip: Click & drag the badge directly into your browser tab/bookmark bar' : '按住上方按钮，直接拖动到浏览器顶部的书签栏中即可完成收藏'}
          </p>
        </div>

        {/* Bottom Done Action */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors"
          >
            {lang === 'en' ? 'Got it!' : '我知道了'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const BookmarkButton: React.FC<{ variant?: 'header' | 'hero' | 'compact' }> = ({
  variant = 'header',
}) => {
  const [lang] = useCurrentLang();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shortcut, setShortcut] = useState('Ctrl + D');

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent || '');
      setShortcut(isMac ? '⌘ + D' : 'Ctrl + D');
    }
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  if (variant === 'hero') {
    return (
      <>
        <button
          onClick={handleClick}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-500/10 border border-amber-300/60 dark:border-amber-500/30 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
          title={lang === 'en' ? `Bookmark (${shortcut})` : `添加到标签栏 (${shortcut})`}
        >
          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
          <span>{lang === 'en' ? `Bookmark (${shortcut})` : `添加到标签栏 (${shortcut})`}</span>
        </button>
        <BookmarkModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          shortcut={shortcut}
        />
      </>
    );
  }

  // Header variant (compact button)
  return (
    <>
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-white/[0.04] hover:bg-slate-200/80 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        title={lang === 'en' ? `Add to Bookmarks (${shortcut})` : `添加到标签栏 (${shortcut})`}
      >
        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
        <span className="hidden md:inline">
          {lang === 'en' ? 'Bookmark' : '加标签栏'}
        </span>
      </button>
      <BookmarkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        shortcut={shortcut}
      />
    </>
  );
};

export const BookmarkNewUserPrompt: React.FC = () => {
  const [lang] = useCurrentLang();
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shortcut, setShortcut] = useState('Ctrl + D');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check OS
    const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent || '');
    setShortcut(isMac ? '⌘ + D' : 'Ctrl + D');

    // Check if dismissed before
    const dismissed = localStorage.getItem('itis_bookmark_dismissed');
    if (!dismissed) {
      // Show prompt after 1.8 seconds delay for new users
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('itis_bookmark_dismissed', 'true');
    }
  };

  const handleOpenModal = () => {
    handleDismiss();
    setIsModalOpen(true);
  };

  if (!isVisible && !isModalOpen) return null;

  return (
    <>
      {isVisible && (
        <div className="fixed bottom-5 right-5 z-40 max-w-sm w-[calc(100vw-2.5rem)] sm:w-96 rounded-2xl bg-white dark:bg-[#0C121E] border border-amber-400/40 dark:border-amber-500/30 p-4 shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                <Sparkles className="w-4 h-4 fill-amber-500/20 text-amber-500" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{lang === 'en' ? 'Keep ITIS Free in your Bookmarks' : '喜欢本站？添加到标签栏'}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300/40">
                    {shortcut}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {lang === 'en'
                    ? '16,000+ clean, ad-free free digital resources. Bookmark to never lose access.'
                    : '收录 16,000+ 免费开源数字宝藏与避坑指南，随用随查防迷路。'}
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              title={lang === 'en' ? 'Dismiss' : '关闭'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3.5 flex items-center gap-2 justify-end">
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 rounded-xl text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              {lang === 'en' ? 'Later' : '稍后再说'}
            </button>
            <button
              onClick={handleOpenModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Star className="w-3 h-3 fill-white" />
              <span>{lang === 'en' ? 'Add Now' : '立即添加'}</span>
            </button>
          </div>
        </div>
      )}

      <BookmarkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        shortcut={shortcut}
      />
    </>
  );
};
