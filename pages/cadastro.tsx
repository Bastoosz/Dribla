// pages/cadastro.tsx

import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient'; // Importa o cliente Supabase
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';

const CadastroPage: React.FC = () => {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // 1. Registrar o usuário no Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        // Passa o nome para ser usado pelo trigger no Supabase
        data: { nome: nome } 
      }
    });

    if (signUpError) {
      console.error("Erro no cadastro:", signUpError.message);
      setError(signUpError.message || "Erro ao criar conta. Verifique os dados.");
      setLoading(false);
      return;
    }

    // --- REMOVIDO: A TENTATIVA DE INSERT MANUAL FOI RETIRADA DAQUI ---
    // O Gatilho no Supabase (handle_new_user) cuidará da criação
    // da linha na tabela 'treinadores'.

    if (signUpData.user) {
        setSuccess("Conta criada com sucesso! Redirecionando para o login...");
        // Redireciona para o login após um pequeno atraso
        setTimeout(() => {
          router.push('/login');
        }, 2000);
    } else {
        // Caso raro onde o user não é retornado, mas não houve erro
         setError("Ocorreu um problema inesperado. Tente novamente.");
         setLoading(false);
    }

    // Não precisamos mais esperar a inserção, setLoading(false) agora é implícito no sucesso/erro final
  };

  return (
    <>
      <Head>
        <title>Dribla | Crie sua Conta</title>
      </Head>
      
      {/* Container simples, centralizado e dark mode */}
      <div className="min-h-screen flex items-center justify-center bg-dribla-graphite text-dribla-light p-4">
        <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
          <h1 className="text-3xl font-bold text-center mb-6 text-dribla-green">Crie sua Conta Dribla</h1>
          
          {error && <p className="mb-4 text-center text-red-500 bg-red-900/50 p-2 rounded">{error}</p>}
          {success && <p className="mb-4 text-center text-dribla-green bg-green-900/50 p-2 rounded">{success}</p>}

          {/* Formulário de Cadastro */}
          <form onSubmit={handleCadastro} className="space-y-6">
             <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-300">Nome ou Nome da Escolinha</label>
              <input 
                type="text" 
                id="nome" 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-dribla-green focus:border-dribla-green sm:text-sm text-white"
                placeholder="Ex: Treinador Silva"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
              <input 
                type="email" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-dribla-green focus:border-dribla-green sm:text-sm text-white"
                placeholder="seuemail@exemplo.com"
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
                minLength={6} // Supabase exige mínimo de 6 caracteres
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-dribla-green focus:border-dribla-green sm:text-sm text-white"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading || !!success} // Desabilita se estiver carregando ou se já deu sucesso
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-900 bg-dribla-green hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dribla-green transition duration-200 flex justify-center items-center ${loading || success ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar Conta Grátis'}
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

