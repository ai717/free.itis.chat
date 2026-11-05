import React, { useState, useMemo } from 'react';
import type { ResourceItem } from '../types';
import { ResourceCard } from './ResourceCard';
import { Sparkles, Shield, AlertTriangle } from 'lucide-react';
import { useCurrentLang } from '../utils/i18n';

interface BentoGridProps {
  resources: ResourceItem[];
  defaultCategory?: string;
  showFilters?: boolean;
}

export const BentoGrid: React.FC<BentoGridProps> = ({
  resources,
  defaultCategory = 'all',
  showFilters = true,
}) => {
  const [lang] = useCurrentLang();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'warning'>('all');
  const isEn = lang === 'en';

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    resources.forEach((r) => {
      const tagsList = isEn && r.tagsEn ? r.tagsEn : r.tags;
      tagsList.forEach((t) => set.add(t));
    });
    return Array.from(set).slice(0, 14); // show top popular tags
  }, [resources, isEn]);

  // Filter items
  const filtered = useMemo(() => {
    return resources.filter((item) => {
      const itemTags = isEn && item.tagsEn ? item.tagsEn : item.tags;
      if (selectedTag && !itemTags.includes(selectedTag)) return false;
      if (statusFilter !== 'all' && item.safeguardStatus !== statusFilter) return false;
      return true;
    });
  }, [resources, selectedTag, statusFilter]);

  return (
    <div className="w-full">
      {/* Optional Tag & Status Pill Filters */}
      {showFilters && (
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
          {/* Tag Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> {isEn ? 'Featured Tags:' : '标签精选:'}
            </span>
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedTag === null
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {isEn ? 'All' : '全部'}
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedTag === tag
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* Safeguard Filter */}
          <div className="flex items-center gap-2 self-start md:self-auto text-xs shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-slate-700 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isEn ? 'All Status' : '所有状态'}
            </button>
            <button
              onClick={() => setStatusFilter('verified')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                statusFilter === 'verified'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <Shield className="w-3 h-3" /> {isEn ? 'Verified' : '社区验证'}
            </button>
            <button
              onClick={() => setStatusFilter('warning')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                statusFilter === 'warning'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              <AlertTriangle className="w-3 h-3" /> {isEn ? 'Caveats Only' : '含避坑提示'}
            </button>
          </div>
        </div>
      )}

      {/* Grid Layout */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-2xl bg-white/[0.01] border border-white/5">
          <p className="text-slate-400 text-base">
            {isEn ? 'No resources matching the selected tag or filter' : '没有找到匹配该标签或筛选条件的资源'}
          </p>
          <button
            onClick={() => {
              setSelectedTag(null);
              setStatusFilter('all');
            }}
            className="mt-3 px-4 py-1.5 rounded-lg text-xs font-medium text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20"
          >
            {isEn ? 'Reset all filters' : '重置所有筛选'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
          {filtered.map((item) => (
            <ResourceCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};
