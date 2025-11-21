import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';
import { BeamsBackground } from '../components/ui/BeamsBackground';
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
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: { nome: nome } 
      }
    });
    if (signUpError) {
      console.error("Erro no cadastro:", signUpError.message);
      setError(signUpError.message || "Erro ao criar conta. Verifique os dados.");
      setLoading(false);
      return;
    }
    if (signUpData.user) {
        setSuccess("Conta criada com sucesso! Redirecionando para o login...");
        setTimeout(() => {
          router.push('/login');
        }, 2000);
    } else {
         setError("Ocorreu um problema inesperado. Tente novamente.");
         setLoading(false);
    }
  };
  return (
    <>
      <Head>
        <title>Dribla | Crie sua Conta</title>
      </Head>
      <div className="relative min-h-screen flex items-center justify-center bg-dribla-graphite text-dribla-light p-4">
        <BeamsBackground 
          intensity="medium" 
          className="fixed inset-0"
        />
        <div className="relative z-10 w-full max-w-md bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-white">Crie sua Conta</h1>
            <p className="text-gray-400">Comece grátis, sem cartão de crédito</p>
          </div>
          {error && <p className="mb-4 text-center text-red-400 bg-red-900/50 backdrop-blur-sm p-3 rounded-lg border border-red-800">{error}</p>}
          {success && <p className="mb-4 text-center text-dribla-green bg-green-900/50 backdrop-blur-sm p-3 rounded-lg border border-dribla-green/30">{success}</p>}
          {}
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
                minLength={6} 
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-dribla-green focus:border-dribla-green sm:text-sm text-white"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || !!success}
              className={`w-full py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-gray-900 bg-dribla-green hover:bg-dribla-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dribla-green transition-all duration-200 flex justify-center items-center hover:scale-105 shadow-dribla-green/20 ${loading || success ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar Conta Grátis'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-400">
            Já tem uma conta?{' '}
            <Link href="/login" className="font-semibold text-dribla-green hover:text-dribla-green-600 transition-colors">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};
export default CadastroPage;
