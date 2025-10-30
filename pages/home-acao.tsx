// pages/home-acao.tsx

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from 'components/Layout';
import { supabase } from 'lib/supabaseClient';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Loader2, Users, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import type { Aluno } from 'types/aluno.ts';

// Tipagem para os dados do Dashboard
interface DashboardData {
  atrasadosCount: number;
  atrasadosValorTotal: number;
  proximosCount: number;
  pagosCount: number;
  totalAlunos: number;
  planoAtual: 'free' | 'vip' | 'premium';
  limiteAlunos: number;
}

const HomeAcao: React.FC = () => {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Define as datas para as queries dinâmicas
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); 
    const hojeISO = hoje.toISOString().slice(0, 10);

    const cincoDias = new Date(hoje);
    cincoDias.setDate(hoje.getDate() + 5);
    const cincoDiasFrenteISO = cincoDias.toISOString().slice(0, 10);


    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const [
          treinadorPromise,
          atrasadosPromise,
          proximosPromise,
          pagosPromise,
          totalAlunosPromise
        ] = await Promise.all([
          // 1. Busca dados do Treinador
          supabase
            .from('treinadores')
            .select('plano_atual, limite_alunos')
            .eq('id', user.id)
            .single(),
          
          // 2. Busca Atrasados (LÓGICA CORRIGIDA)
          supabase
            .from('alunos')
            .select('valor_mensalidade', { count: 'exact' })
            .eq('id_treinador', user.id)
            .eq('status_mensalidade', 'pendente')
            .lt('data_vencimento_mensalidade', hojeISO),

          // 3. Busca Próximos (LÓGICA CORRIGIDA)
          supabase
            .from('alunos')
            .select('*', { count: 'exact', head: true })
            .eq('id_treinador', user.id)
            .eq('status_mensalidade', 'pendente')
            .gte('data_vencimento_mensalidade', hojeISO)
            .lte('data_vencimento_mensalidade', cincoDiasFrenteISO),

          // 4. Busca Em Dia (Pagos OU Pendentes no futuro)
          supabase
            .from('alunos')
            .select('*', { count: 'exact', head: true }) 
            .eq('id_treinador', user.id)
            .or(
              `status_mensalidade.eq.pago,and(status_mensalidade.eq.pendente,data_vencimento_mensalidade.gt.${cincoDiasFrenteISO})`
            ),

          // 5. Busca Total de Alunos
          supabase
            .from('alunos')
            .select('*', { count: 'exact', head: true }) 
            .eq('id_treinador', user.id),
        ]);

        // Processamento...
        if (treinadorPromise.error) throw new Error("Erro ao buscar dados do plano.");
        if (atrasadosPromise.error) throw new Error("Erro ao buscar alunos atrasados.");
        if (proximosPromise.error) throw new Error("Erro ao buscar próximos vencimentos.");
        if (pagosPromise.error) throw new Error("Erro ao buscar alunos em dia.");
        if (totalAlunosPromise.error) throw new Error("Erro ao buscar total de alunos.");

        const treinadorInfo = treinadorPromise.data;
        
        const atrasadosCount = atrasadosPromise.count ?? 0;
        let atrasadosValorTotal = 0;
        if (atrasadosPromise.data) {
           atrasadosValorTotal = atrasadosPromise.data.reduce((sum, aluno) => sum + (aluno.valor_mensalidade || 0), 0);
        }
        
        const proximosCount = proximosPromise.count ?? 0;
        const pagosCount = pagosPromise.count ?? 0;
        const totalAlunos = totalAlunosPromise.count ?? 0;

        setData({
          atrasadosCount,
          atrasadosValorTotal,
          proximosCount,
          pagosCount,
          totalAlunos,
          planoAtual: treinadorInfo.plano_atual,
          limiteAlunos: treinadorInfo.limite_alunos,
        });

      } catch (err: any) {
        console.error("Erro no Dashboard:", err.message);
        setError("Não foi possível carregar os dados do painel.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <>
      <Head>
        <title>Dribla | Zona de Ação</title>
      </Head>
      <Layout title="Zona de Ação Financeira">
        
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 text-dribla-green animate-spin" />
          </div>
        )}

        {error && (
          <div className="p-4 mb-6 bg-dribla-orange/20 text-dribla-orange rounded-lg border border-dribla-orange text-center">
            {error}
          </div>
        )}

        {!loading && data && (
          <>
            <h1 className="text-3xl font-bold mb-8 text-white">Status Financeiro, Treinador!</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* Card 1: INADIMPLÊNCIA (Vencidos) */}
              <div className="bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-dribla-orange">
                <h2 className="text-lg font-semibold text-gray-200 mb-3 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-dribla-orange" /> Atrasados
                </h2>
                <p className="text-4xl font-extrabold text-dribla-orange mb-3">
                  {formatCurrency(data.atrasadosValorTotal)}
                </p>
                <p className="text-gray-400 mb-5 text-sm">{data.atrasadosCount} Alunos</p>
                <Link href="/elenco?filtro=vencida">
                  <button className="w-full py-2 bg-dribla-orange text-gray-900 font-bold rounded-lg hover:bg-orange-500 transition duration-200 text-sm">
                    Resolver Agora
                  </button>
                </Link>
              </div>

              {/* --- CORREÇÃO DE COR AQUI --- */}
              {/* Card 2: PRÓXIMOS VENCIMENTOS (Amarelo) */}
              <div className="bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
                <h2 className="text-lg font-semibold text-gray-200 mb-3 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-yellow-500" /> Próximos a Vencer
                </h2>
                <p className="text-4xl font-extrabold text-yellow-500 mb-3">{data.proximosCount}</p>
                <p className="text-gray-400 mb-5 text-sm">(Próximos 5 dias)</p>
                 <Link href="/elenco?filtro=proximo">
                  <button className="w-full py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-yellow-500 hover:text-gray-900 transition duration-200 text-sm">
                    Ver Alunos
                  </button>
                 </Link>
              </div>

              {/* Card 3: PAGOS (EM DIA) */}
              <div className="bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-dribla-green">
                <h2 className="text-lg font-semibold text-gray-200 mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-dribla-green" /> Em Dia
                </h2>
                <p className="text-4xl font-extrabold text-dribla-green mb-3">{data.pagosCount}</p>
                <p className="text-gray-400 mb-5 text-sm">(Pagamento seguro)</p>
                 <Link href="/elenco?filtro=paga">
                  <button className="w-full py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-dribla-green hover:text-gray-900 transition duration-200 text-sm">
                    Ver Alunos
                  </button>
                 </Link>
              </div>
            </div>

            {/* Seção de Ocupação do Time */}
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className='text-center md:text-left'>
                <h2 className="text-lg font-semibold text-white mb-1 flex items-center">
                  <Users className='w-5 h-5 mr-2 text-dribla-green'/> Status do seu Plano
                </h2>
                <p className='text-gray-400 text-sm'>
                  Plano: <span className='font-bold uppercase text-dribla-green'>{data.planoAtual}</span> | 
                  Ocupação: <span className='font-bold text-white'>{data.totalAlunos}</span> / <span className='text-gray-500'>{data.limiteAlunos === 99999 ? 'Ilimitado' : data.limiteAlunos}</span>
                </p>
              </div>
              <div className='flex space-x-4'>
                <Link href="/planos">
                    <button className='px-4 py-2 text-sm bg-gray-700 hover:bg-dribla-green hover:text-gray-900 rounded-lg transition duration-200'>
                        Fazer Upgrade
                    </button>
                </Link>
                 <Link href="/elenco">
                    <button className='btn-primary px-4 py-2 text-sm'>
                        Gerenciar Elenco
                    </button>
                 </Link>
              </div>
            </div>
          </>
        )}
      </Layout>
    </>
  );
};

export default HomeAcao;