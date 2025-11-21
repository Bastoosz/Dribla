import { NextApiRequest, NextApiResponse } from 'next';

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://dribla.vercel.app',
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean);

export function validateCORS(req: NextApiRequest, res: NextApiResponse): boolean {
  const origin = req.headers.origin || req.headers.referer;
  
  if (!origin) {
    return true;
  }

  const isAllowed = ALLOWED_ORIGINS.some(allowed => {
    if (!allowed) return false;
    try {
      const originUrl = new URL(origin);
      const allowedUrl = new URL(allowed);
      return originUrl.origin === allowedUrl.origin;
    } catch {
      return false;
    }
  });

  if (!isAllowed) {
    res.status(403).json({ error: 'Origem não autorizada' });
    return false;
  }

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return false;
  }

  return true;
}
