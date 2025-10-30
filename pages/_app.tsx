import type { AppProps } from 'next/app';
import '../styles/globals.css'; 

// Importações do Supabase Auth Helpers (MUITO IMPORTANTE - Mantenha isto!)
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider, Session } from '@supabase/auth-helpers-react';
import { useState } from 'react';

// Define o tipo das props para incluir 'initialSession'
interface MyAppProps extends AppProps {
  pageProps: {
    initialSession: Session;
  };
}

function MyApp({ Component, pageProps }: MyAppProps) {
  // Cria o cliente Supabase (necessário para o Provedor)
  const [supabaseClient] = useState(() => createPagesBrowserClient());

  return (
    // Envolve a aplicação no Provedor de Sessão
    <SessionContextProvider
        supabaseClient={supabaseClient}
        initialSession={pageProps.initialSession}
    >
      <Component {...pageProps} />
      
      {/* TODOS OS SCRIPTS DO CHATBASE/TAWK.TO FORAM REMOVIDOS DAQUI */}
      
    </SessionContextProvider>
  );
}

export default MyApp;

