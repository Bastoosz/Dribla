// pages/checkout.tsx

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { Loader2, Lock, Check } from 'lucide-react';
import { supabase } from '../lib/supabaseClient'; // <<< IMPORTA O SUPABASE

// Define a estrutura para os detalhes do plano
interface PlanoDetalhes {
  nome: string;
  preco: string;
  beneficios: string[];
}

// Mapeia o parâmetro da query para os detalhes do plano
const planosInfo: Record<string, PlanoDetalhes> = {
  VIP: {
    nome: 'Plano VIP',
    preco: 'R$ 59/mês',
    beneficios: [
      'Até 150 Alunos',
      'Gestão completa',
      'Envio automático de cobranças',
      'Relatórios básicos',
    ],
  },
  PREMIUM: {
    nome: 'Plano Premium',
    preco: 'R$ 99/mês',
    beneficios: [
      'Alunos Ilimitados',
      'Tudo do VIP',
      'Cobranças personalizáveis',
      'Relatórios avançados',
      'Suporte Prioritário',
    ],
  },
};

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const { plano } = router.query;
  const [planoSelecionado, setPlanoSelecionado] = useState<PlanoDetalhes | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Estado para erros

  useEffect(() => {
    if (plano && typeof plano === 'string' && planosInfo[plano.toUpperCase()]) {
      setPlanoSelecionado(planosInfo[plano.toUpperCase()]);
    } else if (planosInfo['VIP']) {
      setPlanoSelecionado(planosInfo['VIP']);
    }
  }, [plano]);

  // --- FUNÇÃO DE PAGAMENTO ATUALIZADA ---
  const handlePagamento = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Obter o usuário logado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Usuário não autenticado. Faça login novamente.');
      setLoading(false);
      return;
    }

    // 2. Determinar qual plano e limite aplicar
    const planoQuery = Array.isArray(plano) ? plano[0] : plano; // Garante que 'plano' é string
    
    if (!planoQuery || (planoQuery.toUpperCase() !== 'VIP' && planoQuery.toUpperCase() !== 'PREMIUM')) {
       setError('Plano inválido selecionado.');
       setLoading(false);
       return;
    }

    const novoPlano = planoQuery.toUpperCase() === 'VIP' ? 'vip' : 'premium';
    const novoLimite = novoPlano === 'vip' ? 150 : 99999; // 99999 para "Ilimitado"

    // 3. Atualizar a tabela 'treinadores' no Supabase
    const { error: updateError } = await supabase
      .from('treinadores')
      .update({
        plano_atual: novoPlano,
        limite_alunos: novoLimite
      })
      .eq('id', user.id); // Atualiza apenas o treinador logado

    if (updateError) {
      console.error('Erro ao atualizar plano:', updateError);
      setError('Não foi possível atualizar seu plano. Tente novamente.');
      setLoading(false);
      return;
    }
    
    // 4. Sucesso
    setLoading(false);
    console.log('Plano atualizado com sucesso para:', novoPlano);
    
    // 5. Redirecionar para a página de financeiro com status de sucesso
    router.push('/financeiro?status=sucesso');
  };

  return (
    <>
      <Head>
        <title>Dribla | Checkout - {planoSelecionado?.nome || 'Plano'}</title>
      </Head>
      <Layout title={`Checkout - ${planoSelecionado?.nome || 'Finalizar Assinatura'}`}>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* Coluna Esquerda: Resumo do Plano */}
          <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-white">Resumo do Pedido</h2>
            {planoSelecionado ? (
              <>
                <div className="mb-6 pb-6 border-b border-gray-700">
                  <h3 className="text-xl font-semibold text-dribla-green">{planoSelecionado.nome}</h3>
                  <p className="text-3xl font-extrabold text-white mt-2">{planoSelecionado.preco}</p>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-300 mb-3">Benefícios Incluídos:</h4>
                  <ul className="space-y-2">
                    {planoSelecionado.beneficios.map((item, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-400">
                        <Check className="w-4 h-4 text-dribla-green mr-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="flex justify-center items-center h-32">
                  <Loader2 className="w-8 h-8 text-dribla-green animate-spin" />
              </div>
            )}
          </div>

          {/* Coluna Direita: Formulário de Pagamento */}
          <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
              <Lock className="w-5 h-5 mr-2 text-gray-400"/> Informações de Pagamento
            </h2>

            <form onSubmit={handlePagamento} className="space-y-4">
              {/* Campos do Formulário */}
              <div>
                <label htmlFor="card-nome" className="label-dribla">Nome no Cartão</label>
                <input type="text" id="card-nome" placeholder="Nome completo" required className="input-dribla" />
              </div>
              <div>
                <label htmlFor="card-numero" className="label-dribla">Número do Cartão</label>
                <input type="text" id="card-numero" placeholder="**** **** **** ****" required className="input-dribla" />
              </div>
              <div className="flex space-x-4">
                <div className="w-2/3">
                  <label htmlFor="card-validade" className="label-dribla">Validade (MM/AA)</label>
                  <input type="text" id="card-validade" placeholder="MM/AA" required className="input-dribla" />
                </div>
                <div className="w-1/3">
                  <label htmlFor="card-cvv" className="label-dribla">CVV</label>
                  <input type="text" id="card-cvv" placeholder="***" required className="input-dribla" />
                </div>
              </div>

              {/* --- Exibição de Erro --- */}
              {error && (
                <div className="text-red-400 text-sm text-center p-3 bg-red-900/50 border border-red-700 rounded-lg">
                  {error}
                </div>
              )}

              {/* Botão de Pagamento */}
              <button
                type="submit"
                disabled={loading || !planoSelecionado}
                className={`w-full mt-6 btn-primary ${
                  loading || !planoSelecionado ? 'bg-gray-600 text-gray-400 cursor-not-allowed hover:bg-gray-600' : ''
                }`}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  `Assinar ${planoSelecionado?.nome || ''} (${planoSelecionado?.preco || ''})`
                )}
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">Pagamento seguro. Você pode cancelar a qualquer momento.</p>
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default CheckoutPage;

