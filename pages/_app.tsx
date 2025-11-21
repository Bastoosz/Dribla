import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css'; 
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider, Session } from '@supabase/auth-helpers-react';
import { useState } from 'react';
import { ToastProvider } from '../components/ui/Toast';

interface MyAppProps extends AppProps {
  pageProps: {
    initialSession: Session;
  };
}
function MyApp({ Component, pageProps }: MyAppProps) {
  const [supabaseClient] = useState(() => createPagesBrowserClient());
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Dribla - Sistema completo de gestão financeira para escolinhas de futebol. Controle de mensalidades, envio automatizado de cobranças e dashboard analítico." />
        <meta name="keywords" content="gestão escolinha futebol, controle mensalidades, sistema financeiro, saas futebol" />
        <meta name="author" content="Dribla" />
        <meta name="theme-color" content="#4CAF50" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Dribla - Gestão Financeira para Escolinhas de Futebol" />
        <meta property="og:description" content="Sistema completo de gestão financeira. Controle de mensalidades, cobranças automatizadas e relatórios em tempo real." />
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Dribla - Gestão Financeira para Escolinhas de Futebol" />
        <meta name="twitter:description" content="Sistema completo de gestão financeira. Controle de mensalidades, cobranças automatizadas e relatórios em tempo real." />
        <meta name="twitter:image" content="/og-image.png" />
        <link rel="icon" type="image/png" href="/favicon.png?v=2" />
        <link rel="shortcut icon" type="image/png" href="/favicon.png?v=2" />
        <link rel="apple-touch-icon" href="/favicon.png?v=2" />
        <link rel="canonical" href="https://dribla.vercel.app" />
        
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="Permissions-Policy" content="geolocation=(), microphone=(), camera=()" />
      </Head>
      <SessionContextProvider
        supabaseClient={supabaseClient}
        initialSession={pageProps.initialSession}
      >
        <ToastProvider>
          <Component {...pageProps} />
        </ToastProvider>
      </SessionContextProvider>
    </>
  );
}
export default MyApp;
