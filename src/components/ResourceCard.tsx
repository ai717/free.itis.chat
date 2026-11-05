import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Copy, Check, GitPullRequest, Tag } from 'lucide-react';
import type { ResourceItem } from '../types';
import { SafeguardBadge } from './SafeguardBadge';

interface ResourceCardProps {
  item: ResourceItem;
  className?: string;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ item, className = '' }) => {
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
    // Redirects to GitHub PR/Issue modification page
    const githubUrl = `https://github.com/itis-chat/free.itis.chat/issues/new?title=%5B%E8%B5%84%E6%BA%90%E4%BF%AE%E6%94%B9%5D+${encodeURIComponent(item.name)}&body=${encodeURIComponent(`### 修改资源：${item.name}\n- 现有链接：${item.url}\n- 所属分类：${item.category}\n- 建议修改内容：`)}`;
    window.open(githubUrl, '_blank', 'noopener,noreferrer');
  };

  // Determine grid span based on bentoSize
  const sizeClasses = {
    normal: 'col-span-1 row-span-1',
    wide: 'col-span-1 md:col-span-2 row-span-1',
    tall: 'col-span-1 row-span-1 md:row-span-2',
    large: 'col-span-1 md:col-span-2 md:row-span-2',
  }[item.bentoSize || 'normal'];

  return (
    <motion.div
      whileHover={{ scale: 1.018 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`group relative flex flex-col justify-between p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-cyan-500/40 hover:bg-white/[0.05] transition-all duration-300 shadow-lg hover:shadow-cyan-500/10 ${sizeClasses} ${className}`}
    >
      {/* Background ambient corner glow on hover */}
      <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-cyan-500/0 via-transparent to-blue-600/0 group-hover:from-cyan-500/10 group-hover:to-blue-600/5 transition-opacity duration-300 pointer-events-none" />

      {/* Top Header Row */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group-hover:text-cyan-400 font-bold text-lg text-slate-100 tracking-tight transition-colors flex items-center gap-1.5"
              >
                <span className="truncate">{item.name}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>
            </div>
            <p className="text-xs text-slate-400/80 font-mono truncate mt-0.5">{item.url.replace(/^https?:\/\//, '')}</p>
          </div>

          <SafeguardBadge status={item.safeguardStatus} warningText={item.warningText} />
        </div>

        {/* Description */}
        <p className="text-slate-300 text-sm leading-relaxed line-clamp-3 mb-4 font-normal">
          {item.description}
        </p>
      </div>

      {/* Bottom Footer Row */}
      <div className="pt-3 border-t border-white/5 flex flex-col gap-2.5">
        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800/60 text-slate-300 border border-slate-700/50 hover:border-cyan-500/30 transition-colors"
            >
              <Tag className="w-2.5 h-2.5 opacity-60" />
              {tag}
            </span>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between mt-1 pt-1 text-xs">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-medium border border-cyan-500/20 transition-all text-xs"
          >
            <span>立即直达</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              title="复制链接"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handlePrRedirect}
              title="反馈修正 / 提交更新"
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
            >
              <GitPullRequest className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
