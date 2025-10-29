// pages/elenco.tsx

import React, { useState, useEffect } from 'react'; // Adicionado useEffect e useState
import Head from 'next/head';
import Layout from '../components/Layout';
import { User, DollarSign, Calendar, Plus, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient'; // Importado Supabase Client
import { useRouter } from 'next/router';

// Tipagem simplificada para os dados do Supabase
interface Aluno {
  id: number;
  nome_aluno: string;
  nome_pai: string;
  email_pai: string;
  status_mensalidade: 'paga' | 'proximo' | 'vencida';
  data_vencimento_mensalidade: string; // Data
  valor_mensalidade: number;
}

// --- Componente: Chip de Status Visual ---
interface StatusChipProps {
  status: 'paga' | 'proximo' | 'vencida';
}

const StatusChip: React.FC<StatusChipProps> = ({ status }) => {
  let classes = "";
  let texto = "";
  let Icon = Clock;

  switch (status) {
    case 'paga':
      classes = "bg-dribla-green text-gray-900";
      texto = "PAGO";
      Icon = CheckCircle;
      break;
    case 'proximo':
      classes = "bg-yellow-600/50 text-yellow-300 border border-yellow-500";
      texto = "VENCE EM BREVE";
      Icon = Clock;
      break;
    case 'vencida':
      classes = "bg-dribla-orange/50 text-dribla-orange border border-dribla-orange";
      texto = "ATRASADO";
      Icon = AlertTriangle;
      break;
  }

  return (
    <div className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full ${classes}`}>
      <Icon className="w-4 h-4 mr-1" />
      {texto}
    </div>
  );
};

// --- Componente: Card de Atleta (Substituindo a Tabela) ---
const AtletaCard: React.FC<{ aluno: Aluno }> = ({ aluno }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-dribla-green transition duration-300">
      
      {/* Linha 1: Nome e Status */}
      <div className="flex justify-between items-start mb-4 border-b border-gray-700 pb-3">
        <h3 className="text-xl font-bold text-white flex items-center">
          <User className="w-5 h-5 mr-3 text-dribla-green" />
          {aluno.nome_aluno}
        </h3>
        <StatusChip status={aluno.status_mensalidade} />
      </div>

      {/* Linha 2: Detalhes Financeiros e Vencimento */}
      <div className="space-y-2 text-sm text-gray-400">
        <p className="flex items-center">
          <DollarSign className="w-4 h-4 mr-2 text-dribla-green" /> 
          Responsável: {aluno.nome_pai}
        </p>
        <p className="flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-dribla-green" /> 
          Vencimento: <span className="text-white ml-1">{new Date(aluno.data_vencimento_mensalidade).toLocaleDateString('pt-BR')}</span>
        </p>
        <p className="flex items-center">
          <AlertTriangle className="w-4 h-4 mr-2 text-dribla-green" /> 
          Email Cobrança: <span className="text-white ml-1">{aluno.email_pai}</span>
        </p>
      </div>

      {/* Ações Rápidas */}
      <div className="mt-6 pt-4 border-t border-gray-700 flex justify-end">
        <button className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-dribla-green hover:text-gray-900 transition duration-200">
          Detalhes / Editar
        </button>
      </div>
    </div>
  );
};


const ElencoPage: React.FC = () => {
  const router = useRouter();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtro, setFiltro] = useState<'todos' | 'vencida' | 'proximo' | 'paga'>('todos');

  // --- FUNÇÃO DE BUSCA REAL DO SUPABASE ---
  useEffect(() => {
    const fetchAlunos = async () => {
      const { data: user } = await supabase.auth.getUser();

      if (!user.user) {
        // Redireciona se não houver usuário logado
        router.push('/login');
        return;
      }

      setLoading(true);
      setError(null);

      // Busca alunos filtrados pelo ID do treinador (RLS do Supabase deve estar ativo)
      const { data, error } = await supabase
        .from('alunos')
        .select('*')
        .eq('id_treinador', user.user.id)
        .order('data_vencimento_mensalidade', { ascending: true }); // Ordena por data

      if (error) {
        console.error("Erro ao carregar alunos:", error.message);
        setError("Não foi possível carregar os dados. Verifique a conexão.");
        setLoading(false);
      } else {
        setAlunos(data as Aluno[]);
        setLoading(false);
      }
    };

    fetchAlunos();
  }, [router]);

  // Lógica de filtragem
  const alunosFiltrados = alunos.filter(aluno => {
    if (filtro === 'todos') return true;
    return aluno.status_mensalidade === filtro;
  });

  // Lógica de ordenação (Vencidos primeiro, etc.)
  const alunosOrdenados = [...alunosFiltrados].sort((a, b) => {
    if (a.status_mensalidade === 'vencida' && b.status_mensalidade !== 'vencida') return -1;
    if (a.status_mensalidade !== 'vencida' && b.status_mensalidade === 'vencida') return 1;
    if (a.status_mensalidade === 'proximo' && b.status_mensalidade === 'paga') return -1;
    if (a.status_mensalidade === 'paga' && b.status_mensalidade === 'proximo') return 1;
    return 0;
  });


  return (
    <>
      <Head>
        <title>Dribla | Elenco (Alunos)</title>
      </Head>
      <Layout title="Elenco Completo">
        
        {/* Cabeçalho da Lista e CTA */}
        <div className="flex justify-between items-center mb-10 pb-4 border-b border-gray-800">
          <h1 className="text-3xl font-bold text-white">Gestão de Alunos</h1>
          <button className="px-5 py-2 bg-dribla-green text-gray-900 font-semibold rounded-lg flex items-center hover:bg-green-600 transition duration-200">
            <Plus className="w-5 h-5 mr-2" />
            Novo Atleta
          </button>
        </div>

        {/* --- Indicadores de Loading e Erro --- */}
        {loading && (
          <div className="text-center p-8 text-gray-400">Carregando Elenco...</div>
        )}

        {error && (
          <div className="p-4 mb-6 bg-dribla-orange/20 text-dribla-orange rounded-lg border border-dribla-orange">
            {error}
          </div>
        )}
        {/* ------------------------------------ */}

        {/* Filtros de Status (Controle de Status Financeiro) */}
        {!loading && (
        <div className="flex flex-wrap gap-3 mb-8">
            <button 
                onClick={() => setFiltro('todos')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 ${filtro === 'todos' ? 'bg-dribla-green text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
                Todos ({alunos.length})
            </button>
            <button 
                onClick={() => setFiltro('vencida')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 ${filtro === 'vencida' ? 'bg-dribla-orange text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
                Atrasados ({alunos.filter(a => a.status_mensalidade === 'vencida').length})
            </button>
            <button 
                onClick={() => setFiltro('proximo')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 ${filtro === 'proximo' ? 'bg-yellow-600 text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
                Próximos a Vencer ({alunos.filter(a => a.status_mensalidade === 'proximo').length})
            </button>
            <button 
                onClick={() => setFiltro('paga')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 ${filtro === 'paga' ? 'bg-dribla-green text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
                Pagos ({alunos.filter(a => a.status_mensalidade === 'paga').length})
            </button>
        </div>
        )}
        
        {/* GRID de Cards de Atleta */}
        {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {alunosOrdenados.length > 0 ? (
            alunosOrdenados.map(aluno => (
              <AtletaCard key={aluno.id} aluno={aluno} />
            ))
          ) : (
            <div className="md:col-span-4 p-8 text-center bg-gray-900/50 rounded-xl border border-gray-800">
                <h3 className="text-xl font-semibold text-gray-300">Nenhum atleta encontrado neste filtro.</h3>
                <p className="text-gray-500 mt-2">Tente um filtro diferente ou adicione um novo atleta.</p>
            </div>
          )}
        </div>
        )}

      </Layout>
    </>
  );
};

export default ElencoPage;
