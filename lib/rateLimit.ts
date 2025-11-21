import { NextApiRequest, NextApiResponse } from 'next';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

export function rateLimit(options: { windowMs: number; maxRequests: number }) {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const identifier = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const key = `${identifier}:${req.url}`;
    const now = Date.now();
    
    if (!rateLimitStore[key] || now > rateLimitStore[key].resetTime) {
      rateLimitStore[key] = {
        count: 1,
        resetTime: now + options.windowMs,
      };
      return next();
    }
    
    if (rateLimitStore[key].count >= options.maxRequests) {
      return res.status(429).json({
        error: 'Muitas requisições. Tente novamente em alguns minutos.',
        retryAfter: Math.ceil((rateLimitStore[key].resetTime - now) / 1000),
      });
    }
    
    rateLimitStore[key].count++;
    next();
  };
}

export function applyRateLimit(req: NextApiRequest, res: NextApiResponse, options: { windowMs: number; maxRequests: number }): Promise<void> {
  return new Promise((resolve, reject) => {
    rateLimit(options)(req, res, () => resolve());
  });
}

setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach(key => {
    if (now > rateLimitStore[key].resetTime) {
      delete rateLimitStore[key];
    }
  });
}, 60000);
