import type { ResourceItem } from '../types';
import { scoreResource, sortResourcesByDefault } from './score';

export { scoreResource, sortResourcesByDefault };

const resourceFiles = import.meta.glob<{ default: ResourceItem[] }>('../content/resources/*.json', {
  eager: true,
});

const allData: ResourceItem[] = sortResourcesByDefault(
  Object.values(resourceFiles).flatMap((module) => module.default)
);

export function getAllResources(): ResourceItem[] {
  return allData;
}

export function getResourcesByCategory(category: string): ResourceItem[] {
  return allData.filter((item) => item.category === category);
}

export function getFeaturedResources(): ResourceItem[] {
  // Top starred & featured standouts across all categories
  const featured = allData.filter((item) => item.featured || item.isStarred);
  return sortResourcesByDefault(featured);
}

export function getSearchableResources(): ResourceItem[] {
  // Top starred gems for instant client-side modal search
  const starred = allData.filter((item) => item.featured || item.isStarred);
  return starred.length > 0 ? starred : allData.slice(0, 800);
}
