export type SafeguardStatus = 'verified' | 'warning' | 'danger';
export type BentoSize = 'normal' | 'wide' | 'tall' | 'large';

export interface ResourceItem {
  id: string;
  name: string;
  url: string;
  description: string;
  category: string;
  tags: string[];
  safeguardStatus: SafeguardStatus;
  warningText: string;
  featured?: boolean;
  bentoSize?: BentoSize;
}

export interface CategoryMeta {
  id: string;
  name: string;
  enName: string;
  icon: string;
  description: string;
  gradient: string;
}
