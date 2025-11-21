import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Loader2, CreditCard, Users, AlertTriangle } from 'lucide-react';
interface TreinadorInfo {
  planoAtual: 'free' | 'vip' | 'premium';
  limiteAlunos: number;
  totalAlunos: number; 
}
const FinanceiroPage: React.FC = () => {
  const router = useRouter();
  const [data, setData] = useState<TreinadorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchFinanceiroData = async () => {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      try {
        const [treinadorPromise, alunosCountPromise] = await Promise.all([
          supabase
            .from('treinadores')
            .select('plano_atual, limite_alunos')
            .eq('id', user.id)
            .single(),
          supabase
            .from('alunos')
            .select('*', { count: 'exact', head: true })
            .eq('id_treinador', user.id)
        ]);
        if (treinadorPromise.error) throw new Error("Erro ao buscar dados da assinatura.");
        if (alunosCountPromise.error) throw new Error("Erro ao contar alunos.");
        setData({
          planoAtual: treinadorPromise.data.plano_atual,
          limiteAlunos: treinadorPromise.data.limite_alunos,
          totalAlunos: alunosCountPromise.count ?? 0,
        });
      } catch (err: any) {
        console.error("Erro na página Financeiro:", err.message);
        setError("Não foi possível carregar as informações financeiras.");
      } finally {
        setLoading(false);
      }
    };
    fetchFinanceiroData();
  }, [router]);
  const getPlanoNome = (plano: 'free' | 'vip' | 'premium'): string => {
    switch (plano) {
      case 'free': return 'Plano Free';
      case 'vip': return 'Plano VIP';
      case 'premium': return 'Plano Premium';
      default: return 'Desconhecido';
    }
  };
  return (
    <>
      <Head>
        <title>Dribla | Financeiro</title>
      </Head>
      <Layout title="Financeiro e Assinatura">
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 text-dribla-green animate-spin" />
          </div>
        )}
        {error && (
          <div className="p-4 mb-6 bg-red-900/50 text-red-400 rounded-lg border border-red-700 text-center">
            <AlertTriangle className="inline w-5 h-5 mr-2" /> {error}
          </div>
        )}
        {!loading && data && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-4 md:mb-6">
              <h1 className="text-xl md:text-2xl font-bold mb-1 text-white">Sua Assinatura Dribla</h1>
              <p className="text-xs md:text-sm text-gray-400">Gerencie seu plano e visualize seu uso</p>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 md:p-6 rounded-xl shadow-xl border border-gray-700 space-y-4 md:space-y-6">
              {}
              <div>
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-dribla-green/10 rounded-lg mr-2">
                    <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-dribla-green" />
                  </div>
                  <h2 className="text-base md:text-lg font-bold text-white">Plano Atual</h2>
                </div>
                <div className="bg-gray-900/50 p-3 md:p-4 rounded-lg border border-gray-700">
                  <p className="text-2xl md:text-3xl font-bold text-dribla-green mb-1">{getPlanoNome(data.planoAtual)}</p>
                  {data.planoAtual !== 'free' && (
                     <p className="text-xs text-gray-400 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-dribla-green rounded-full"></span>
                       Renovação automática ativa
                     </p>
                  )}
                </div>
              </div>
              {}
              <div className="border-t border-gray-700 pt-6">
                 <div className="flex items-center mb-3">
                   <div className="p-2 bg-dribla-green/10 rounded-lg mr-2">
                     <Users className="w-5 h-5 text-dribla-green" />
                   </div>
                   <h2 className="text-lg font-bold text-white">Limites e Uso</h2>
                 </div>
                 <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                   <div className="flex items-baseline space-x-2 mb-3">
                      <p className="text-3xl font-bold text-white">{data.totalAlunos}</p>
                      <p className="text-gray-400">/ {data.limiteAlunos === 99999 ? '∞' : data.limiteAlunos} Alunos</p>
                   </div>
                   {}
                   {data.limiteAlunos !== 99999 && (
                      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div
                              className="bg-gradient-to-r from-dribla-green to-dribla-green-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min((data.totalAlunos / data.limiteAlunos) * 100, 100)}%` }}
                          ></div>
                      </div>
                   )}
                 </div>
              </div>
               {}
               <div className="border-t border-gray-700 pt-6 flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                 <Link href="/planos">
                   <button className="w-full sm:w-auto px-6 py-2.5 bg-dribla-green text-gray-900 font-bold rounded-lg hover:bg-dribla-green-600 transition-all duration-200 shadow-lg shadow-dribla-green/20">
                     Alterar Plano
                   </button>
                 </Link>
               </div>
            </div>
          </div>
        )}
      </Layout>
    </>
  );
};
export default FinanceiroPage;
