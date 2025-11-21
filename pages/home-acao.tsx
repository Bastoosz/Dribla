import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Loader2, Users, AlertTriangle, Clock, CheckCircle, Mail, FileText } from 'lucide-react';
import type { Aluno } from '../types/aluno';
import { statusMap, formatCurrency } from '../utils/statusUtils';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { ModalGerarRelatorio } from '../components/ModalGerarRelatorio';
interface DashboardData {
  atrasadosCount: number;
  atrasadosValorTotal: number;
  proximosCount: number;
  pagosCount: number;
  pendentesCount: number;
  totalAlunos: number;
  planoAtual: 'free' | 'vip' | 'premium';
  limiteAlunos: number;
  receitaTotal: number;
  receitaPendente: number;
}
function HomeAcao() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  useEffect(() => {
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
          pendentesPromise,
          totalAlunosPromise
        ] = await Promise.all([
          supabase
            .from('treinadores')
            .select('plano_atual, limite_alunos')
            .eq('id', user.id)
            .single(),
          supabase
            .from('alunos')
            .select('valor_mensalidade', { count: 'exact' })
            .eq('id_treinador', user.id)
            .eq('status_mensalidade', 'pendente')
            .lt('data_vencimento_mensalidade', hojeISO),
          supabase
            .from('alunos')
            .select('*', { count: 'exact', head: true })
            .eq('id_treinador', user.id)
            .eq('status_mensalidade', 'pendente')
            .gte('data_vencimento_mensalidade', hojeISO)
            .lte('data_vencimento_mensalidade', cincoDiasFrenteISO),
          supabase
            .from('alunos')
            .select('*', { count: 'exact', head: true }) 
            .eq('id_treinador', user.id)
            .eq('status_mensalidade', 'pago'),
          supabase
            .from('alunos')
            .select('*', { count: 'exact', head: true }) 
            .eq('id_treinador', user.id)
            .eq('status_mensalidade', 'pendente')
            .gt('data_vencimento_mensalidade', cincoDiasFrenteISO),
          supabase
            .from('alunos')
            .select('*', { count: 'exact', head: true }) 
            .eq('id_treinador', user.id),
        ]);
        if (treinadorPromise.error) throw new Error("Erro ao buscar dados do plano.");
        if (atrasadosPromise.error) throw new Error("Erro ao buscar alunos atrasados.");
        if (proximosPromise.error) throw new Error("Erro ao buscar próximos vencimentos.");
        if (pagosPromise.error) throw new Error("Erro ao buscar alunos em dia.");
        if (totalAlunosPromise.error) throw new Error("Erro ao buscar total de alunos.");
        const treinadorInfo = treinadorPromise.data;
        const atrasadosCount = atrasadosPromise.count ?? 0;
        let atrasadosValorTotal = 0;
        if (atrasadosPromise.data) {
           atrasadosValorTotal = atrasadosPromise.data.reduce((sum: number, aluno: any) => sum + (aluno.valor_mensalidade || 0), 0);
        }
        const proximosCount = proximosPromise.count ?? 0;
        const pagosCount = pagosPromise.count ?? 0;
        const pendentesCount = pendentesPromise.count ?? 0;
        const totalAlunos = totalAlunosPromise.count ?? 0;
        const { data: todosAlunos } = await supabase
          .from('alunos')
          .select('valor_mensalidade, status_mensalidade')
          .eq('id_treinador', user.id);
        const receitaTotal = todosAlunos?.reduce((sum: number, aluno: any) => sum + (aluno.valor_mensalidade || 0), 0) ?? 0;
        const receitaPendente = todosAlunos?.reduce((sum: number, aluno: any) => 
          aluno.status_mensalidade === 'pendente' ? sum + (aluno.valor_mensalidade || 0) : sum, 0) ?? 0;
        setData({
          atrasadosCount,
          atrasadosValorTotal,
          proximosCount,
          pagosCount,
          pendentesCount,
          totalAlunos,
          planoAtual: treinadorInfo.plano_atual,
          limiteAlunos: treinadorInfo.limite_alunos,
          receitaTotal,
          receitaPendente,
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
  return (
    <>
      <Head>
        <title>Dribla | Zona de Ação</title>
      </Head>
      <Layout title="Zona de Ação Financeira">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 text-dribla-green animate-spin" />
          </div>
        ) : error ? (
          <Alert variant="error" title="Erro" className="mb-6">
            {error}
          </Alert>
        ) : data ? (
          <>
            <div className="space-y-8">
              {}
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Visão Geral</h2>
                  <p className="text-sm text-gray-400">Acompanhe o desempenho financeiro da sua escolinha</p>
                </div>
                <Button
                  onClick={() => setIsReportModalOpen(true)}
                  className="flex items-center gap-2 bg-dribla-green hover:bg-dribla-green-600 text-gray-900 font-semibold shadow-lg shadow-dribla-green/20"
                >
                  <FileText className="w-4 h-4" />
                  Gerar Relatório
                </Button>
              </div>
              {}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                {}
                <div className="group bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl border border-gray-700 hover:border-dribla-green/50 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-dribla-green/10 rounded-xl">
                      <AlertTriangle className="w-6 h-6 text-dribla-green" />
                    </div>
                    <span className="text-xs font-medium text-gray-400 bg-gray-700/50 px-3 py-1 rounded-full">{data.atrasadosCount}</span>
                  </div>
                  <h3 className="text-xs md:text-sm font-medium text-gray-400 mb-2">Atrasados</h3>
                  <p className="text-2xl md:text-3xl font-bold text-white mb-4">
                    {formatCurrency(data.atrasadosValorTotal)}
                  </p>
                  <Link
                    href="/elenco?filtro=vencida&action=cobrar"
                    className="block w-full py-2.5 bg-dribla-green text-gray-900 font-semibold rounded-lg hover:bg-dribla-green-600 transition-all duration-200 text-sm text-center shadow-lg shadow-dribla-green/20"
                  >
                    Resolver Agora
                  </Link>
                </div>
                {}
                <div className="group bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl border border-gray-700 hover:border-dribla-green-400/50 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-dribla-green-400/10 rounded-xl">
                      <Clock className="w-6 h-6 text-dribla-green-400" />
                    </div>
                    <span className="text-xs font-medium text-gray-400 bg-gray-700/50 px-3 py-1 rounded-full">5 dias</span>
                  </div>
                  <h3 className="text-xs md:text-sm font-medium text-gray-400 mb-2">Próximos a Vencer</h3>
                  <p className="text-2xl md:text-3xl font-bold text-white mb-4">{data.proximosCount}</p>
                  <Link
                    href="/elenco?filtro=proximo"
                    className="block w-full py-2.5 bg-gray-700 text-white font-semibold rounded-lg hover:bg-dribla-green-400 hover:text-gray-900 transition-all duration-200 text-sm text-center"
                  >
                    Ver Alunos
                  </Link>
                </div>
                {}
                <div className="group bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl border border-gray-700 hover:border-dribla-green/50 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-dribla-green/10 rounded-xl">
                      <CheckCircle className="w-6 h-6 text-dribla-green" />
                    </div>
                    <span className="text-xs font-medium text-dribla-green bg-dribla-green/10 px-3 py-1 rounded-full">OK</span>
                  </div>
                  <h3 className="text-xs md:text-sm font-medium text-gray-400 mb-2">Em Dia</h3>
                  <p className="text-2xl md:text-3xl font-bold text-white mb-4">{data.pagosCount}</p>
                  <Link
                    href="/elenco?filtro=paga"
                    className="block w-full py-2.5 bg-gray-700 text-white font-semibold rounded-lg hover:bg-dribla-green hover:text-gray-900 transition-all duration-200 text-sm text-center"
                  >
                    Ver Alunos
                  </Link>
                </div>
                {}
                <div className="group bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gray-700/50 rounded-xl">
                      {React.createElement(statusMap.pendente.icone, { className: "w-6 h-6 text-gray-400" })}
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-gray-700/50 px-3 py-1 rounded-full">&gt;5d</span>
                  </div>
                  <h3 className="text-xs md:text-sm font-medium text-gray-400 mb-2">Pendentes</h3>
                  <p className="text-2xl md:text-3xl font-bold text-white mb-4">{data.pendentesCount}</p>
                  <Link
                    href="/elenco?filtro=pendente"
                    className="block w-full py-2.5 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all duration-200 text-sm text-center"
                  >
                    Ver Alunos
                  </Link>
                </div>
              </div>
              {}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start mb-3">
                      <div className="p-2 bg-dribla-green/10 rounded-lg mr-3">
                        <Users className="w-5 h-5 text-dribla-green" />
                      </div>
                      <h3 className="text-xl font-bold text-white">Status do Plano</h3>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-4 text-sm">
                      <div className="bg-gray-900/50 px-4 py-2 rounded-lg border border-gray-700">
                        <span className="text-gray-400">Plano: </span>
                        <span className="font-bold uppercase text-dribla-green">{data.planoAtual}</span>
                      </div>
                      <div className="bg-gray-900/50 px-4 py-2 rounded-lg border border-gray-700">
                        <span className="text-gray-400">Alunos: </span>
                        <span className="font-bold text-white">{data.totalAlunos}</span>
                        <span className="text-gray-500"> / {data.limiteAlunos === 99999 ? '∞' : data.limiteAlunos}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      href="/planos"
                      className="px-6 py-3 text-sm bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all duration-200 border border-gray-600 hover:border-gray-500"
                    >
                      Fazer Upgrade
                    </Link>
                    <Link
                      href="/elenco"
                      className="px-6 py-3 text-sm bg-dribla-green text-gray-900 font-semibold rounded-lg hover:bg-dribla-green-600 transition-all duration-200 shadow-lg shadow-dribla-green/20"
                    >
                      Gerenciar Elenco
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            {}
            <ModalGerarRelatorio
              isOpen={isReportModalOpen}
              onClose={() => setIsReportModalOpen(false)}
              data={{
                totalAlunos: data.totalAlunos,
                atrasadosCount: data.atrasadosCount,
                proximosCount: data.proximosCount,
                pagosCount: data.pagosCount,
                pendentesCount: data.pendentesCount,
                receitaTotal: data.receitaTotal,
                receitaPendente: data.receitaPendente
              }}
            />
          </>
        ) : null}
      </Layout>
    </>
  );
}
export default HomeAcao;