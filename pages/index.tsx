// pages/index.tsx

import React from 'react'; 
import Head from 'next/head';
import Link from 'next/link';
import { Check, Zap, DollarSign, Users, TrendingUp } from 'lucide-react';
import LPHeader from 'components/LPHeader'; // Importação absoluta

// Componente para os Cards de Valor (LÓGICA DE COR ALTERADA)
interface ValueCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  colorClass: 'green' | 'orange' | 'neutral'; // Adicionado 'neutral'
}

const ValueCard: React.FC<ValueCardProps> = ({ icon, title, description, colorClass }) => {
  
  // Define as classes com base na nova lógica
  const iconColor = 
    colorClass === 'orange' ? 'text-dribla-orange' :
    colorClass === 'green' ? 'text-dribla-green' : // Mantido para o CTA final, mas mudamos os ícones abaixo
    'text-white'; // Padrão Neutro

  const borderColor = 
    colorClass === 'orange' ? 'hover:bg-dribla-orange/10 border-dribla-orange' :
    colorClass === 'green' ? 'hover:bg-dribla-green/10 border-dribla-green' :
    'hover:bg-gray-800 border-gray-700'; // Padrão Neutro

  return (
    <div className={`p-6 rounded-xl border transition duration-300 ${borderColor} bg-dribla-graphite/80`}>
      <div className={`text-2xl mb-4 ${iconColor}`}>{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
};

const LandingPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Dribla | Gestão que Recupera Dinheiro</title>
      </Head>
      
      <div className="min-h-screen bg-dribla-graphite text-dribla-light">
        <LPHeader />

        <main>
          {/* SEÇÃO 1: HERO */}
          <section className="relative pt-16 pb-24 text-center max-w-4xl mx-auto">
            {/* ... (Gradiente e Título H1) ... */}
            <h1 className="text-6xl font-extrabold mb-4 relative z-10">
              Gestão que <span className="text-dribla-green">Recupera Dinheiro</span>
            </h1>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Esqueça planilhas. O Dribla mostra exatamente onde agir para maximizar sua receita.
            </p>
            {/* ... (Botões CTA e ícones de segurança) ... */}
            <div className="flex justify-center space-x-4 mb-8 relative z-10">
              <Link href="/checkout?plano=VIP">
                <button className="px-8 py-3 bg-dribla-green text-gray-900 font-bold rounded-lg hover:bg-green-600 transition duration-300 shadow-xl">
                  Começar Dribla Agora
                </button>
              </Link>
              <Link href="/#valores">
                <button className="px-8 py-3 bg-gray-800 border border-gray-700 text-white font-semibold rounded-lg hover:bg-gray-700 transition duration-300">
                  Ver Recursos
                </button>
              </Link>
            </div>
            <div className="flex justify-center space-x-6 text-sm text-gray-400 relative z-10">
              <span className="flex items-center"><Check className="w-4 h-4 mr-1 text-dribla-green" /> 100% Seguro</span>
              <span className="flex items-center"><Zap className="w-4 h-4 mr-1 text-dribla-green" /> Setup em 2 Minutos</span>
              <span className="flex items-center"><Users className="w-4 h-4 mr-1 text-dribla-green" /> Sem cartão para começar</span>
            </div>
          </section>

          {/* SEÇÃO 2: PILARES DE VALOR (CORREÇÃO DE COR) */}
          <section id="valores" className="py-16 max-w-7xl mx-auto">
            <h2 className="text-center text-3xl font-bold mb-3 text-white">Por Que o Dribla <span className="text-dribla-green">Vence</span></h2>
            <p className="text-center text-gray-400 mb-12">Três pilares que transformam a gestão da sua escolinha.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
              <ValueCard
                icon={<Users />}
                title="Gestão sem Fricção"
                description="Sistema visual e intuitivo. Menos cliques, mais resultados. Tudo que você precisa em cards claros e responsivos."
                colorClass="neutral" // <-- MUDADO DE 'green' PARA 'neutral'
              />
              <ValueCard
                icon={<DollarSign />}
                title="Cobrança Automatizada"
                description="Veja exatamente quem está em atraso e quanto dinheiro recuperar. Ação imediata, receita maximizada."
                colorClass="orange" // <-- Mantido 'orange'
              />
              <ValueCard
                icon={<TrendingUp />}
                title="Foco no Campo"
                description="Menos tempo na burocracia, mais tempo treinando. Deixe o Dribla cuidar da gestão enquanto você foca nos atletas."
                colorClass="neutral" // <-- MUDADO DE 'green' PARA 'neutral'
              />
            </div>
          </section>

          {/* SEÇÃO 3: PROVA SOCIAL */}
          <section className="py-16 max-w-7xl mx-auto text-center">
            {/* ... (Título H2) ... */}
            <h2 className="text-4xl font-bold mb-3 text-white">Junte-se aos Treinadores que Dão <span className="text-dribla-green">Drible no Prejuízo</span></h2>
            <p className="text-lg text-gray-400 mb-12">Mais receita, menos tempo perdido com gestão manual.</p>
            
            <div className="flex justify-around items-center max-w-3xl mx-auto">
              <div className="p-4">
                <p className="text-5xl font-extrabold text-dribla-green mb-1">500+</p>
                <p className="text-gray-400">Treinadores Ativos</p>
              </div>
              <div className="p-4">
                <p className="text-5xl font-extrabold text-white mb-1">10K+</p>
                <p className="text-gray-400">Alunos Gerenciados</p>
              </div>
              <div className="p-4">
                <p className="text-5xl font-extrabold text-dribla-green mb-1">98%</p>
                <p className="text-gray-400">Satisfação</p>
              </div>
            </div>
          </section>

          {/* SEÇÃO 4: CTA FINAL */}
          <section className="py-24 max-w-5xl mx-auto text-center">
            <div className="bg-gray-900/70 p-12 rounded-2xl border border-dribla-green/20 shadow-2xl relative">
              {/* ... (Título H2 e <p>) ... */}
              <h2 className="text-3xl font-bold mb-3 text-white">Escolha o Plano Ideal para Sua <span className="text-dribla-green">Escolinha</span></h2>
              <p className="text-gray-400 mb-8">
                Planos flexíveis que crescem com você. Comece grátis ou escolha a potência total.
              </p>
              
              <div className="flex justify-center space-x-4">
                <Link href="/checkout?plano=PREMIUM">
                  <button className="px-6 py-3 bg-gray-800 border border-gray-700 text-white font-semibold rounded-lg hover:bg-gray-700 transition duration-200">
                    Plano Premium - R$ 99/Mês
                  </button>
                </Link>
                <Link href="/checkout?plano=VIP">
                  <button className="px-6 py-3 bg-dribla-green text-gray-900 font-bold rounded-lg hover:bg-green-600 transition duration-200 shadow-xl">
                    Plano VIP - R$ 59/Mês
                  </button>
                </Link>
              </div>
              <p className="text-xs text-gray-500 mt-4">Ou comece no Plano Free - até 30 alunos.</p>
            </div>
          </section>
        </main>
        
        {/* Rodapé Simples */}
        <footer className="p-6 text-center text-sm text-gray-500 border-t border-gray-800 mt-12">
          &copy; {new Date().getFullYear()} Dribla. Gestão profissional para escolinhas de futebol.
        </footer>
      </div>
    </>
  );
};

export default LandingPage;