// pages/login.tsx

import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Estado para exibir o erro na UI

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Limpa erros anteriores

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    setLoading(false); // Para o loading após a tentativa

    if (signInError) {
      console.error("Erro no login:", signInError.message);
      // Define a mensagem de erro para ser exibida na UI
      setError(signInError.message || "E-mail ou senha inválidos."); 
      return; // Interrompe a execução se houver erro
    }

    if (data.user) {
      // Login bem-sucedido, redireciona para o dashboard principal
      router.push('/home-acao'); 
    } else {
       // Caso raro
       setError("Ocorreu um problema inesperado. Tente novamente.");
    }
  };

  return (
    <>
      <Head>
        <title>Dribla | Login</title>
      </Head>
      
      {/* Container simples, centralizado e dark mode */}
      <div className="min-h-screen flex items-center justify-center bg-dribla-graphite text-dribla-light p-4">
        <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
          <h1 className="text-3xl font-bold text-center mb-6 text-dribla-green">Acesse o Dribla</h1>
          
          {/* Exibe a mensagem de erro AQUI */}
          {error && <p className="mb-4 text-center text-red-500 bg-red-900/50 p-2 rounded">{error}</p>}

          {/* Formulário de Login */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
              <input 
                type="email" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-dribla-green focus:border-dribla-green sm:text-sm text-white"
                placeholder="treinador@escola.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">Senha</label>
              <input 
                type="password" 
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-dribla-green focus:border-dribla-green sm:text-sm text-white"
                placeholder="********"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading} // Desabilita apenas durante o loading
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-900 bg-dribla-green hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dribla-green transition duration-200 flex justify-center items-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Novo por aqui?{' '}
            <Link href="/cadastro" className="font-medium text-dribla-green hover:text-green-600">
              Crie sua conta agora
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;

