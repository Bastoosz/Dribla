import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from './logger';

interface BlockedIP {
  blockedUntil: number;
  reason: string;
  attempts: number;
}

interface DailyLimitTracker {
  count: number;
  resetTime: number;
}

const blockedIPs: Map<string, BlockedIP> = new Map();
const dailyLimits: Map<string, DailyLimitTracker> = new Map();
const suspiciousActivity: Map<string, number[]> = new Map();

const DAILY_EMAIL_LIMIT_PER_USER = 200;
const SUSPICIOUS_THRESHOLD = 5;
const BLOCK_DURATION = 3600000; // 1 hora
const PERMANENT_BLOCK_ATTEMPTS = 10;

function getIdentifier(req: NextApiRequest): string {
  return req.headers['x-forwarded-for'] as string || 
         req.socket.remoteAddress || 
         'unknown';
}

function getUserKey(userId: string): string {
  return `user:${userId}`;
}

export function checkIPBlock(req: NextApiRequest, res: NextApiResponse): boolean {
  const ip = getIdentifier(req);
  const blocked = blockedIPs.get(ip);

  if (blocked) {
    const now = Date.now();
    
    if (now < blocked.blockedUntil) {
      const remainingMinutes = Math.ceil((blocked.blockedUntil - now) / 60000);
      logger.warn('IP bloqueado tentou acessar', { 
        ip, 
        reason: blocked.reason,
        remainingMinutes 
      });
      
      res.status(403).json({
        error: 'Acesso bloqueado temporariamente',
        reason: 'Atividade suspeita detectada',
        retryAfter: remainingMinutes,
      });
      return false;
    } else {
      blockedIPs.delete(ip);
    }
  }

  return true;
}

export function blockIP(ip: string, reason: string, permanent: boolean = false): void {
  const duration = permanent ? 86400000 * 365 : BLOCK_DURATION; // 1 ano se permanente
  
  blockedIPs.set(ip, {
    blockedUntil: Date.now() + duration,
    reason,
    attempts: (blockedIPs.get(ip)?.attempts || 0) + 1,
  });

  logger.error('IP bloqueado', { ip, reason, permanent });
}

export function trackSuspiciousActivity(req: NextApiRequest): void {
  const ip = getIdentifier(req);
  const now = Date.now();
  const activities = suspiciousActivity.get(ip) || [];
  
  activities.push(now);
  
  const recentActivities = activities.filter(time => now - time < 300000); // últimos 5 minutos
  suspiciousActivity.set(ip, recentActivities);

  if (recentActivities.length >= SUSPICIOUS_THRESHOLD) {
    const blocked = blockedIPs.get(ip);
    const isPermanent = blocked && blocked.attempts >= PERMANENT_BLOCK_ATTEMPTS;
    
    blockIP(ip, 'Múltiplas tentativas suspeitas', isPermanent);
    logger.error('Atividade suspeita detectada', { 
      ip, 
      attempts: recentActivities.length,
      permanent: isPermanent 
    });
  }
}

export async function checkDailyEmailLimit(
  userId: string,
  emailCount: number
): Promise<{ allowed: boolean; remaining: number; reason?: string }> {
  const key = getUserKey(userId);
  const now = Date.now();
  const limit = dailyLimits.get(key);

  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const resetTime = midnight.getTime();

  if (!limit || now > limit.resetTime) {
    dailyLimits.set(key, {
      count: emailCount,
      resetTime,
    });
    return { 
      allowed: true, 
      remaining: DAILY_EMAIL_LIMIT_PER_USER - emailCount 
    };
  }

  const newCount = limit.count + emailCount;

  if (newCount > DAILY_EMAIL_LIMIT_PER_USER) {
    logger.warn('Limite diário de emails excedido', { 
      userId, 
      attempted: emailCount,
      current: limit.count,
      limit: DAILY_EMAIL_LIMIT_PER_USER 
    });
    
    return {
      allowed: false,
      remaining: 0,
      reason: `Limite diário de ${DAILY_EMAIL_LIMIT_PER_USER} emails atingido. Tente novamente amanhã.`,
    };
  }

  dailyLimits.set(key, {
    count: newCount,
    resetTime: limit.resetTime,
  });

  return {
    allowed: true,
    remaining: DAILY_EMAIL_LIMIT_PER_USER - newCount,
  };
}

export function validateEmailRecipients(emails: any[]): { valid: boolean; reason?: string } {
  if (emails.length === 0) {
    return { valid: false, reason: 'Nenhum destinatário fornecido' };
  }

  if (emails.length > 50) {
    return { valid: false, reason: 'Máximo de 50 emails por requisição' };
  }

  const uniqueEmails = new Set(emails.map(e => e.emailResponsavel?.toLowerCase()));
  
  if (uniqueEmails.size !== emails.length) {
    logger.warn('Emails duplicados detectados na requisição');
  }

  const suspiciousPatterns = [
    /temp.*mail/i,
    /trash.*mail/i,
    /disposable/i,
    /10minute/i,
    /guerrilla/i,
  ];

  for (const email of emails) {
    if (!email.emailResponsavel || typeof email.emailResponsavel !== 'string') {
      return { valid: false, reason: 'Email inválido detectado' };
    }

    const isSuspicious = suspiciousPatterns.some(pattern => 
      pattern.test(email.emailResponsavel)
    );

    if (isSuspicious) {
      logger.warn('Email temporário/descartável detectado', { 
        email: email.emailResponsavel 
      });
      return { 
        valid: false, 
        reason: 'Emails temporários ou descartáveis não são permitidos' 
      };
    }
  }

  return { valid: true };
}

setInterval(() => {
  const now = Date.now();
  
  blockedIPs.forEach((blocked, ip) => {
    if (now > blocked.blockedUntil && blocked.attempts < PERMANENT_BLOCK_ATTEMPTS) {
      blockedIPs.delete(ip);
    }
  });

  suspiciousActivity.forEach((activities, ip) => {
    const recentActivities = activities.filter((time: number) => now - time < 300000);
    if (recentActivities.length === 0) {
      suspiciousActivity.delete(ip);
    } else {
      suspiciousActivity.set(ip, recentActivities);
    }
  });

  dailyLimits.forEach((limit, key) => {
    if (now > limit.resetTime) {
      dailyLimits.delete(key);
    }
  });
}, 60000); // Limpeza a cada 1 minuto

export function getSecurityMetrics() {
  return {
    blockedIPs: blockedIPs.size,
    suspiciousIPs: suspiciousActivity.size,
    activeUsers: dailyLimits.size,
  };
}
