// pages/financeiro.tsx

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Loader2, CreditCard, Users, AlertTriangle } from 'lucide-react';

// Tipagem para os dados do Treinador
interface TreinadorInfo {
  planoAtual: 'free' | 'vip' | 'premium';
  limiteAlunos: number;
  totalAlunos: number; // Adicionamos a contagem atual
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
        // Buscar dados do treinador e contagem de alunos em paralelo
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

  // Função auxiliar para exibir nome amigável do plano
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
            <h1 className="text-3xl font-bold mb-8 text-white">Sua Assinatura Dribla</h1>

            <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700 space-y-6">
              {/* Informações do Plano Atual */}
              <div>
                <h2 className="text-xl font-semibold text-dribla-green mb-3 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" /> Plano Atual
                </h2>
                <p className="text-4xl font-bold text-white mb-1">{getPlanoNome(data.planoAtual)}</p>
                {data.planoAtual !== 'free' && (
                   <p className="text-sm text-gray-400">Renovação automática ativa.</p>
                   // Futuramente: Adicionar data da próxima cobrança
                )}
              </div>

              {/* Limites e Uso */}
              <div className="border-t border-gray-700 pt-6">
                 <h2 className="text-xl font-semibold text-dribla-green mb-3 flex items-center">
                   <Users className="w-5 h-5 mr-2" /> Limites e Uso
                 </h2>
                 <div className="flex items-baseline space-x-2">
                    <p className="text-3xl font-bold text-white">{data.totalAlunos}</p>
                    <p className="text-gray-400">/ {data.limiteAlunos === 99999 ? 'Ilimitado' : data.limiteAlunos} Alunos</p>
                 </div>
                 {/* Barra de Progresso (Opcional) */}
                 {data.limiteAlunos !== 99999 && (
                    <div className="w-full bg-gray-700 rounded-full h-2.5 mt-3">
                        <div
                            className="bg-dribla-green h-2.5 rounded-full"
                            style={{ width: `${(data.totalAlunos / data.limiteAlunos) * 100}%` }}
                        ></div>
                    </div>
                 )}
              </div>

               {/* Ações */}
               <div className="border-t border-gray-700 pt-6 flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                 {/* === CORREÇÃO AQUI === */}
                 <Link href="/planos">
                   <button className="w-full sm:w-auto px-6 py-2 bg-dribla-green text-gray-900 font-semibold rounded-lg hover:bg-green-600 transition duration-200 shadow-md">
                     Alterar Plano
                   </button>
                 </Link>
                 {/* Futuramente: Botão para Gerenciar Pagamento (Stripe/MP Portal) */}
                 {/* <button className="w-full sm:w-auto px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition duration-200">
                     Gerenciar Pagamento
                 </button> */}
               </div>

            </div>
          </div>
        )}

      </Layout>
    </>
  );
};

export default FinanceiroPage;

