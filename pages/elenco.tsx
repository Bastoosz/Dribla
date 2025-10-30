// pages/elenco.tsx

import React, { useState, useEffect, useMemo, ElementType } from 'react';
import Head from 'next/head';
import Layout from 'components/Layout';
import ModalNovoAluno from 'components/ModalNovoAluno';
import ModalEditarAluno from 'components/ModalEditarAluno';
import ModalConfirmarExclusao from 'components/ModalConfirmarExclusao';
import { supabase } from 'lib/supabaseClient';
import { useRouter } from 'next/router';
import { Loader2, Plus, Edit, Trash2, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import type { Aluno } from 'types/aluno.ts';

type StatusFiltro = 'todos' | 'vencida' | 'proximo' | 'paga';
type RealtimeStatus = 'vencida' | 'proximo' | 'paga';

// --- CORREÇÃO DE COR AQUI ---
// Objeto de configuração para os chips de status
const statusMap: Record<RealtimeStatus, { texto: string; corFundo: string; corTexto: string; icone: ElementType }> = {
  vencida: {
    texto: 'Vencido',
    corFundo: 'bg-red-100 dark:bg-dribla-orange/20',
    corTexto: 'text-red-800 dark:text-dribla-orange',
    icone: AlertTriangle,
  },
  proximo: {
    texto: 'Próximo',
    corFundo: 'bg-yellow-100 dark:bg-yellow-500/20', // Azul -> Amarelo
    corTexto: 'text-yellow-800 dark:text-yellow-400', // Azul -> Amarelo
    icone: Clock,
  },
  paga: {
    texto: 'Em Dia', 
    corFundo: 'bg-green-100 dark:bg-dribla-green/20',
    corTexto: 'text-green-800 dark:text-dribla-green',
    icone: CheckCircle,
  },
};

// --- FUNÇÃO HELPER: Calcula o status em tempo real ---
// (Esta função permanece a mesma, pois a lógica não muda)
const getRealtimeStatus = (aluno: Aluno, hoje: Date): RealtimeStatus => {
  if (aluno.status_mensalidade === 'pago') {
    return 'paga';
  }
  const vencimento = new Date(aluno.data_vencimento_mensalidade + 'T00:00:00');
  vencimento.setHours(0, 0, 0, 0);
  if (vencimento < hoje) {
    return 'vencida';
  }
  const cincoDias = new Date(hoje);
  cincoDias.setDate(hoje.getDate() + 5);
  if (vencimento >= hoje && vencimento <= cincoDias) {
    return 'proximo';
  }
  return 'paga'; 
};


const ElencoPage: React.FC = () => {
  const router = useRouter();
  
  const [showNovoModal, setShowNovoModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [allAlunos, setAllAlunos] = useState<Aluno[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentFilter, setCurrentFilter] = useState<StatusFiltro>('todos');
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const [deletingAluno, setDeletingAluno] = useState<Aluno | null>(null);

  const [limiteAlunos, setLimiteAlunos] = useState(30); // Placeholder

  // --- Funções (fetchAlunos, processamento, callbacks, formatação) ---
  // (Todo o bloco de lógica interna permanece o mesmo)
  // ...
  // --- 1. BUSCA INICIAL DE DADOS ---
  const fetchAlunos = async () => {
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    
    // TODO: Buscar o limite do treinador aqui também
    // const { data: treinador } = await supabase.from('treinadores').select('limite_alunos').eq('id', user.id).single();
    // if (treinador) setLimiteAlunos(treinador.limite_alunos);

    const { data, error: fetchError } = await supabase
      .from('alunos')
      .select('*')
      .eq('id_treinador', user.id)
      .order('nome_aluno', { ascending: true });

    if (fetchError) {
      console.error("Erro ao buscar alunos:", fetchError);
      setError("Não foi possível carregar o elenco. Tente novamente.");
    } else {
      setAllAlunos(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAlunos();
  }, [router]); // Adicionado router

  // --- 2. CÁLCULO DOS STATUS EM TEMPO REAL ---
  const processedAlunos = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); 
    return allAlunos.map(aluno => ({
      ...aluno,
      realtimeStatus: getRealtimeStatus(aluno, hoje),
    }));
  }, [allAlunos]);

  // --- 3. CÁLCULO DOS CONTADORES (FILTROS) ---
  const filterCounts = useMemo(() => {
    return {
      todos: processedAlunos.length,
      vencida: processedAlunos.filter(a => a.realtimeStatus === 'vencida').length,
      proximo: processedAlunos.filter(a => a.realtimeStatus === 'proximo').length,
      paga: processedAlunos.filter(a => a.realtimeStatus === 'paga').length,
    };
  }, [processedAlunos]);

  // --- 4. FILTRAGEM DA LISTA EXIBIDA ---
  const filteredAlunos = useMemo(() => {
    if (currentFilter === 'todos') {
      return processedAlunos;
    }
    return processedAlunos.filter(aluno => aluno.realtimeStatus === currentFilter);
  }, [processedAlunos, currentFilter]);


  // --- 5. FUNÇÕES DE CALLBACK DOS MODAIS ---
  const handleAlunoAdicionado = () => { setShowNovoModal(false); fetchAlunos(); };
  const openEditModal = (aluno: Aluno) => { setEditingAluno(aluno); setShowEditModal(true); };
  const handleAlunoEditado = () => { setShowEditModal(false); setEditingAluno(null); fetchAlunos(); };
  const openDeleteConfirm = (aluno: Aluno) => { setDeletingAluno(aluno); setShowDeleteConfirm(true); };
  const handleAlunoExcluido = () => { setShowDeleteConfirm(false); setDeletingAluno(null); fetchAlunos(); };

  // --- 6. FUNÇÕES DE FORMATAÇÃO ---
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString + 'T00:00:00');
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' };
      return date.toLocaleDateString('pt-BR', options);
    } catch (e) { return 'Data Inválida'; }
  };
  const formatCurrency = (value: number | null) => {
    if (value === null) return 'N/A';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  // ...

  return (
    <>
      <Head>
        <title>Dribla | Elenco</title>
      </Head>
      <Layout title="Gestão de Alunos (Elenco)">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-white">Meu Elenco</h1>
          <button 
            onClick={() => setShowNovoModal(true)} 
            className="btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" /> Novo Atleta
          </button>
        </div>

        {/* --- CORREÇÃO DE COR AQUI --- */}
        {/* Botões de Filtro (Botão "Próximos" alterado para Amarelo) */}
        <div className="flex space-x-2 mb-6">
          <button 
            onClick={() => setCurrentFilter('todos')} 
            className={`px-4 py-2 rounded-lg text-sm font-medium ${currentFilter === 'todos' ? 'bg-dribla-green text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Todos ({filterCounts.todos})
          </button>
          <button 
            onClick={() => setCurrentFilter('vencida')} 
            className={`px-4 py-2 rounded-lg text-sm font-medium ${currentFilter === 'vencida' ? 'bg-dribla-orange text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Atrasados ({filterCounts.vencida})
          </button>
          <button 
            onClick={() => setCurrentFilter('proximo')} 
            className={`px-4 py-2 rounded-lg text-sm font-medium ${currentFilter === 'proximo' ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`} // Azul -> Amarelo
          >
            Próximos ({filterCounts.proximo})
          </button>
          <button 
            onClick={() => setCurrentFilter('paga')} 
            className={`px-4 py-2 rounded-lg text-sm font-medium ${currentFilter === 'paga' ? 'bg-dribla-green/70 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Em Dia ({filterCounts.paga})
          </button>
        </div>

        {/* Feedback Visual (Loading, Erro, Vazio) */}
        {loading && ( <div className="flex justify-center items-center py-10"><Loader2 className="w-10 h-10 text-dribla-green animate-spin" /></div> )}
        {error && ( <p className="p-6 bg-red-900/50 text-red-300 text-center rounded-lg border border-red-800">{error}</p> )}
        {!loading && !error && filteredAlunos.length === 0 && (
          <p className="p-6 bg-gray-800/50 text-gray-300 text-center rounded-lg border border-gray-700">
            Nenhum aluno encontrado para os filtros selecionados.
          </p>
        )}

        {/* Tabela de Alunos */}
        {!loading && !error && filteredAlunos.length > 0 && (
          <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-xl border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Aluno</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Responsável</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Vencimento</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Valor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status (Tempo Real)</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredAlunos.map((aluno) => {
                  // --- CORREÇÃO DE COR AQUI ---
                  // (Usa o statusMap atualizado)
                  const statusInfo = statusMap[aluno.realtimeStatus as RealtimeStatus];

                  return (
                    <tr key={aluno.id} className="hover:bg-gray-700/50 transition duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{aluno.nome_aluno}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{aluno.nome_pai || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{aluno.email_pai}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{formatDate(aluno.data_vencimento_mensalidade)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{formatCurrency(aluno.valor_mensalidade)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.corFundo} ${statusInfo.corTexto}`}>
                          <statusInfo.icone className="w-4 h-4 mr-1.5" />
                          {statusInfo.texto}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <button onClick={() => openEditModal(aluno)} className="text-blue-400 hover:text-blue-300 transition duration-150">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => openDeleteConfirm(aluno)} className="text-red-500 hover:text-red-400 transition duration-150">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Modais (Renderização Condicional - sem alterações) */}
        {showNovoModal && ( <ModalNovoAluno onClose={() => setShowNovoModal(false)} onAlunoAdicionado={handleAlunoAdicionado} contagemAtualAlunos={allAlunos.length} limiteAlunos={limiteAlunos} /> )}
        {showEditModal && editingAluno && ( <ModalEditarAluno aluno={editingAluno} onClose={() => { setShowEditModal(false); setEditingAluno(null); }} onAlunoEditado={handleAlunoEditado} /> )}
        {showDeleteConfirm && deletingAluno && ( <ModalConfirmarExclusao aluno={deletingAluno} onClose={() => { setShowDeleteConfirm(false); setDeletingAluno(null); }} onAlunoExcluido={handleAlunoExcluido} /> )}
      </Layout>
    </>
  );
};

export default ElencoPage;