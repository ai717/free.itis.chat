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
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
      setIsMobileDevice(mobile);
    }
  }, []);

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('https://free.itis.chat/').then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }).catch(() => {});
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#0C121E] border border-slate-200 dark:border-white/10 shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 sm:right-4 sm:top-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pr-8">
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

        {/* Mobile Device View */}
        {isMobileDevice ? (
          <div className="space-y-3">
            {/* Mobile Instructions */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-2.5">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>{lang === 'en' ? 'Mobile Browser Bookmark Guide' : '手机端快速收藏方式'}</span>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed pl-1">
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span>{lang === 'en' ? 'Tap browser bottom/top menu (Share or ⋯ icon)' : '点击浏览器底部或顶部的【分享】或【⋯】菜单'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span>{lang === 'en' ? 'Select "Add to Bookmarks" or "Add to Home Screen"' : '选择【添加书签】或【添加到主屏幕】'}</span>
                </li>
              </ul>
            </div>

            {/* Quick Copy Site URL */}
            <div className="p-4 rounded-xl bg-cyan-50/60 dark:bg-cyan-950/20 border border-cyan-200/80 dark:border-cyan-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-cyan-900 dark:text-cyan-200">
                <span>{lang === 'en' ? 'Copy Site URL' : '复制网址随身存'}</span>
                {copied && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-normal">
                    <Check className="w-3 h-3" />
                    {lang === 'en' ? 'Copied to clipboard!' : '已成功复制！'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 text-xs font-mono bg-white dark:bg-[#131B2A] border border-cyan-300/40 rounded-xl truncate text-slate-700 dark:text-slate-300">
                  https://free.itis.chat/
                </div>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors shrink-0 cursor-pointer shadow-xs"
                >
                  {copied ? (lang === 'en' ? 'Copied' : '已复制') : (lang === 'en' ? 'Copy' : '复制')}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Device View */
          <>
            {/* Method 1: Shortcut */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
                <span>{lang === 'en' ? 'Method 1: Keyboard Shortcut (Recommended)' : '方式一：键盘快捷键 (最推荐)'}</span>
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
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-2.5">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CornerDownRight className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>{lang === 'en' ? 'Method 2: Drag & Drop to Bar' : '方式二：拖拽直达书签栏'}</span>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {lang === 'en' ? 'Drag into bar' : '按住拖动'}
                </span>
              </div>
              <div className="flex items-center justify-center pt-0.5">
                <a
                  href="https://free.itis.chat/"
                  title={lang === 'en' ? 'ITIS Free · Digital Free Resources' : 'ITIS Free · 免费开源数字导航'}
                  draggable="true"
                  onClick={(e) => e.preventDefault()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-linear-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-md border border-cyan-400/30 cursor-grab active:cursor-grabbing transition-transform hover:scale-[1.02]"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300 shrink-0" />
                  <span>{lang === 'en' ? 'ITIS Free · Digital Free Resources' : 'ITIS Free · 免费开源数字导航'}</span>
                </a>
              </div>
              <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 leading-relaxed">
                {lang === 'en'
                  ? 'Click & drag the button above directly into your browser bookmark bar (saves automatically with site name)'
                  : '按住上方按钮直接拖拽到浏览器书签栏（松手即完成收藏，自动预置网站名称）'}
              </p>
            </div>
          </>
        )}

        {/* Bottom Done Action */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors cursor-pointer"
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
        <div className="fixed bottom-3 right-3 left-3 sm:left-auto sm:right-5 sm:bottom-5 z-40 max-w-sm w-auto sm:w-96 rounded-2xl bg-white dark:bg-[#0C121E] border border-amber-400/40 dark:border-amber-500/30 p-3.5 sm:p-4 shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-5 fade-in duration-300">
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
