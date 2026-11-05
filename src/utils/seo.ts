import type { ResourceItem, CategoryMeta } from '../types';

export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://free.itis.chat/#website',
    url: 'https://free.itis.chat/',
    name: 'ITIS Free',
    alternateName: [
      'ITIS Free 免费开源数字资源导航',
      'ITIS Free - Digital Free Resources Navigation Hub',
      'FMHY 中文版',
      'free.itis.chat',
    ],
    description: '互联网上最大的干净、无广告、社区驱动的中文数字免费资源导航，开源！白嫖！避坑！',
    inLanguage: ['zh-CN', 'en'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://free.itis.chat/?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://free.itis.chat/#organization',
    name: 'ITIS Free',
    url: 'https://free.itis.chat/',
    logo: 'https://free.itis.chat/favicon.svg',
    sameAs: [
      'https://github.com/ai717/free.itis.chat',
      'https://itis.chat',
    ],
  };
}

export function getItemListSchema(title: string, resources: ResourceItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    numberOfItems: resources.length,
    itemListElement: resources.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url,
      description: item.description,
    })),
  };
}

export function getCategoryPageSchema(category: CategoryMeta, resources: ResourceItem[]) {
  const canonicalUrl = `https://free.itis.chat/${category.id}/`;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: '首页',
          item: 'https://free.itis.chat/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: category.name,
          item: canonicalUrl,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: `${category.name} - ITIS Free`,
      description: category.description,
      inLanguage: ['zh-CN', 'en'],
      mainEntity: {
        '@type': 'ItemList',
        name: `${category.name} 收录清单`,
        numberOfItems: resources.length,
        itemListElement: resources.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          url: item.url,
          description: item.description,
        })),
      },
    },
  ];
}
