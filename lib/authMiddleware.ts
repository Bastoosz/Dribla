import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export async function validateAuth(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createPagesServerClient({ req, res });
  
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    return { authenticated: false, userId: null, error: 'Não autenticado' };
  }
  
  return { authenticated: true, userId: session.user.id, user: session.user };
}

export function requireAuth(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const auth = await validateAuth(req, res);
    
    if (!auth.authenticated) {
      return res.status(401).json({ error: 'Não autenticado. Faça login para continuar.' });
    }
    
    req.user = auth.user;
    return handler(req, res);
  };
}

declare module 'http' {
  interface IncomingMessage {
    user?: any;
  }
}
