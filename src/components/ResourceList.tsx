import React, { useState, useMemo, useEffect } from 'react';
import type { ResourceItem, CategoryMeta } from '../types';
import { ResourceListItem } from './ResourceListItem';
import { Search, Tag, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useCurrentLang } from '../utils/i18n';

interface ResourceListProps {
  resources: ResourceItem[];
  categories?: CategoryMeta[];
  groupByCategory?: boolean;
  activeCategory?: string;
}

export const ResourceList: React.FC<ResourceListProps> = ({
  resources,
  categories = [],
  groupByCategory = false,
  activeCategory,
}) => {
  const [lang] = useCurrentLang();
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'warning'>('all');

  // Reset selected tag when language switches so obsolete tags don't stick
  useEffect(() => {
    setSelectedTag(null);
  }, [lang]);

  // Popular tags (reactively localized)
  const popularTags = useMemo(() => {
    const counts = new Map<string, number>();
    resources.forEach((r) => {
      const tagsList = lang === 'en' && r.tagsEn ? r.tagsEn : r.tags;
      tagsList.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1));
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 16)
      .map(([tag]) => tag);
  }, [resources, lang]);

  // Filter items
  const filteredItems = useMemo(() => {
    const q = filterQuery.toLowerCase().trim();
    return resources.filter((item) => {
      const itemTags = lang === 'en' && item.tagsEn ? item.tagsEn : item.tags;
      if (selectedTag && !itemTags.includes(selectedTag) && !item.tags.includes(selectedTag)) {
        return false;
      }
      if (statusFilter !== 'all' && item.safeguardStatus !== statusFilter) return false;
      if (!q) return true;

      const desc = (lang === 'en' && item.descriptionEn ? item.descriptionEn : item.description).toLowerCase();
      const allTagsStr = [...item.tags, ...(item.tagsEn || [])].join(' ').toLowerCase();

      return (
        item.name.toLowerCase().includes(q) ||
        desc.includes(q) ||
        item.url.toLowerCase().includes(q) ||
        allTagsStr.includes(q)
      );
    });
  }, [resources, filterQuery, selectedTag, statusFilter, lang]);

  // Group by category if requested
  const groupedData = useMemo(() => {
    if (!groupByCategory || categories.length === 0) return null;
    const map = new Map<string, ResourceItem[]>();
    categories.forEach((cat) => map.set(cat.id, []));
    filteredItems.forEach((item) => {
      const list = map.get(item.category) || [];
      list.push(item);
      map.set(item.category, list);
    });
    return map;
  }, [filteredItems, groupByCategory, categories]);

  return (
    <div className="w-full space-y-6">
      {/* Top Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Quick Instant Search */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder={lang === 'en' ? 'Filter in real time by name, feature, or platform...' : '在当前列表中即时筛选名称、功能或标签...'}
              className="w-full bg-slate-50 dark:bg-black/40 text-xs sm:text-sm pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500/60 focus:bg-white transition-colors"
            />
            {filterQuery && (
              <button
                onClick={() => setFilterQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick status & stats */}
          <div className="flex items-center gap-2 self-start sm:self-auto text-xs shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-slate-800 dark:bg-slate-700 text-white font-medium'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {lang === 'en' ? 'All' : '全部'} ({filteredItems.length})
            </button>
            <button
              onClick={() => setStatusFilter('verified')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                statusFilter === 'verified'
                  ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 font-medium'
                  : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> {lang === 'en' ? 'Verified Only' : '仅看验证'}
            </button>
            <button
              onClick={() => setStatusFilter('warning')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                statusFilter === 'warning'
                  ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 font-medium'
                  : 'text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" /> {lang === 'en' ? 'Warnings Only' : '仅看避坑'}
            </button>
          </div>
        </div>

        {/* Popular Tags Pills */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs pt-2 border-t border-slate-100 dark:border-white/[0.03]">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
            <Tag className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
            {lang === 'en' ? 'Quick Filter:' : '快速过滤:'}
          </span>
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-2 py-0.5 rounded transition-colors text-[11px] cursor-pointer ${
              selectedTag === null
                ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-semibold border border-cyan-200 dark:border-cyan-500/30'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {lang === 'en' ? 'All' : '全部'}
          </button>
          {popularTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2 py-0.5 rounded transition-colors text-[11px] cursor-pointer ${
                selectedTag === tag
                  ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-semibold border border-cyan-200 dark:border-cyan-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-white/[0.02]'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Content Rendering: Grouped or Single Flat List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-white dark:bg-white/[0.01] border border-slate-200 dark:border-white/10">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {lang === 'en' ? 'No matching resources found' : '没有匹配到任何符合条件的资源'}
          </p>
          <button
            onClick={() => {
              setFilterQuery('');
              setSelectedTag(null);
              setStatusFilter('all');
            }}
            className="mt-3 px-4 py-1.5 rounded-lg text-xs font-medium text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 border border-cyan-200 dark:border-cyan-500/20 cursor-pointer"
          >
            {lang === 'en' ? 'Reset all filters' : '清空所有筛选条件'}
          </button>
        </div>
      ) : groupByCategory && groupedData ? (
        /* Wiki Style Grouped List (FMHY.net Style) */
        <div className="space-y-10">
          {categories.map((cat) => {
            const items = groupedData.get(cat.id) || [];
            if (items.length === 0) return null;
            return (
              <section key={cat.id} id={cat.id} className="scroll-mt-24 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                      <a href={`#${cat.id}`} className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                        {cat.name}
                      </a>
                      <span className="text-xs font-mono font-normal text-slate-500 dark:text-slate-400">
                        ({cat.enName})
                      </span>
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                    {items.length} 条收录
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{cat.description}</p>

                <div className="space-y-2 mt-3">
                  {items.map((item) => (
                    <ResourceListItem key={item.id} item={item} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        /* Flat Dense List for Category Pages or direct lists */
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <ResourceListItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};
