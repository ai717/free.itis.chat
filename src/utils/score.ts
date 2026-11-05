import type { ResourceItem } from '../types';

/**
 * Deterministic multi-dimensional scoring algorithm for digital resources:
 * 1. Community Gold Star ⭐ (isStarred or featured): +1000 pts (Top priority)
 * 2. Open-source priority (has githubUrl): +150 pts
 * 3. Verified safe status: +50 pts
 * 4. Warning risk: -500 pts (Push risky/ad-heavy sites toward bottom)
 * 5. Danger: -1000 pts
 * 6. Tie-breaker: Alphabetical order (A-Z)
 */
export function scoreResource(item: ResourceItem): number {
  let score = 0;
  if (item.isStarred || item.featured) score += 1000;
  if (item.githubUrl) score += 150;
  if (item.safeguardStatus === 'verified') score += 50;
  else if (item.safeguardStatus === 'warning') score -= 500;
  else if (item.safeguardStatus === 'danger') score -= 1000;
  return score;
}

export function sortResourcesByDefault(items: ResourceItem[]): ResourceItem[] {
  return items.slice().sort((a, b) => {
    const scoreDiff = scoreResource(b) - scoreResource(a);
    if (scoreDiff !== 0) return scoreDiff;
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });
}
