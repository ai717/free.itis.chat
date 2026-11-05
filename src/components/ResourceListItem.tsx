import React, { useState } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  GitPullRequest,
  Star,
  RefreshCw,
  Info,
  Github,
  Monitor,
  Apple,
  Smartphone,
  Globe,
  Container,
} from 'lucide-react';
import type { ResourceItem } from '../types';

interface ResourceListItemProps {
  item: ResourceItem;
  index?: number;
}

export const ResourceListItem: React.FC<ResourceListItemProps> = ({ item }) => {
  const [copied, setCopied] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(item.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrRedirect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const githubUrl = `https://github.com/ai717/free.itis.chat/issues/new?title=%5B%E8%B5%84%E6%BA%90%E4%BF%AE%E6%94%B9%5D+${encodeURIComponent(item.name)}&body=${encodeURIComponent(`### 修改资源：${item.name}\n- 现有链接：${item.url}\n- 所属分类：${item.category}\n- 建议修改内容：`)}`;
    window.open(githubUrl, '_blank', 'noopener,noreferrer');
  };

  // Determine FMHY icons
  const isStarred = item.isStarred || item.featured;
  const isCollection = item.isCollection || item.tags.includes('合集') || item.tags.includes('镜像');
  const isWarning = item.safeguardStatus === 'warning' || item.safeguardStatus === 'danger';

  // Detect GitHub URL
  const githubLink = item.githubUrl || (item.url.includes('github.com') ? item.url : null);

  // Platform detection from tags or explicit platforms
  const tagsStr = item.tags.join(' ').toLowerCase();
  const hasWin = item.platforms?.includes('win') || tagsStr.includes('win');
  const hasMac = item.platforms?.includes('mac') || tagsStr.includes('mac');
  const hasAndroid = item.platforms?.includes('android') || tagsStr.includes('安卓') || tagsStr.includes('android');
  const hasWeb = item.platforms?.includes('web') || tagsStr.includes('网页') || tagsStr.includes('web');
  const hasDocker = item.platforms?.includes('docker') || tagsStr.includes('docker') || tagsStr.includes('自建');

  return (
    <div className="group relative flex flex-col md:flex-row md:items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/[0.015] hover:bg-slate-50/90 dark:hover:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.05] hover:border-cyan-500/40 dark:hover:border-cyan-500/30 transition-all duration-150">
      {/* Left Bullet & Main Content */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* FMHY Bullet dot */}
          <span className="text-slate-400 dark:text-slate-600 font-bold select-none text-xs mr-0.5">•</span>

          {/* FMHY Special Leading Icons: ⭐ Starred Gold or 🔄 Loop / Collection */}
          {isStarred && (
            <span title="FMHY 社区推荐 · 标杆必装" className="inline-flex items-center text-amber-500 shrink-0">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            </span>
          )}
          {isCollection && !isStarred && (
            <span title="专题合集 / 专项清单" className="inline-flex items-center text-cyan-600 dark:text-cyan-400 shrink-0">
              <RefreshCw className="w-3.5 h-3.5" />
            </span>
          )}

          {/* Resource Name Link */}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-slate-900 dark:text-slate-100 hover:text-cyan-600 dark:hover:text-cyan-400 tracking-tight transition-colors flex items-center gap-1 text-sm sm:text-base mr-1"
          >
            <span>{item.name}</span>
            <ExternalLink className="w-3 h-3 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-cyan-600 dark:text-cyan-400 shrink-0" />
          </a>

          {/* Description dash & text (FMHY Inline Style) */}
          <span className="text-slate-400 dark:text-slate-600 select-none text-xs hidden sm:inline">-</span>
          <span className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-normal line-clamp-1">
            {item.description}
          </span>

          {/* Trailing FMHY Badge Slash: / GitHub / Info / Platforms */}
          <div className="inline-flex items-center gap-1.5 ml-auto sm:ml-1 text-xs shrink-0 text-slate-400">
            <span className="opacity-40">/</span>

            {/* GitHub Source Icon */}
            {githubLink && (
              <a
                href={githubLink}
                target="_blank"
                rel="noopener noreferrer"
                title="查看 GitHub 开源仓库源码"
                className="p-0.5 rounded text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Info Icon (FMHY ℹ️ with Tooltip) */}
            <div className="relative inline-flex items-center">
              <button
                onMouseEnter={() => setShowInfo(true)}
                onMouseLeave={() => setShowInfo(false)}
                onClick={() => setShowInfo(!showInfo)}
                title="避坑与使用说明"
                className={`p-0.5 rounded transition-colors ${
                  isWarning
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-cyan-600 dark:text-cyan-400 hover:opacity-80'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
              </button>

              {/* Floating Tooltip */}
              {showInfo && (
                <div className="absolute right-0 bottom-full mb-2 z-50 w-64 p-2.5 rounded-xl bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-cyan-500/30 shadow-xl text-xs text-slate-700 dark:text-slate-200 pointer-events-none animate-in fade-in zoom-in-95">
                  <div className="font-semibold mb-1 flex items-center gap-1 text-[11px] text-cyan-700 dark:text-cyan-300">
                    <Info className="w-3 h-3" />
                    <span>避坑与说明指引</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                    {item.warningText || '纯开源无套路，放心使用。'}
                  </p>
                </div>
              )}
            </div>

            {/* Platform Mini Icons (FMHY Platform Indicators) */}
            <div className="hidden sm:inline-flex items-center gap-1 opacity-70">
              {hasWin && <Monitor className="w-3 h-3" title="支持 Windows" />}
              {hasMac && <Apple className="w-3 h-3" title="支持 macOS" />}
              {hasAndroid && <Smartphone className="w-3 h-3" title="支持 Android / 移动端" />}
              {hasWeb && <Globe className="w-3 h-3" title="网页端 / 浏览器扩展" />}
              {hasDocker && <Container className="w-3 h-3" title="支持 Docker / 自建部署" />}
            </div>
          </div>
        </div>

        {/* Warning callout banner if high-priority warning */}
        {isWarning && item.warningText && (
          <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-amber-900 dark:text-amber-300/90 bg-amber-50/90 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 px-2 py-0.5 rounded-md">
            <span className="font-semibold shrink-0">⚠️ 避坑提醒:</span>
            <span className="truncate">{item.warningText}</span>
          </div>
        )}
      </div>

      {/* Right Quick Action: Direct & Copy */}
      <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center border-t md:border-t-0 border-slate-100 dark:border-white/5 pt-1.5 md:pt-0">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-500/10 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 border border-cyan-200 dark:border-cyan-500/20 transition-colors"
        >
          <span>直达</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>

        <button
          onClick={handleCopy}
          title="复制链接"
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={handlePrRedirect}
          title="反馈修正"
          className="p-1 rounded-md text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
        >
          <GitPullRequest className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
