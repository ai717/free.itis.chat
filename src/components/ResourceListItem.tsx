import React, { useState } from 'react';
import { ExternalLink, Copy, Check, GitPullRequest } from 'lucide-react';
import type { ResourceItem } from '../types';
import { useCurrentLang } from '../utils/i18n';
import {
  FmhyInfoIcon,
  FmhyStarIcon,
  FmhyRedirectIcon,
  GithubIcon,
  WindowsIcon,
  AppleIcon,
  AndroidIcon,
  DockerIcon,
  WebIcon,
} from './icons/FmhyIcons';

interface ResourceListItemProps {
  item: ResourceItem;
  index?: number;
}

export const ResourceListItem: React.FC<ResourceListItemProps> = ({ item }) => {
  const [lang] = useCurrentLang();
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
    const isEn = lang === 'en';
    const title = isEn ? `[Resource Edit] ${item.name}` : `[资源修改] ${item.name}`;
    const body = isEn
      ? `### Suggest Edit: ${item.name}\n- Current URL: ${item.url}\n- Category: ${item.category}\n- Suggested Modifications:`
      : `### 修改资源：${item.name}\n- 现有链接：${item.url}\n- 所属分类：${item.category}\n- 建议修改内容：`;
    const githubUrl = `https://github.com/ai717/free.itis.chat/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
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

  const displayDescription = lang === 'en' && item.descriptionEn ? item.descriptionEn : item.description;
  const displayWarningText = lang === 'en' && item.warningTextEn ? item.warningTextEn : item.warningText;

  return (
    <div className="group relative flex flex-col md:flex-row md:items-center justify-between gap-2.5 px-3.5 py-3 rounded-xl bg-white dark:bg-white/[0.015] hover:bg-slate-50/90 dark:hover:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.05] hover:border-cyan-500/40 dark:hover:border-cyan-500/30 transition-all duration-150">
      {/* Left Bullet & Main Content */}
      <div className="flex-1 min-w-0 pr-2">
        {/* ROW 1: Bullet + Star/Redirect + Name + External Link + [Uniform 14px Monochrome Flat Icons IMMEDIATELY BESIDE NAME] */}
        <div className="flex items-center gap-1.5 flex-wrap mb-1">
          {/* Bullet dot */}
          <span className="text-slate-400 dark:text-slate-600 font-bold select-none text-xs mr-0.5">•</span>

          {/* FMHY Star or Redirect Icon (Strictly w-3.5 h-3.5) */}
          {isStarred && (
            <span title={lang === 'en' ? 'FMHY Community Pick · Essential' : 'FMHY 社区推荐 · 标杆必装'} className="inline-flex items-center shrink-0">
              <FmhyStarIcon className="w-3.5 h-3.5 shrink-0" />
            </span>
          )}
          {isCollection && !isStarred && (
            <span title={lang === 'en' ? 'Curated Collection / Topic Index' : '专题合集 / 专项清单'} className="inline-flex items-center text-cyan-600 dark:text-cyan-400 shrink-0">
              <FmhyRedirectIcon className="w-3.5 h-3.5 shrink-0" />
            </span>
          )}

          {/* Name Link */}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-slate-900 dark:text-slate-100 hover:text-cyan-600 dark:hover:text-cyan-400 tracking-tight transition-colors flex items-center gap-1 text-sm sm:text-base mr-1"
          >
            <span>{item.name}</span>
            <ExternalLink className="w-3 h-3 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-cyan-600 dark:text-cyan-400 shrink-0" />
          </a>

          {/* Monochrome Flat Icons: ALL STRICTLY w-3.5 h-3.5, EQUAL SIZE & ALIGNMENT */}
          <div className="inline-flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs shrink-0">
            <span className="opacity-40 select-none">/</span>

            {/* Flat Monochrome GitHub Icon */}
            {githubLink && (
              <a
                href={githubLink}
                target="_blank"
                rel="noopener noreferrer"
                title={lang === 'en' ? 'View Official Source on GitHub' : '查看 GitHub 官方开源仓库源码'}
                className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center shrink-0"
              >
                <GithubIcon className="w-3.5 h-3.5 shrink-0" />
              </a>
            )}

            {/* Flat Monochrome Info Icon with Tooltip */}
            <div className="relative inline-flex items-center shrink-0">
              <button
                onMouseEnter={() => setShowInfo(true)}
                onMouseLeave={() => setShowInfo(false)}
                onClick={() => setShowInfo(!showInfo)}
                title={lang === 'en' ? 'Heads-up & Caveats' : '避坑与使用说明'}
                className={`transition-colors flex items-center cursor-pointer ${
                  isWarning
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <FmhyInfoIcon className="w-3.5 h-3.5 shrink-0" />
              </button>

              {/* Flat Floating Tooltip */}
              {showInfo && (
                <div className="absolute left-0 bottom-full mb-2 z-50 w-72 p-2.5 rounded-xl bg-white dark:bg-[#0d1527] border border-slate-300 dark:border-cyan-500/40 text-xs text-slate-700 dark:text-slate-200 pointer-events-none animate-in fade-in zoom-in-95">
                  <div className="font-semibold mb-1 flex items-center gap-1 text-[11px] text-cyan-700 dark:text-cyan-300">
                    <FmhyInfoIcon className="w-3 h-3" />
                    <span>{lang === 'en' ? 'Heads-up & Usage Caveats' : '避坑与说明指引'}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                    {displayWarningText || (lang === 'en' ? 'Clean open-source, no catches or hidden paywalls.' : '纯开源无套路，放心使用。')}
                  </p>
                </div>
              )}
            </div>

            {/* Flat Monochrome Platform Icons - ALL EXACTLY w-3.5 h-3.5 */}
            <div className="inline-flex items-center gap-1.5 opacity-80 shrink-0">
              {hasWin && <WindowsIcon className="w-3.5 h-3.5 shrink-0 hover:text-slate-800 dark:hover:text-slate-200 transition-colors" title={lang === 'en' ? 'Supports Windows' : '支持 Windows'} />}
              {hasMac && <AppleIcon className="w-3.5 h-3.5 shrink-0 hover:text-slate-800 dark:hover:text-slate-200 transition-colors" title={lang === 'en' ? 'Supports macOS / iOS' : '支持 macOS / iOS'} />}
              {hasAndroid && <AndroidIcon className="w-3.5 h-3.5 shrink-0 hover:text-slate-800 dark:hover:text-slate-200 transition-colors" title={lang === 'en' ? 'Supports Android' : '支持 Android'} />}
              {hasWeb && <WebIcon className="w-3.5 h-3.5 shrink-0 hover:text-slate-800 dark:hover:text-slate-200 transition-colors" title={lang === 'en' ? 'Web App / Extension' : '网页端 / 浏览器扩展'} />}
              {hasDocker && <DockerIcon className="w-3.5 h-3.5 shrink-0 hover:text-slate-800 dark:hover:text-slate-200 transition-colors" title={lang === 'en' ? 'Docker / Self-Hostable' : '支持 Docker / 自建部署'} />}
            </div>
          </div>
        </div>

        {/* ROW 2: Description text (clean, completely independent) */}
        <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-normal leading-relaxed pl-3">
          {displayDescription}
        </p>

        {/* Optional Warning Banner */}
        {isWarning && displayWarningText && (
          <div className="mt-1.5 ml-3 flex items-start gap-1.5 text-[11px] text-amber-900 dark:text-amber-300/90 bg-amber-50/90 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 px-2.5 py-1 rounded-md">
            <span className="font-semibold shrink-0">{lang === 'en' ? 'Heads-up:' : '避坑提醒:'}</span>
            <span className="leading-relaxed">{displayWarningText}</span>
          </div>
        )}
      </div>

      {/* Right Quick Actions: Direct & Copy */}
      <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center border-t md:border-t-0 border-slate-100 dark:border-white/5 pt-1.5 md:pt-0">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-500/10 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 border border-cyan-200 dark:border-cyan-500/20 transition-colors"
        >
          <span>{lang === 'en' ? 'Visit' : '直达'}</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>

        <button
          onClick={handleCopy}
          title={lang === 'en' ? 'Copy Link' : '复制链接'}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={handlePrRedirect}
          title={lang === 'en' ? 'Suggest Edit / Feedback' : '反馈修正'}
          className="p-1 rounded-md text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          <GitPullRequest className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
