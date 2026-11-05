import type { ResourceItem } from '../types';
import { scoreResource, sortResourcesByDefault } from './score';
import { sampleFeaturedResources } from './featuredSampler';

export { scoreResource, sortResourcesByDefault, sampleFeaturedResources };

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

/**
 * Returns the full pool of starred / featured resources (~1,865 items)
 */
export function getFeaturedPool(): ResourceItem[] {
  return allData.filter((item) => item.featured || item.isStarred);
}

/**
 * Pick 100 random balanced featured standouts across all categories:
 * - Ensures every category gets 3-4 top starred items represented
 * - Fills up to 100 items from the remaining high-star community favorites pool
 * - Applies deterministic ranking to the selected 100 items
 */
export function getFeaturedResources(limit: number = 100): ResourceItem[] {
  return sampleFeaturedResources(getFeaturedPool(), limit);
}

export function getSearchableResources(): ResourceItem[] {
  // Top starred gems for instant client-side modal search
  const starred = allData.filter((item) => item.featured || item.isStarred);
  return starred.length > 0 ? starred : allData.slice(0, 800);
}
