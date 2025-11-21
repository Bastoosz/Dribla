import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout'; 
import Link from 'next/link';
import { Check, CreditCard, Loader2 } from 'lucide-react'; 
import { supabase } from '../lib/supabaseClient';
import { Alert } from 'components/ui/Alert';
import { Button } from 'components/ui/Button';
import { Modal } from '../components/ui/Modal';
interface PlanoCardProps {
  nome: string;
  preco: string;
  limiteAlunos: string;
  beneficios: string[];
  destaque?: boolean; 
  planoQuery: 'vip' | 'premium'; 
}
const PlanoCard: React.FC<PlanoCardProps> = ({ nome, preco, limiteAlunos, beneficios, destaque = false, planoQuery }) => {
  return (
    <div className={`relative p-8 rounded-2xl border transition-all duration-300 flex flex-col ${
      destaque 
        ? 'border-dribla-green bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl shadow-dribla-green/20' 
        : 'border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 hover:border-dribla-green/50 shadow-xl'
    }`}>
      {destaque && (
        <span className="absolute -top-3 -right-3 px-4 py-1.5 bg-gradient-to-r from-dribla-green to-dribla-green-600 text-gray-900 text-xs font-bold rounded-full shadow-lg shadow-dribla-green/50">
          Recomendado
        </span>
      )}
      <h3 className={`text-2xl font-bold mb-2 ${destaque ? 'text-dribla-green' : 'text-white'}`}>{nome}</h3>
      <div className="mb-6">
        <p className="text-5xl font-extrabold text-white mb-1">{preco}<span className="text-xl font-normal text-gray-400">/mês</span></p>
        <p className="text-sm text-gray-400 bg-gray-900/50 inline-block px-3 py-1 rounded-full mt-2">{limiteAlunos} Alunos</p>
      </div>
      <ul className="space-y-3 mb-8 flex-grow">
        {beneficios.map((beneficio, index) => (
          <li key={index} className="flex items-start">
            <div className="p-1 bg-dribla-green/10 rounded mr-3 flex-shrink-0">
              <Check className="w-4 h-4 text-dribla-green" />
            </div>
            <span className="text-gray-300 text-sm leading-relaxed">{beneficio}</span>
          </li>
        ))}
      </ul>
      <Link
        href={`/checkout?plano=${planoQuery}`}
        className={`w-full inline-block text-center py-3.5 rounded-lg font-bold transition-all duration-200 shadow-lg ${
          destaque 
            ? 'bg-dribla-green text-gray-900 hover:bg-dribla-green-600 shadow-dribla-green/30 hover:scale-105' 
            : 'bg-gray-700 text-white hover:bg-dribla-green hover:text-gray-900 hover:scale-105'
        }`}
      >
        Selecionar Plano
      </Link>
    </div>
  );
};
const PlanosPage: React.FC = () => {
  const [planoAtualUsuario, setPlanoAtualUsuario] = useState<string | null>(null);
  const [limiteAlunosUsuario, setLimiteAlunosUsuario] = useState<number | null>(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [manageLoading, setManageLoading] = useState(false);
  const [manageError, setManageError] = useState<string | null>(null);
  const [manageSuccess, setManageSuccess] = useState<string | null>(null);
  useEffect(() => {
    const fetchTreinador = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      try {
        const { data: treinador } = await supabase
          .from('treinadores')
          .select('plano_atual, limite_alunos')
          .eq('id', user.id)
          .single();
        if (treinador) {
          setPlanoAtualUsuario(treinador.plano_atual || null);
          setLimiteAlunosUsuario(typeof treinador.limite_alunos === 'number' ? treinador.limite_alunos : null);
        }
      } catch (err) {
        console.debug('Erro ao buscar treinador:', err);
      }
    };
    fetchTreinador();
  }, []);
  const handleCancelSubscription = async () => {
    if (planoAtualUsuario === 'free' || !planoAtualUsuario) {
      setManageError('O plano Free não pode ser cancelado.');
      return;
    }
    setManageLoading(true);
    setManageError(null);
    setManageSuccess(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('Sessão inválida. Faça login novamente.');
      const res = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || json?.message || 'Erro ao cancelar assinatura');
      setPlanoAtualUsuario('free');
      setLimiteAlunosUsuario(30);
      setManageSuccess('Assinatura cancelada. Você voltou para o plano Free.');
      setShowConfirmCancel(false);
    } catch (err: any) {
      setManageError(err.message || 'Erro ao cancelar assinatura');
    } finally {
      setManageLoading(false);
    };
  };
  const planos = [
    {
      nome: 'Plano VIP',
      preco: 'R$ 59',
      limiteAlunos: 'Até 150',
      beneficios: [
        'Gestão completa de alunos',
        'Painel de Status Financeiro',
        'Envio automático de e-mails de cobrança',
        'Relatórios básicos de inadimplência',
        'Suporte via E-mail',
      ],
      destaque: true,
      planoQuery: 'vip', 
    },
    {
      nome: 'Plano Premium',
      preco: 'R$ 99',
      limiteAlunos: 'Ilimitado',
      beneficios: [
        'Tudo do Plano VIP',
        'Relatórios financeiros avançados',
        'Acesso prioritário a novas funcionalidades',
        'Suporte Prioritário',
      ],
      destaque: false,
      planoQuery: 'premium', 
    },
  ] as const; 
  return (
    <>
      <Head>
        <title>Dribla | Escolha seu Plano</title>
      </Head>
      <Layout title="Escolha seu Plano">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3 text-white">Planos Flexíveis para sua Escolinha</h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Escolha a opção que melhor se adapta ao seu crescimento e comece a recuperar receita hoje mesmo.
          </p>
        </div>
        {planoAtualUsuario && (
          <div className="max-w-5xl mx-auto mb-8">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-xl border border-gray-700">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-dribla-green/10 rounded-lg">
                      <CreditCard className="w-5 h-5 text-dribla-green" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Seu Plano Atual</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-4 py-1.5 bg-dribla-green/10 text-dribla-green rounded-full text-sm font-semibold uppercase">
                      {planoAtualUsuario}
                    </span>
                    <span className="text-sm text-gray-400">
                      {limiteAlunosUsuario === 99999 ? 'Alunos ilimitados' : `Até ${limiteAlunosUsuario} alunos`}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link href="/contato" className="text-sm text-gray-400 hover:text-dribla-green transition-colors">
                    Fale com suporte
                  </Link>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowManageModal(true)}
                    className="border-gray-600 hover:border-dribla-green hover:text-dribla-green"
                  >
                    Gerenciar Assinatura
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        {}
        {showManageModal && (
          <Modal isOpen={true} onClose={() => setShowManageModal(false)} title="Gerenciar Assinatura">
            <div className="space-y-6">
              {}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Plano Atual:</span>
                    <span className="px-3 py-1 bg-dribla-green/10 text-dribla-green rounded-full text-sm font-semibold uppercase">
                      {planoAtualUsuario}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Limite de Alunos:</span>
                    <span className="text-sm font-semibold text-white">
                      {limiteAlunosUsuario === 99999 ? 'Ilimitado' : limiteAlunosUsuario ?? '—'}
                    </span>
                  </div>
                </div>
              </div>
              {manageError && (
                <Alert variant="error" title="Erro">{manageError}</Alert>
              )}
              {manageSuccess && (
                <Alert variant="success" title="Sucesso">{manageSuccess}</Alert>
              )}
              {}
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="/checkout?plano=MANAGE" className="flex-1">
                  <Button variant="secondary" className="w-full">
                    Abrir Portal de Pagamento
                  </Button>
                </a>
                <Button 
                  variant="danger" 
                  onClick={() => setShowConfirmCancel(true)} 
                  disabled={manageLoading || planoAtualUsuario === 'free'}
                  title={planoAtualUsuario === 'free' ? 'Assinatura free não pode ser cancelada' : undefined}
                  className="flex-1"
                >
                  Cancelar Assinatura
                </Button>
              </div>
              {planoAtualUsuario === 'free' && (
                <p className="text-xs text-gray-400 text-center bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                  Plano Free não possui assinatura ativa e não pode ser cancelado.
                </p>
              )}
            </div>
          </Modal>
        )}
        {}
        {showConfirmCancel && (
          <Modal 
            isOpen={true} 
            onClose={() => setShowConfirmCancel(false)} 
            title="Confirmar Cancelamento"
          >
            <div className="space-y-4">
              <Alert variant="warning" title="Atenção" className="mb-4">
                Ao cancelar sua assinatura:
                <ul className="list-disc pl-4 mt-2 space-y-1 text-sm">
                  <li>Você voltará para o plano gratuito</li>
                  <li>Seu limite será reduzido para 30 alunos</li>
                  <li>Você manterá acesso aos seus dados atuais</li>
                  <li>Pode reativar sua assinatura a qualquer momento</li>
                </ul>
              </Alert>
              {manageError && (
                <Alert variant="error" title="Erro" className="mb-2">{manageError}</Alert>
              )}
              <div className="flex justify-end gap-3">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowConfirmCancel(false)}
                  disabled={manageLoading}
                >
                  Voltar
                </Button>
                <Button 
                  variant="danger" 
                  onClick={handleCancelSubscription}
                  disabled={manageLoading}
                >
                  {manageLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cancelando...
                    </span>
                  ) : (
                    'Confirmar Cancelamento'
                  )}
                </Button>
              </div>
            </div>
          </Modal>
        )}
        {}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
            {planos.map((plano) => (
              <PlanoCard
                key={plano.nome}
                nome={plano.nome}
                preco={plano.preco}
                limiteAlunos={plano.limiteAlunos}
                beneficios={[...plano.beneficios]}
                destaque={plano.destaque}
                planoQuery={plano.planoQuery}
              />
            ))}
          </div>
        </div>
        <div className="text-center mt-16 space-y-3">
            <p className="text-gray-400">Precisa de ajuda para escolher? <Link href="/contato" className="text-dribla-green hover:text-dribla-green-600 font-semibold transition-colors">Fale Conosco</Link>.</p>
            <p className="text-sm text-gray-500">Todos os planos podem ser cancelados a qualquer momento.</p>
        </div>
      </Layout>
    </>
  );
};
export default PlanosPage;
