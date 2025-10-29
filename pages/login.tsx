// pages/login.tsx

import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient'; 

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Login bem-sucedido. Redireciona para o Dashboard (Zona de Ação).
      router.push('/home-acao');
    }
  };

  return (
    <>
      <Head>
        <title>Dribla | Login de Treinador</title>
      </Head>
      
      {/* Container simples, centralizado e dark mode */}
      <div className="min-h-screen flex items-center justify-center bg-dribla-graphite text-dribla-light p-4">
        <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
          <h1 className="text-3xl font-bold text-center mb-6 text-dribla-green">Acesse o Dribla</h1>
          
          {error && (
            <div className="p-3 mb-4 bg-dribla-orange/20 text-dribla-orange rounded-lg text-sm border border-dribla-orange">
              Erro: {error}
            </div>
          )}

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
              disabled={loading}
              className="w-full py-2 px-4 rounded-md shadow-sm text-sm font-medium text-gray-900 bg-dribla-green hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dribla-green transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Acessando...' : 'Entrar'}
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
