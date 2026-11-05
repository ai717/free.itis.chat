import type { APIRoute } from 'astro';
import { getFeaturedPool } from '../utils/resources';

export const GET: APIRoute = async () => {
  const pool = getFeaturedPool();
  return new Response(JSON.stringify(pool), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
