import type { ResourceItem } from '../types';
import aiData from '../content/resources/ai.json';
import adblockData from '../content/resources/adblock.json';
import mediaData from '../content/resources/media.json';
import softwareData from '../content/resources/software.json';
import booksData from '../content/resources/books.json';
import devData from '../content/resources/dev.json';

const allData: ResourceItem[] = [
  ...(aiData as ResourceItem[]),
  ...(adblockData as ResourceItem[]),
  ...(mediaData as ResourceItem[]),
  ...(softwareData as ResourceItem[]),
  ...(booksData as ResourceItem[]),
  ...(devData as ResourceItem[]),
];

export function getAllResources(): ResourceItem[] {
  return allData;
}

export function getResourcesByCategory(category: string): ResourceItem[] {
  return allData.filter((item) => item.category === category);
}

export function getFeaturedResources(): ResourceItem[] {
  return allData.filter((item) => item.featured);
}
