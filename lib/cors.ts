import { NextApiRequest, NextApiResponse } from 'next';

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://dribla.vercel.app',
  'https://dribla-git-main-bastooszs-projects.vercel.app', // Preview URLs
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean);

export function validateCORS(req: NextApiRequest, res: NextApiResponse): boolean {
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  
  // Se não tem origin (requisição same-origin ou curl/postman), permitir
  if (!origin) {
    return true;
  }

  // Verifica se a origem está na lista de permitidos
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

  // Se não está na lista, verifica se é uma preview URL do Vercel
  if (!isAllowed && origin.includes('.vercel.app')) {
    return true; // Permite todas as preview URLs do Vercel
  }

  if (!isAllowed) {
    console.error('CORS blocked:', { origin, referer, allowed: ALLOWED_ORIGINS });
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
