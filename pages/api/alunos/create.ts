import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { applyRateLimit } from '../../../lib/rateLimit';
import { sanitizeString, sanitizeEmail, sanitizeNumber } from '../../../lib/sanitize';
import { validateCORS } from '../../../lib/cors';
import { logger } from '../../../lib/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now();

  if (!validateCORS(req, res)) {
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await applyRateLimit(req, res, {
      windowMs: 60000,
      maxRequests: 20,
    });
  } catch (error) {
    return;
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing access token' });
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('Missing Supabase server env keys');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }
  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData?.user) {
    console.error('Invalid token in /api/alunos/create', userError);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  const user = userData.user;
  try {
    const { data: treinador, error: treinadorError } = await supabaseAdmin
      .from('treinadores')
      .select('plano_atual, limite_alunos')
      .eq('id', user.id)
      .single();
    if (treinadorError) {
      console.debug('Treinador lookup error:', treinadorError);
    }
    const limite = treinador?.limite_alunos ?? 30;
    const { count, error: countError } = await supabaseAdmin
      .from('alunos')
      .select('*', { count: 'exact', head: true })
      .eq('id_treinador', user.id);
    if (countError) {
      console.error('Count error', countError);
      return res.status(500).json({ error: 'Erro ao verificar limite' });
    }
    if (limite !== 99999 && typeof count === 'number' && count >= limite) {
      return res.status(403).json({ error: 'Limite de alunos atingido' });
    }
    const payload = req.body || {};

    if (payload.nome) payload.nome = sanitizeString(payload.nome);
    if (payload.email_responsavel) payload.email_responsavel = sanitizeEmail(payload.email_responsavel);
    if (payload.telefone) payload.telefone = sanitizeString(payload.telefone);
    if (payload.endereco) payload.endereco = sanitizeString(payload.endereco);
    if (payload.observacoes) payload.observacoes = sanitizeString(payload.observacoes);
    if (payload.dia_vencimento) payload.dia_vencimento = sanitizeNumber(payload.dia_vencimento);
    if (payload.valor_mensalidade) payload.valor_mensalidade = sanitizeNumber(payload.valor_mensalidade);

    const record = {
      ...payload,
      id_treinador: user.id,
    };
    const { error: insertError } = await supabaseAdmin
      .from('alunos')
      .insert(record);
    if (insertError) {
      console.error('Insert error', insertError);
      return res.status(500).json({ error: insertError.message });
    }
    const duration = Date.now() - startTime;
    logger.info('Aluno criado com sucesso', {
      userId: user.id,
      duration: `${duration}ms`,
    });

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    const duration = Date.now() - startTime;
    logger.error('Erro ao criar aluno', {
      error: err.message,
      duration: `${duration}ms`,
    });
    
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
}
