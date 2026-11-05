import React, { useState } from 'react';
import { ExternalLink, Copy, Check, GitPullRequest, ShieldCheck, AlertTriangle } from 'lucide-react';
import type { ResourceItem } from '../types';

interface ResourceListItemProps {
  item: ResourceItem;
  index?: number;
}

export const ResourceListItem: React.FC<ResourceListItemProps> = ({ item }) => {
  const [copied, setCopied] = useState(false);

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

  const isWarning = item.safeguardStatus === 'warning' || item.safeguardStatus === 'danger';

  return (
    <div className="group relative flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white dark:bg-white/[0.015] hover:bg-slate-50/80 dark:hover:bg-white/[0.045] border border-slate-200/90 dark:border-white/[0.05] hover:border-cyan-500/40 dark:hover:border-cyan-500/30 shadow-xs hover:shadow-md dark:shadow-none transition-all duration-150">
      {/* Left & Middle: Name, Link, Tags, Description & Warnings */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-slate-900 dark:text-slate-100 hover:text-cyan-600 dark:hover:text-cyan-400 tracking-tight transition-colors flex items-center gap-1.5 text-base"
          >
            <span>{item.name}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-cyan-600 dark:text-cyan-400" />
          </a>

          {/* Tags as compact pills */}
          <div className="flex items-center gap-1 flex-wrap">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-mono border border-slate-200 dark:border-slate-700/50"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Safeguard Status Inline Badge */}
          {item.safeguardStatus === 'verified' ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              <span>验证</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-500/20">
              <AlertTriangle className="w-3 h-3" />
              <span>避坑提示</span>
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
          {item.description}
        </p>

        {/* Warning text callout if exists */}
        {isWarning && item.warningText && (
          <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-amber-900 dark:text-amber-300/90 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 px-2.5 py-1 rounded-lg">
            <span className="font-semibold shrink-0">⚠️ 避坑提醒:</span>
            <span>{item.warningText}</span>
          </div>
        )}
      </div>

      {/* Right Action buttons: Open, Copy, Report */}
      <div className="flex items-center gap-2 shrink-0 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-white/5 w-full md:w-auto justify-end">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-500/10 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 border border-cyan-200 dark:border-cyan-500/20 transition-colors"
        >
          <span>直达</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        <button
          onClick={handleCopy}
          title="复制链接"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200/60 dark:border-white/5 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={handlePrRedirect}
          title="反馈/提交修改"
          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200/60 dark:border-white/5 transition-colors"
        >
          <GitPullRequest className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
