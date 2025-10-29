// pages/cadastro.tsx

import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient'; 

const CadastroPage: React.FC = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Tentar Registrar no Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome } // Tentativa de salvar o nome na metadata do Auth
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // 2. Criar o Perfil Inicial na Tabela 'treinadores' (Plano FREE)
    if (data.user) {
      const { error: insertError } = await supabase.from('treinadores').insert({
        id: data.user.id,
        email: data.user.email,
        nome: nome,
        plano_atual: 'free',
        limite_alunos: 30, // Padrão para Plano FREE
      });

      if (insertError) {
        // Logar o erro, mas tentar prosseguir, pois o Auth já foi bem-sucedido
        // Em produção, isso exigiria um rollback ou mais tratamento
        console.error("Erro ao inserir perfil do treinador:", insertError.message);
        setError("Conta criada, mas houve um erro ao configurar seu perfil inicial. Tente fazer login.");
        setLoading(false);
        return;
      }

      // Sucesso total
      alert("Cadastro realizado! Verifique seu e-mail para confirmar a conta e acesse o Dribla.");
      router.push('/login');
    }
  };

  return (
    <>
      <Head>
        <title>Dribla | Crie sua Conta</title>
      </Head>
      
      {/* Container simples, centralizado e dark mode */}
      <div className="min-h-screen flex items-center justify-center bg-dribla-graphite text-dribla-light p-4">
        <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
          <h1 className="text-3xl font-bold text-center mb-6 text-dribla-green">Crie sua Conta Grátis</h1>
          
          {error && (
            <div className="p-3 mb-4 bg-dribla-orange/20 text-dribla-orange rounded-lg text-sm border border-dribla-orange">
              Erro: {error}
            </div>
          )}

          <form onSubmit={handleCadastro} className="space-y-6">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-300">Seu Nome / Nome da Escolinha</label>
              <input 
                type="text" 
                id="nome" 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-dribla-green focus:border-dribla-green sm:text-sm text-white"
                placeholder="Academia Bola de Ouro"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email (Será seu Login)</label>
              <input 
                type="email" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-dribla-green focus:border-dribla-green sm:text-sm text-white"
                placeholder="seuemail@contato.com"
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
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-2 px-4 rounded-md shadow-sm text-sm font-medium text-gray-900 bg-dribla-green hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dribla-green transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Criando Conta...' : 'Comece Grátis Agora'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Já tem uma conta?{' '}
            <Link href="/login" className="font-medium text-dribla-green hover:text-green-600">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default CadastroPage;
