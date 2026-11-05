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

/**
 * Pick 100 random balanced featured standouts across all categories:
 * - Ensures every category gets 3-4 top starred items represented
 * - Fills up to 100 items from the remaining high-star community favorites pool
 * - Applies deterministic ranking to the selected 100 items
 */
export function getFeaturedResources(limit: number = 100): ResourceItem[] {
  const starredPool = allData.filter((item) => item.featured || item.isStarred);

  // Group by category to ensure cross-category diversity
  const catMap = new Map<string, ResourceItem[]>();
  starredPool.forEach((item) => {
    const list = catMap.get(item.category) || [];
    list.push(item);
    catMap.set(item.category, list);
  });

  const shuffle = <T>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const selectedSet = new Set<string>();
  const selected: ResourceItem[] = [];

  // Pick up to 4 items from each category
  catMap.forEach((items) => {
    const shuffledCat = shuffle(items);
    const take = shuffledCat.slice(0, 4);
    take.forEach((item) => {
      if (!selectedSet.has(item.id)) {
        selectedSet.add(item.id);
        selected.push(item);
      }
    });
  });

  // Fill up to limit with remaining items
  if (selected.length < limit) {
    const remaining = shuffle(starredPool.filter((item) => !selectedSet.has(item.id)));
    for (const item of remaining) {
      if (selected.length >= limit) break;
      selectedSet.add(item.id);
      selected.push(item);
    }
  }

  const finalSample = selected.slice(0, limit);
  return sortResourcesByDefault(finalSample);
}

export function getSearchableResources(): ResourceItem[] {
  // Top starred gems for instant client-side modal search
  const starred = allData.filter((item) => item.featured || item.isStarred);
  return starred.length > 0 ? starred : allData.slice(0, 800);
}
