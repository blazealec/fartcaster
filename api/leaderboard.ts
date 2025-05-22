import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

// Initialize Upstash Redis using env vars UPSTASH_REDIS_REST_URL / TOKEN
const redis = Redis.fromEnv();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const { fid, increment = 1 } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!fid) return res.status(400).json({ error: 'fid required' });

      const key = `fart:${fid}`;
      const newTotal: number = await redis.incrby(key, increment);
      // store in sorted set for leaderboard
      await redis.zadd('fartboard', { score: newTotal, member: String(fid) });
      return res.json({ total: newTotal });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'server_error' });
    }
  }

  if (req.method === 'GET') {
    try {
      const top = await redis.zrevrange('fartboard', 0, 19, { withScores: true });
      const leaderboard: { fid: number; total: number }[] = [];
      for (let i = 0; i < top.length; i += 2) {
        leaderboard.push({ fid: parseInt(top[i]), total: parseInt(top[i + 1]) });
      }
      return res.json({ leaderboard });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'server_error' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).end('Method Not Allowed');
} 