import { defineCollection, z } from 'astro:content';
import fs from 'node:fs';
import path from 'node:path';

const resources = defineCollection({
  loader: async () => {
    const dir = path.resolve('src/content/resources');
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
    const items = [];
    for (const f of files) {
      const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'));
      if (Array.isArray(data)) {
        items.push(...data);
      }
    }
    return items.map((item) => ({
      id: item.id,
      ...item,
    }));
  },
  schema: z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    description: z.string(),
    category: z.string(),
    tags: z.array(z.string()),
    safeguardStatus: z.enum(['verified', 'warning', 'danger']),
    warningText: z.string(),
    featured: z.boolean().optional(),
    isStarred: z.boolean().optional(),
    isCollection: z.boolean().optional(),
    githubUrl: z.string().optional(),
    platforms: z.array(z.string()).optional(),
    bentoSize: z.enum(['normal', 'wide', 'tall', 'large']).optional(),
  }),
});

export const collections = { resources };
