import { useState, useEffect } from 'react';
import type { Lang } from '../types';

export const UI_TRANSLATIONS = {
  zh: {
    siteTitle: 'ITIS Free 免费开源数字资源导航',
    siteSlogan: '互联网上最大的干净、无广告、社区驱动的中文数字免费资源导航，开源！白嫖！避坑！',
    brandBadge: '开源 白嫖 避坑',
    badgeCommunity: '社区驱动 · 开源白嫖避坑维基',
    badgeNoAds: '✓ 零商业广告',
    badgeOpenSource: '✓ 开源优先',
    badgeWarnings: '✓ 避坑提示',
    submitResource: '提交推荐',
    homeFeatured: '首页精选',
    moreCategories: '更多分类',
    allCategories: '全部分类',
    searchPlaceholder: '全站资源毫秒级搜索...',
    searchModalPlaceholder: '键入关键词（如: AI, 免费, 视频, 密码, 书籍）...',
    searchNotFound: '未找到相关开源资源',
    searchTryOther: '换个关键词试试，或直接在 GitHub 提交新资源推荐！',
    instantSearch: '⚡ 毫秒级模糊检索',
    navSwitch: '切换',
    navVisit: '直达',
    categoryIndex: '分类索引',
    totalCount: '共 {count} 条',
    featuredTopTitle: '全站重磅精选 (Featured Top)',
    featuredTopSubtitle: '高星必装 · 零广告纯开源 · 点击左侧探索更多分类',
    filterPlaceholder: '在当前列表中即时筛选名称、功能或标签...',
    filterAll: '全部',
    filterVerified: '纯净认证',
    filterWarning: '避坑指引',
    recommendToCategory: '向本分类推荐新资源',
    visitDirect: '直达',
    copyLink: '复制链接',
    copied: '已复制！',
    feedbackFix: '反馈修正',
    trapWarning: '避坑提醒',
    trapGuideTitle: '避坑与使用说明',
    safeUsageNotice: '纯开源无套路，放心使用。',
    fmhyStarTitle: 'FMHY 社区推荐 · 标杆必装',
    fmhyCollectionTitle: '专题合集 / 专项清单',
    githubRepoTitle: '查看 GitHub 官方开源仓库源码',
    footerRights: '互联网上最大的干净、无广告、社区驱动的中文数字免费资源导航，开源！白嫖！避坑！',
    githubRepo: 'GitHub 仓库 & Fork PR ↗',
    submitNewIssue: '提交新资源 (Issue) ↗',
    mainSite: 'ITIS 主站 ↗',
    home: '首页',
  },
  en: {
    siteTitle: 'ITIS Free - Digital Free Resources Navigation Hub',
    siteSlogan: 'The cleanest, ad-free, community-driven digital free resource navigation wiki. 100% Free · Open Source · Trap-free.',
    brandBadge: 'Open Source · Free · Trap-free',
    badgeCommunity: 'Community Driven · The Anti-Bullshit Free Wiki',
    badgeNoAds: '✓ Zero Commercial Ads',
    badgeOpenSource: '✓ Open Source First',
    badgeWarnings: '✓ Trap Warnings',
    submitResource: 'Submit Resource',
    homeFeatured: 'Featured',
    moreCategories: 'More Categories',
    allCategories: 'All Categories',
    searchPlaceholder: 'Instant search resources...',
    searchModalPlaceholder: 'Type a keyword (e.g., AI, Adblock, Streaming, Password, Dev)...',
    searchNotFound: 'No matching open-source resources found',
    searchTryOther: 'Try another keyword or submit a pull request on GitHub!',
    instantSearch: '⚡ Sub-millisecond Fuzzy Search',
    navSwitch: 'Navigate',
    navVisit: 'Visit',
    categoryIndex: 'Categories',
    totalCount: '{count} items',
    featuredTopTitle: 'Featured Standouts & Must-Haves',
    featuredTopSubtitle: 'Top Starred · Ad-Free & Open-Source · Click sidebar to explore categories',
    filterPlaceholder: 'Filter in real time by name, feature, or platform...',
    filterAll: 'All',
    filterVerified: 'Verified',
    filterWarning: 'Heads-up',
    recommendToCategory: 'Suggest New Resource for this Category',
    visitDirect: 'Visit',
    copyLink: 'Copy Link',
    copied: 'Copied!',
    feedbackFix: 'Suggest Edit',
    trapWarning: 'Heads-up',
    trapGuideTitle: 'Caveats & Usage Advice',
    safeUsageNotice: 'Clean open-source, no catches or hidden paywalls.',
    fmhyStarTitle: 'FMHY Community Pick · Essential Tool',
    fmhyCollectionTitle: 'Curated Collection / Topic Index',
    githubRepoTitle: 'View Official Open Source Repository on GitHub',
    footerRights: 'The cleanest, ad-free, community-driven digital free resource directory. 100% Free · Open Source · Trap-free.',
    githubRepo: 'GitHub Repo & Fork PR ↗',
    submitNewIssue: 'Submit New Resource ↗',
    mainSite: 'ITIS Main ↗',
    home: 'Home',
  },
} as const;

export type TranslationKey = keyof typeof UI_TRANSLATIONS['zh'];

/**
 * Determine default language:
 * 1. Read from localStorage if user previously selected
 * 2. If first visit, detect navigator.language: zh* -> 'zh', others -> 'en'
 */
export function getInitialLang(): Lang {
  if (typeof window === 'undefined') return 'zh';
  const saved = localStorage.getItem('lang') as Lang | null;
  if (saved === 'zh' || saved === 'en') return saved;
  const browserLang = (navigator.language || (navigator.languages && navigator.languages[0]) || 'zh').toLowerCase();
  return browserLang.startsWith('zh') ? 'zh' : 'en';
}

/**
 * Custom React hook to reactively listen to language switch events
 */
export function useCurrentLang(): [Lang, (nextLang: Lang) => void] {
  const [lang, setLang] = useState<Lang>('zh');

  useEffect(() => {
    const initial = getInitialLang();
    setLang(initial);

    const handleLangChange = (e: CustomEvent<Lang>) => {
      setLang(e.detail);
    };

    window.addEventListener('lang-change' as any, handleLangChange as any);
    return () => {
      window.removeEventListener('lang-change' as any, handleLangChange as any);
    };
  }, []);

  const changeLang = (nextLang: Lang) => {
    setLang(nextLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lang', nextLang);
      document.documentElement.lang = nextLang === 'zh' ? 'zh-CN' : 'en';
      document.documentElement.setAttribute('data-lang', nextLang);
      window.dispatchEvent(new CustomEvent('lang-change', { detail: nextLang }));
      // Also notify any pure DOM listeners
      updateStaticDOMTexts(nextLang);
    }
  };

  return [lang, changeLang];
}

/**
 * Update any server-rendered static DOM nodes that carry data-i18n attributes
 */
export function updateStaticDOMTexts(lang: Lang) {
  if (typeof document === 'undefined') return;
  const elements = document.querySelectorAll<HTMLElement>('[data-i18n]');
  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n') as TranslationKey | null;
    if (key && UI_TRANSLATIONS[lang] && UI_TRANSLATIONS[lang][key]) {
      el.textContent = UI_TRANSLATIONS[lang][key];
    }
  });

  const zhEnDualElements = document.querySelectorAll<HTMLElement>('[data-i18n-zh]');
  zhEnDualElements.forEach((el) => {
    const zhText = el.getAttribute('data-i18n-zh');
    const enText = el.getAttribute('data-i18n-en');
    if (lang === 'en' && enText) {
      el.textContent = enText;
    } else if (lang === 'zh' && zhText) {
      el.textContent = zhText;
    }
  });
}
