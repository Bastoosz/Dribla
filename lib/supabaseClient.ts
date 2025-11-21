import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

// Singleton para evitar múltiplas instâncias
let supabaseInstance: ReturnType<typeof createPagesBrowserClient> | null = null;

export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    if (typeof window === 'undefined') {
      throw new Error('getSupabaseClient só pode ser usado no browser');
    }
    supabaseInstance = createPagesBrowserClient();
  }
  return supabaseInstance;
};

// Para compatibilidade com código existente - sempre retorna cliente válido no browser
export const supabase = typeof window !== 'undefined' ? getSupabaseClient()! : null as any;

