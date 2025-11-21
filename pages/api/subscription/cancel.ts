import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing access token' });
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;
  console.debug('[subscription/cancel] Supabase URL present:', !!SUPABASE_URL);
  console.debug('[subscription/cancel] Service role key present:', !!SERVICE_ROLE_KEY);
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('[subscription/cancel] Missing Supabase server env keys. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
    return res.status(500).json({ error: 'Server misconfiguration: missing Supabase env keys' });
  }
  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  try {
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token as string);
    if (userError) {
      console.error('[subscription/cancel] supabaseAdmin.auth.getUser returned error:', userError.message || userError);
      return res.status(401).json({ error: 'Invalid or expired token', details: userError.message || String(userError) });
    }
    if (!userData || !userData.user) {
      console.error('[subscription/cancel] getUser returned no user data', userData);
      return res.status(401).json({ error: 'Invalid or expired token', details: 'no user data returned' });
    }
    const user = userData.user;
    const { data: treinador, error: treinadorError } = await supabaseAdmin
      .from('treinadores')
      .select('plano_atual')
      .eq('id', user.id)
      .single();
    if (treinadorError) {
      console.error('[subscription/cancel] Error fetching treinador in cancel:', treinadorError.message || treinadorError);
      return res.status(500).json({ error: 'Unable to fetch subscription info', details: treinadorError.message || String(treinadorError) });
    }
    if (treinador?.plano_atual === 'free' || !treinador?.plano_atual) {
      return res.status(400).json({ error: "Plano 'free' não pode ser cancelado." });
    }
    const { error: updateError } = await supabaseAdmin
      .from('treinadores')
      .update({ plano_atual: 'free', limite_alunos: 30 })
      .eq('id', user.id);
    if (updateError) {
      console.error('[subscription/cancel] Error updating treinador during cancel:', updateError.message || updateError);
      return res.status(500).json({ error: updateError.message || 'Error updating subscription' });
    }
    return res.status(200).json({ ok: true, message: 'Assinatura cancelada com sucesso.' });
  } catch (err: any) {
    console.error('[subscription/cancel] Unexpected error while processing:', err && err.message ? err.message : err);
    return res.status(500).json({ error: 'Unexpected error', details: err && err.message ? err.message : String(err) });
  }
}
