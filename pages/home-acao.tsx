import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Loader2, DollarSign, Users, AlertTriangle, Clock } from 'lucide-react';

// Tipagem para os dados do Dashboard
interface DashboardData {
  atrasadosCount: number;
  atrasadosValorTotal: number;
  proximosCount: number;
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
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      // 1. Pega o Usuário (Auth)
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      try {
        // --- Executar todas as queries em paralelo ---
        const [
          treinadorPromise,
          atrasadosPromise,
          proximosPromise,
          totalAlunosPromise
        ] = await Promise.all([
          // Busca dados do Treinador
          supabase
            .from('treinadores')
            .select('plano_atual, limite_alunos')
            .eq('id', user.id)
            .single(),
          
          // Busca Atrasados (Contagem e Soma)
          supabase
            .from('alunos')
            .select('valor_mensalidade', { count: 'exact' }) // Pega valor para somar e a contagem
            .eq('id_treinador', user.id)
            .eq('status_mensalidade', 'vencida'),

          // Busca Próximos (Apenas Contagem)
          supabase
            .from('alunos')
            .select('*', { count: 'exact', head: true }) // head: true só conta, não retorna dados
            .eq('id_treinador', user.id)
            .eq('status_mensalidade', 'proximo'),

          // Busca Total de Alunos (Apenas Contagem)
          supabase
            .from('alunos')
            .select('*', { count: 'exact', head: true }) 
            .eq('id_treinador', user.id),
        ]);

        // --- Processar os Resultados ---

        // Treinador
        if (treinadorPromise.error) throw new Error("Erro ao buscar dados do plano.");
        const treinadorInfo = treinadorPromise.data;

        // Atrasados
        if (atrasadosPromise.error) throw new Error("Erro ao buscar alunos atrasados.");
        const atrasadosCount = atrasadosPromise.count ?? 0;
        // Calcula a soma dos valores - IMPORTANTE: Supabase não faz SUM direto com count na mesma query via JS client
        // A melhor forma seria uma Supabase Function (RPC) ou calcular no client-side
        let atrasadosValorTotal = 0;
        if (atrasadosPromise.data) {
           atrasadosValorTotal = atrasadosPromise.data.reduce((sum, aluno) => sum + (aluno.valor_mensalidade || 0), 0);
        }


        // Próximos
        if (proximosPromise.error) throw new Error("Erro ao buscar próximos vencimentos.");
        const proximosCount = proximosPromise.count ?? 0;

        // Total Alunos
        if (totalAlunosPromise.error) throw new Error("Erro ao buscar total de alunos.");
        const totalAlunos = totalAlunosPromise.count ?? 0;

        // --- Atualizar Estado ---
        setData({
          atrasadosCount,
          atrasadosValorTotal,
          proximosCount,
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

  // --- Funções Auxiliares de Formatação ---
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
            <h1 className="text-3xl font-bold mb-8 text-white">Pronto para a Ação, Treinador!</h1>
            
            {/* DOIS CARTÕES GIGANTES de Foco (AGORA COM DADOS REAIS) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Cartão 1: INADIMPLÊNCIA */}
              <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border-l-4 border-dribla-orange">
                <h2 className="text-xl font-semibold text-gray-200 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-dribla-orange" /> Atenção! Cobranças Pendentes
                </h2>
                <p className="text-5xl font-extrabold text-dribla-orange mb-4">
                  {formatCurrency(data.atrasadosValorTotal)}
                </p>
                <p className="text-gray-400 mb-6">{data.atrasadosCount} Alunos Atrasados</p>
                <Link href="/elenco?filtro=vencida">
                  <button className="w-full py-3 bg-dribla-orange text-gray-900 font-bold rounded-lg hover:bg-orange-500 transition duration-200">
                    RESOLVER AGORA
                  </button>
                </Link>
              </div>

              {/* Cartão 2: PRÓXIMOS VENCIMENTOS */}
              <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border-l-4 border-dribla-green">
                <h2 className="text-xl font-semibold text-gray-200 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-dribla-green" /> Próximos Pagamentos
                </h2>
                <p className="text-5xl font-extrabold text-dribla-green mb-4">{data.proximosCount}</p>
                <p className="text-gray-400 mb-6">Alunos com vencimento nos próximos 5 dias</p>
                 <Link href="/elenco?filtro=proximo">
                  <button className="w-full py-3 bg-dribla-green text-gray-900 font-bold rounded-lg hover:bg-green-600 transition duration-200">
                    VER ALUNOS
                  </button>
                 </Link>
              </div>
            </div>

            {/* Seção de Ocupação do Time / Registro Rápido */}
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
                <Link href="/checkout?plano=VIP">
                    <button className='px-4 py-2 text-sm bg-gray-700 hover:bg-dribla-green hover:text-gray-900 rounded-lg transition duration-200'>
                        Fazer Upgrade
                    </button>
                </Link>
                 <Link href="/elenco">
                    <button className='px-4 py-2 text-sm bg-dribla-green text-gray-900 font-semibold rounded-lg hover:bg-green-600 transition duration-200'>
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