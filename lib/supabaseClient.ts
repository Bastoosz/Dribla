import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

// Singleton para evitar múltiplas instâncias
let supabaseInstance: ReturnType<typeof createPagesBrowserClient> | null = null;

export const getSupabaseClient = () => {
  if (!supabaseInstance && typeof window !== 'undefined') {
    supabaseInstance = createPagesBrowserClient();
  }
  return supabaseInstance;
};

// Para compatibilidade com código existente
export const supabase = typeof window !== 'undefined' ? getSupabaseClient() : null;

