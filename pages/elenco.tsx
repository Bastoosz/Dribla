import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Layout from 'components/Layout';
import ModalNovoAluno from 'components/ModalNovoAluno';
import { ModalEditarAluno } from 'components/ModalEditarAluno';
import ModalConfirmarExclusao from 'components/ModalConfirmarExclusao';
import ModalEnviarCobranca from '../components/ModalEnviarCobranca';
import { supabase } from 'lib/supabaseClient';
import { useRouter } from 'next/router';
import { Loader2, Plus, AlertTriangle, SearchX, Mail } from 'lucide-react';
import type { Aluno } from 'types/aluno';
import { RealtimeStatus, getRealtimeStatus } from 'utils/statusUtils';
import { Button } from 'components/ui/Button';
import { Alert } from 'components/ui/Alert';
import Link from 'next/link';
import { ElencoFilter } from '../components/ElencoFilter';
import { ElencoTable } from '../components/ElencoTable';
type StatusFiltro = 'todos' | RealtimeStatus;
const ElencoPage: React.FC = () => {
  const router = useRouter();
  const [showNovoModal, setShowNovoModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCobrancaModal, setShowCobrancaModal] = useState(false);
  const [allAlunos, setAllAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState<StatusFiltro>('todos');
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const [deletingAluno, setDeletingAluno] = useState<Aluno | null>(null);
  const [limiteAlunos, setLimiteAlunos] = useState(30);
  const [planoAtual, setPlanoAtual] = useState<'free' | 'vip' | 'premium' | string>('free');
  const fetchAlunos = async () => {
    setLoading(true);
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      const { data, error: fetchError } = await supabase
        .from('alunos')
        .select('*')
        .eq('id_treinador', user.id)
        .order('nome_aluno', { ascending: true });
      if (fetchError) throw fetchError;
      const { data: treinador } = await supabase
        .from('treinadores')
        .select('plano_atual, limite_alunos')
        .eq('id', user.id)
        .single();
      if (treinador) {
        setPlanoAtual(treinador.plano_atual || 'free');
        setLimiteAlunos(typeof treinador.limite_alunos === 'number' ? treinador.limite_alunos : limiteAlunos);
      }
      setAllAlunos(data || []);
    } catch (err: any) {
      setError("Não foi possível carregar o elenco. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAlunos();
    if (router.query.filtro === 'vencida' && router.query.action === 'cobrar') {
      setCurrentFilter('vencida');
      setShowCobrancaModal(true);
      const { action, ...restQuery } = router.query;
      router.replace({
        pathname: router.pathname,
        query: restQuery,
      }, undefined, { shallow: true });
    } else if (router.query.filtro) {
      setCurrentFilter(router.query.filtro as StatusFiltro);
    }
  }, [router.query]);
  const processedAlunos = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return allAlunos.map(aluno => ({
      ...aluno,
      realtimeStatus: getRealtimeStatus(aluno, hoje),
    }));
  }, [allAlunos]);
  const filterCounts = useMemo(() => {
    return {
      todos: processedAlunos.length,
      vencida: processedAlunos.filter(a => a.realtimeStatus === 'vencida').length,
      proximo: processedAlunos.filter(a => a.realtimeStatus === 'proximo').length,
      paga: processedAlunos.filter(a => a.realtimeStatus === 'paga').length,
      pendente: processedAlunos.filter(a => a.realtimeStatus === 'pendente').length,
    };
  }, [processedAlunos]);
  const filteredAlunos = useMemo(() => {
    if (currentFilter === 'todos') {
      return processedAlunos;
    }
    return processedAlunos.filter(aluno => aluno.realtimeStatus === currentFilter);
  }, [processedAlunos, currentFilter]);
  const handleAlunoAdicionado = () => { setShowNovoModal(false); fetchAlunos(); };
  const openEditModal = (aluno: Aluno) => { setEditingAluno(aluno); setShowEditModal(true); };
  const handleAlunoEditado = () => { setShowEditModal(false); setEditingAluno(null); fetchAlunos(); };
  const openDeleteConfirm = (aluno: Aluno) => { setDeletingAluno(aluno); setShowDeleteConfirm(true); };
  const handleAlunoExcluido = () => { setShowDeleteConfirm(false); setDeletingAluno(null); fetchAlunos(); };
  const estaBloqueado = limiteAlunos !== 99999 && allAlunos.length >= limiteAlunos;
  return (
    <>
      <Head>
        <title>Dribla | Elenco</title>
      </Head>
      <Layout title="Gestão de Alunos (Elenco)">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Meu Elenco</h1>
            <p className="text-xs md:text-sm text-gray-400">Gerencie todos os atletas da sua escolinha</p>
          </div>
          <Button
            onClick={() => { if (!estaBloqueado) setShowNovoModal(true); }}
            variant={estaBloqueado ? 'secondary' : 'primary'}
            size="md"
            disabled={estaBloqueado}
            title={estaBloqueado ? 'Limite de alunos atingido. Faça upgrade em Planos.' : undefined}
            className="shadow-lg shadow-dribla-green/20 w-full md:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" /> Novo Atleta
          </Button>
        </div>
        {estaBloqueado && (
          <Alert variant="warning" title="Limite de Alunos Atingido" className="mb-6">
            Seu plano atual (<span className="font-bold">{planoAtual}</span>) permite até <span className="font-bold">{limiteAlunos}</span> alunos. Você tem <span className="font-bold">{allAlunos.length}</span> cadastrados.
            <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link href="/planos" className="inline-block px-6 py-2.5 bg-dribla-green text-gray-900 rounded-lg font-semibold hover:bg-dribla-green-600 transition-all duration-200 shadow-lg shadow-dribla-green/20 text-center">Fazer Upgrade</Link>
              <span className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">ou remova atletas existentes para criar novos.</span>
            </div>
          </Alert>
        )}
        <ElencoFilter
          currentFilter={currentFilter}
          filterCounts={filterCounts}
          onFilterChange={setCurrentFilter}
        />
        {}
        {currentFilter === 'vencida' && filterCounts.vencida > 0 && (
          <div className="mb-6">
            <Button
              onClick={() => setShowCobrancaModal(true)}
              className="bg-gradient-to-r from-dribla-green to-green-500 hover:from-dribla-green-600 hover:to-green-600 text-gray-900 font-bold shadow-lg shadow-dribla-green/30 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Enviar Cobrança ({filterCounts.vencida} aluno{filterCounts.vencida !== 1 ? 's' : ''})</span>
            </Button>
          </div>
        )}
        {loading && (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-10 h-10 text-dribla-green animate-spin" />
          </div>
        )}
        {error && (
          <div className="p-4 sm:p-6 bg-gradient-to-br from-red-900/50 to-red-800/30 backdrop-blur-sm text-red-300 text-center rounded-2xl border border-red-800 shadow-2xl">
            <p className="flex items-center justify-center gap-2 text-sm sm:text-base md:text-lg">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
              {error}
            </p>
          </div>
        )}
        {!loading && !error && filteredAlunos.length === 0 && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-sm p-6 sm:p-8 md:p-12 rounded-2xl text-center border border-gray-700 shadow-2xl">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gray-700/50 rounded-full mb-4">
              <SearchX className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <p className="text-lg sm:text-xl font-bold mb-2 text-white">
              Nenhum atleta encontrado neste filtro.
            </p>
            <p className="text-sm sm:text-base text-gray-400">
              Tente um filtro diferente ou{' '}
                {estaBloqueado ? (
                <Link href="/planos" className="text-dribla-green hover:text-dribla-green-600 font-semibold transition-colors">faça upgrade do seu plano</Link>
              ) : (
                <button
                  onClick={() => setShowNovoModal(true)}
                  className="text-dribla-green hover:text-dribla-green-600 font-semibold transition-colors"
                >
                  adicione um novo atleta
                </button>
              )}.
            </p>
          </div>
        )}
        {!loading && !error && filteredAlunos.length > 0 && (
          <ElencoTable alunos={filteredAlunos} onEdit={openEditModal} onDelete={openDeleteConfirm} />
        )}
        {showNovoModal && (<ModalNovoAluno onClose={() => setShowNovoModal(false)} onAlunoAdicionado={handleAlunoAdicionado} contagemAtualAlunos={allAlunos.length} limiteAlunos={limiteAlunos} />)}
        {showEditModal && editingAluno && (<ModalEditarAluno aluno={editingAluno} onClose={() => { setShowEditModal(false); setEditingAluno(null); }} onAlunoEditado={handleAlunoEditado} />)}
        {showDeleteConfirm && deletingAluno && (<ModalConfirmarExclusao aluno={deletingAluno} onClose={() => { setShowDeleteConfirm(false); setDeletingAluno(null); }} onAlunoExcluido={handleAlunoExcluido} />)}
        {showCobrancaModal && (
          <ModalEnviarCobranca
            isOpen={showCobrancaModal}
            onClose={() => setShowCobrancaModal(false)}
            alunosAtrasados={filteredAlunos.filter(a => a.realtimeStatus === 'vencida')}
          />
        )}
      </Layout>
    </>
  );
};
export default ElencoPage;
