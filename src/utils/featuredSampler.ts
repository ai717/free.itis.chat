import type { ResourceItem } from '../types';
import { sortResourcesByDefault } from './score';

/**
 * Balanced sampling algorithm for featured standouts:
 * - Ensures all 23 categories have representation (up to 4 items each)
 * - Fills up to `limit` from the remaining featured/starred pool
 * - Shuffles randomly so every sample is distinct
 * - Retains deterministic multi-dimensional ranking on the final selected batch
 */
export function sampleFeaturedResources(pool: ResourceItem[], limit: number = 100): ResourceItem[] {
  if (!pool || pool.length === 0) return [];
  if (pool.length <= limit) return sortResourcesByDefault(pool);

  // Group by category to ensure cross-category diversity
  const catMap = new Map<string, ResourceItem[]>();
  pool.forEach((item) => {
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
    const remaining = shuffle(pool.filter((item) => !selectedSet.has(item.id)));
    for (const item of remaining) {
      if (selected.length >= limit) break;
      selectedSet.add(item.id);
      selected.push(item);
    }
  }

  const finalSample = selected.slice(0, limit);
  return sortResourcesByDefault(finalSample);
}
