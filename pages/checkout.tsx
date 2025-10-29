import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { CheckCircle, Lock, Users, Zap } from 'lucide-react';
import LPHeader from '../components/LPHeader'; // Reutiliza o Header da Landing Page

// Definição dos planos
const PLANOS_INFO = {
  VIP: {
    nome: "Plano VIP",
    preco: "R$ 59,90",
    precoMes: "/mês",
    limite: "Até 150 alunos",
    beneficios: [
      "Gestão de Alunos Ilimitada (até 150)",
      "Dashboard Financeiro Completo",
      "Envio Automático de Cobranças",
    ],
    cor: "dribla-green"
  },
  PREMIUM: {
    nome: "Plano Premium",
    preco: "R$ 99,90",
    precoMes: "/mês",
    limite: "Alunos Ilimitados",
    beneficios: [
      "Todos os benefícios do VIP",
      "Alunos Ilimitados",
      "Mensagens de Cobrança Personalizadas",
    ],
    cor: "dribla-orange"
  }
};

type PlanoKey = 'VIP' | 'PREMIUM';

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const [planoSelecionado, setPlanoSelecionado] = useState<PlanoKey>('VIP'); // Default

  useEffect(() => {
    // Lê o plano da URL (ex: /checkout?plano=VIP)
    if (router.query.plano && (router.query.plano === 'VIP' || router.query.plano === 'PREMIUM')) {
      setPlanoSelecionado(router.query.plano as PlanoKey);
    }
  }, [router.query]);

  const planoInfo = PLANOS_INFO[planoSelecionado];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // A LÓGICA DE PAGAMENTO FOI REMOVIDA
    // Apenas redireciona para uma página de "sucesso" (mock) ou dashboard
    alert("Simulação de Pagamento Concluída! (Redirecionando...)");
    router.push('/home-acao');
  };

  return (
    <>
      <Head>
        <title>Dribla | Checkout - {planoInfo.nome}</title>
      </Head>
      
      <div className="min-h-screen bg-dribla-graphite text-dribla-light">
        <LPHeader />

        <main className="max-w-6xl mx-auto p-4 md:p-8 mt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Coluna 1: Resumo do Plano (Dinâmico) */}
            <div className={`p-8 rounded-xl border-2 border-${planoInfo.cor} bg-gray-900/50 shadow-2xl`}>
              <h2 className="text-2xl font-bold text-white mb-4">{planoInfo.nome}</h2>
              
              <div className="mb-6">
                <span className={`text-5xl font-extrabold text-${planoInfo.cor}`}>{planoInfo.preco}</span>
                <span className="text-lg text-gray-400 ml-2">{planoInfo.precoMes}</span>
              </div>
              
              <p className="text-sm text-gray-300 mb-6">
                {planoInfo.limite === "Alunos Ilimitados" 
                  ? <Users className="w-5 h-5 inline mr-2 text-dribla-green" /> 
                  : <Users className="w-5 h-5 inline mr-2 text-dribla-green" />}
                {planoInfo.limite}
              </p>

              <ul className="space-y-3">
                {planoInfo.beneficios.map((beneficio) => (
                  <li key={beneficio} className="flex items-center text-gray-300">
                    <CheckCircle className="w-5 h-5 mr-3 text-dribla-green flex-shrink-0" />
                    {beneficio}
                  </li>
                ))}
              </ul>
            </div>

            {/* Coluna 2: Formulário de Pagamento (Mock) */}
            <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Informações de Pagamento</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email (Simulação) */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email da Conta</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-dribla-green focus:border-dribla-green sm:text-sm text-white"
                    placeholder="treinador@escola.com"
                    required
                  />
                </div>

                {/* Nome no Cartão (Simulação) */}
                <div>
                  <label htmlFor="card-name" className="block text-sm font-medium text-gray-300">Nome no Cartão</label>
                  <input 
                    type="text" 
                    id="card-name"
                    placeholder="Nome completo"
                    className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-dribla-green focus:border-dribla-green sm:text-sm text-white"
                    required
                  />
                </div>
                
                {/* Dados Falsos do Cartão */}
                <div>
                  <label htmlFor="card-number" className="block text-sm font-medium text-gray-300">Dados do Cartão (Simulação)</label>
                  <div className="mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-400">
                    (Simulação de Checkout - Não insira dados reais)
                  </div>
                </div>

                {/* Botão de Pagamento (Mock) */}
                <button 
                  type="submit" 
                  className={`w-full py-3 mt-4 bg-${planoInfo.cor} text-gray-900 font-bold rounded-lg hover:opacity-90 transition duration-300 shadow-xl flex items-center justify-center`}
                >
                  <Lock className="w-5 h-5 mr-2" />
                  Pagar e Ativar Plano {planoSelecionado}
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">Pagamento seguro (simulado).</p>
              </form>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default CheckoutPage;