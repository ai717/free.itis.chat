import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://free.itis.chat',
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes('/icons'),
      changefreq: 'daily',
      priority: 0.9,
      lastmod: new Date(),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
