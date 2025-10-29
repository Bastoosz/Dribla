import type { AppProps } from 'next/app';

// IMPORTANTE: Esta linha importa o CSS global (do arquivo acima)
// para toda a aplicação.
import '../styles/globals.css';

// Este é o componente padrão do Next.js
function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
