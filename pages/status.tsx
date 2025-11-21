import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabaseClient';
import { ArrowRight, Users, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import Link from 'next/link';
interface StatusData {
  totalAlunos: number;
  limiteAlunos: number;
  planoAtual: string;
  porcentagemUso: number;
  eventosRecentes: Array<{
    id: string;
    event_type: string;
    created_at: string;
    metadata: Record<string, any>;
  }>;
}
const formatarData = (data: string) => {
  return new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
const StatusPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }
        const { data: treinador, error: treinadorError } = await supabase
          .from('treinadores')
          .select('plano_atual, limite_alunos')
          .single();
        if (treinadorError) throw treinadorError;
        const { count: totalAlunos, error: alunosError } = await supabase
          .from('alunos')
          .select('*', { count: 'exact', head: true });
        if (alunosError) throw alunosError;
        const { data: eventos, error: eventosError } = await supabase
          .from('user_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        if (eventosError) throw eventosError;
        const porcentagem = treinador.limite_alunos === 99999 
          ? 0 
          : ((totalAlunos || 0) / treinador.limite_alunos) * 100;
        setStatusData({
          totalAlunos: totalAlunos || 0,
          limiteAlunos: treinador.limite_alunos,
          planoAtual: treinador.plano_atual,
          porcentagemUso: porcentagem,
          eventosRecentes: eventos || []
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [router]);
  if (loading) {
    return (
      <Layout title="Status do Sistema">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dribla-green"></div>
        </div>
      </Layout>
    );
  }
  if (error) {
    return (
      <Layout title="Status do Sistema">
        <Alert variant="error" title="Erro ao carregar status">
          {error}
        </Alert>
      </Layout>
    );
  }
  if (!statusData) return null;
  const getNivelUso = (porcentagem: number) => {
    if (porcentagem >= 90) return 'danger';
    if (porcentagem >= 75) return 'warning';
    return 'success';
  };
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login': return <Activity className="w-4 h-4" />;
      case 'create_aluno': return <Users className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };
  return (
    <>
      <Head>
        <title>Dribla | Status do Sistema</title>
      </Head>
      <Layout title="Status do Sistema">
        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-200">Seu Plano</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-white capitalize">{statusData.planoAtual}</p>
                <p className="text-sm text-gray-400">
                  {statusData.limiteAlunos === 99999 ? 'Alunos ilimitados' : `Limite: ${statusData.limiteAlunos} alunos`}
                </p>
              </div>
              <Link href="/planos">
                <Button variant="ghost" className="flex items-center gap-2">
                  Gerenciar <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-200">Alunos Cadastrados</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-white">{statusData.totalAlunos}</p>
                <p className="text-sm text-gray-400">
                  {statusData.limiteAlunos === 99999 
                    ? 'Sem limite de alunos' 
                    : `de ${statusData.limiteAlunos} disponíveis`}
                </p>
              </div>
              <Link href="/elenco">
                <Button variant="ghost" className="flex items-center gap-2">
                  Ver Lista <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-200">Uso do Plano</h3>
            <div>
              {statusData.limiteAlunos === 99999 ? (
                <p className="text-3xl font-bold text-dribla-green">Ilimitado</p>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-3xl font-bold text-white">{statusData.porcentagemUso.toFixed(1)}%</p>
                    <Badge variant={getNivelUso(statusData.porcentagemUso)}>
                      {statusData.porcentagemUso >= 90 ? 'Crítico' : 
                       statusData.porcentagemUso >= 75 ? 'Atenção' : 'Normal'}
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        statusData.porcentagemUso >= 90 ? 'bg-red-500' :
                        statusData.porcentagemUso >= 75 ? 'bg-yellow-500' :
                        'bg-dribla-green'
                      }`}
                      style={{ width: `${Math.min(statusData.porcentagemUso, 100)}%` }}
                    ></div>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
        {}
        {statusData.porcentagemUso >= 90 && statusData.limiteAlunos !== 99999 && (
          <Alert 
            variant="error" 
            title="Limite de alunos quase atingido!"
            className="mb-6"
          >
            <p>Você está usando {statusData.porcentagemUso.toFixed(1)}% do seu limite de alunos. 
            Para continuar crescendo, considere fazer um upgrade do seu plano.</p>
            <div className="mt-3">
              <Link href="/planos">
                <Button variant="primary" size="sm">Ver Planos Disponíveis</Button>
              </Link>
            </div>
          </Alert>
        )}
        {statusData.porcentagemUso >= 75 && statusData.porcentagemUso < 90 && statusData.limiteAlunos !== 99999 && (
          <Alert 
            variant="warning" 
            title="Atenção ao limite de alunos"
            className="mb-6"
          >
            <p>Você está se aproximando do limite de alunos do seu plano. 
            Considere fazer um upgrade para evitar interrupções.</p>
            <div className="mt-3">
              <Link href="/planos">
                <Button variant="secondary" size="sm">Conhecer Outros Planos</Button>
              </Link>
            </div>
          </Alert>
        )}
        {}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">Eventos Recentes</h3>
          <div className="space-y-4">
            {statusData.eventosRecentes.length === 0 ? (
              <p className="text-gray-400 text-sm">Nenhum evento registrado recentemente.</p>
            ) : (
              statusData.eventosRecentes.map(evento => (
                <div 
                  key={evento.id} 
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50"
                >
                  <div className="text-gray-400">
                    {getEventIcon(evento.event_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 capitalize">
                      {evento.event_type.replace('_', ' ')}
                    </p>
                    {evento.metadata && (
                      <p className="text-xs text-gray-400 truncate">
                        {JSON.stringify(evento.metadata)}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {formatarData(evento.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </Layout>
    </>
  );
};
export default StatusPage;