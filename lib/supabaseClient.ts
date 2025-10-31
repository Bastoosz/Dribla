import { createClient } from '@supabase/supabase-js';

// Variáveis de ambiente devem ser configuradas no Vercel e no .env.local

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verifica se as chaves existem antes de criar o cliente

if (!supabaseUrl || !supabaseAnonKey) {

  // Lançar um erro claro para o ambiente de desenvolvimento/compilação
  throw new Error("As variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY devem estar definidas.");
  
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
