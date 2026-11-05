export type SafeguardStatus = 'verified' | 'warning' | 'danger';
export type BentoSize = 'normal' | 'wide' | 'tall' | 'large';

export type PlatformType = 'web' | 'win' | 'mac' | 'linux' | 'android' | 'ios' | 'docker';

export type Lang = 'zh' | 'en';

export interface ResourceItem {
  id: string;
  name: string;
  url: string;
  description: string;
  descriptionEn?: string;
  category: string;
  tags: string[];
  tagsEn?: string[];
  safeguardStatus: SafeguardStatus;
  warningText: string;
  warningTextEn?: string;
  featured?: boolean;
  isStarred?: boolean;      // FMHY 社区金星必装推荐 ⭐
  isCollection?: boolean;   // 专题聚合 / 重定向列表 🔄
  githubUrl?: string;       // GitHub 源码仓库地址
  platforms?: PlatformType[]; // 支持的平台
  bentoSize?: BentoSize;
}

export interface CategoryMeta {
  id: string;
  name: string;
  enName: string;
  icon: string;
  description: string;
  descriptionEn?: string;
  gradient: string;
}
