import React from 'react'; 
import Head from 'next/head';
import Link from 'next/link';
import { Check, Zap, DollarSign, Users, TrendingUp } from 'lucide-react';
import LPHeader from 'components/LPHeader'; 
import { BeamsBackground } from 'components/ui/BeamsBackground';
interface ValueCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  colorClass: 'green' | 'neutral' | 'accent'; 
}
const ValueCard: React.FC<ValueCardProps> = ({ icon, title, description, colorClass }) => {
  const iconColor = 
    colorClass === 'accent' ? 'text-dribla-green-300' :
    colorClass === 'green' ? 'text-dribla-green-400' :
    'text-dribla-light-600';
  return (
    <div className="dribla-card group">
      <div className={`text-2xl mb-4 ${iconColor} transition-transform duration-300 group-hover:scale-110`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-dribla-light-900 mb-2 group-hover:text-dribla-green-400 transition-colors duration-300">
        {title}
      </h3>
      <p className="text-dribla-light-500 text-sm group-hover:text-dribla-light-400 transition-colors duration-300">
        {description}
      </p>
    </div>
  );
};
const LandingPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Dribla | Gestão que Recupera Dinheiro</title>
      </Head>
      <div className="relative min-h-screen bg-dribla-graphite text-dribla-light">
        {}
        <BeamsBackground 
          intensity="medium" 
          className="fixed inset-0"
        />
        <div className="relative z-10">
          <LPHeader />
          <main>
            {}
            <section className="relative pt-16 pb-24 text-center max-w-4xl mx-auto px-4">
            {}
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
              Gestão que{' '}
              <span className="bg-gradient-to-r from-dribla-green-400 to-dribla-green-600 bg-clip-text text-transparent">
                Recupera Dinheiro
              </span>
            </h1>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Esqueça planilhas. O Dribla mostra exatamente onde agir para maximizar sua receita.
            </p>
            {}
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:space-x-4 mb-8">
              <Link href="/cadastro">
                <button className="w-full sm:w-auto px-8 py-3 bg-dribla-green text-gray-900 font-bold rounded-lg
                                 hover:bg-dribla-green-600 transition-all duration-300 shadow-xl
                                 hover:scale-105 hover:shadow-dribla-green-500/20 hover:shadow-2xl">
                  Começar Dribla Agora
                </button>
              </Link>
              <Link href="/#valores">
                <button className="w-full sm:w-auto px-8 py-3 bg-gray-800/80 backdrop-blur-sm border border-gray-700 
                                 text-white font-semibold rounded-lg hover:bg-gray-700/80 
                                 transition-all duration-300 hover:scale-105">
                  Ver Recursos
                </button>
              </Link>
            </div>
            {}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-gray-400">
              <span className="flex items-center hover:text-white transition-colors duration-200">
                <Check className="w-4 h-4 mr-1 text-dribla-green-400" /> 100% Seguro
              </span>
              <span className="flex items-center hover:text-white transition-colors duration-200">
                <Zap className="w-4 h-4 mr-1 text-dribla-green-400" /> Setup em 2 Minutos
              </span>
              <span className="flex items-center hover:text-white transition-colors duration-200">
                <Users className="w-4 h-4 mr-1 text-dribla-green-400" /> Sem cartão para começar
              </span>
            </div>
          </section>
          {}
          <section id="valores" className="py-16 max-w-7xl mx-auto">
            <h2 className="text-center text-3xl font-bold mb-3 text-white">
              Por Que o Dribla{' '}
              <span className="bg-gradient-to-r from-dribla-green-400 to-dribla-green-600 bg-clip-text text-transparent">
                Vence
              </span>
            </h2>
            <p className="text-center text-gray-400 mb-12">
              Três pilares que transformam a gestão da sua escolinha.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
              <ValueCard
                icon={<Users />}
                title="Gestão sem Fricção"
                description="Sistema visual e intuitivo. Menos cliques, mais resultados. Tudo que você precisa em cards claros e responsivos."
                colorClass="neutral"
              />
              <ValueCard
                icon={<DollarSign />}
                title="Cobrança Automatizada"
                description="Veja exatamente quem está em atraso e quanto dinheiro recuperar. Ação imediata, receita maximizada."
                colorClass="green"
              />
              <ValueCard
                icon={<TrendingUp />}
                title="Foco no Campo"
                description="Menos tempo na burocracia, mais tempo treinando. Deixe o Dribla cuidar da gestão enquanto você foca nos atletas."
                colorClass="neutral"
              />
            </div>
          </section>
          {}
          <section className="py-16 max-w-7xl mx-auto text-center px-4">
            <h2 className="text-4xl font-bold mb-3 text-white">
              Junte-se aos Treinadores que Dão{' '}
                  <span className="bg-gradient-to-r from-dribla-green-400 to-dribla-green-600 bg-clip-text text-transparent">
                    Drible no Prejuízo
                  </span>
            </h2>
            <p className="text-lg text-gray-400 mb-12">
              Mais receita, menos tempo perdido com gestão manual.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="p-4 bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-700/50
                            hover:bg-gray-800 transition-all duration-300 hover:scale-105">
                <p className="text-4xl sm:text-5xl font-extrabold text-dribla-green mb-1">500+</p>
                <p className="text-gray-400">Treinadores Ativos</p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-700/50
                            hover:bg-gray-800 transition-all duration-300 hover:scale-105">
                <p className="text-4xl sm:text-5xl font-extrabold text-white mb-1">10K+</p>
                <p className="text-gray-400">Alunos Gerenciados</p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-700/50
                            hover:bg-gray-800 transition-all duration-300 hover:scale-105">
                <p className="text-4xl sm:text-5xl font-extrabold text-dribla-green-400 mb-1">98%</p>
                <p className="text-gray-400">Satisfação</p>
              </div>
            </div>
          </section>
          {}
          <section className="py-24 max-w-5xl mx-auto text-center px-4">
            <div className="bg-gray-900/70 p-8 sm:p-12 rounded-2xl border border-dribla-green/20 
                          shadow-2xl relative backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-dribla-green/5 to-transparent rounded-2xl" />
              <h2 className="text-3xl font-bold mb-3 text-white relative">
                Escolha o Plano Ideal para Sua{' '}
                <span className="bg-gradient-to-r from-dribla-green-400 to-dribla-green-600 bg-clip-text text-transparent">
                  Escolinha
                </span>
              </h2>
              <p className="text-gray-400 mb-8 relative">
                Planos flexíveis que crescem com você. Comece grátis ou escolha a potência total.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 relative">
                <Link href="/cadastro">
                  <button className="w-full sm:w-auto px-6 py-3 bg-gray-800/80 backdrop-blur-sm border 
                                   border-gray-700 text-white font-semibold rounded-lg hover:bg-gray-700/80 
                                   transition-all duration-300 hover:scale-105">
                    Plano Premium - R$ 99/Mês
                  </button>
                </Link>
                <Link href="/cadastro">
                  <button className="w-full sm:w-auto px-6 py-3 bg-dribla-green text-gray-900 font-bold 
                                   rounded-lg hover:bg-dribla-green-600 transition-all duration-300 shadow-xl
                                   hover:scale-105 hover:shadow-dribla-green-500/20 hover:shadow-2xl">
                    Plano VIP - R$ 59/Mês
                  </button>
                </Link>
              </div>
              <p className="text-sm text-gray-500 mt-4 relative">
                Ou comece no{' '}
                <Link href="/cadastro" className="text-dribla-green hover:text-dribla-green-500 transition-colors">
                  Plano Free
                </Link>
                {' '}— até 30 alunos.
              </p>
            </div>
          </section>
        </main>
        {}
        <footer className="p-6 text-center text-sm text-gray-500 border-t border-gray-800 mt-12">
          &copy; {new Date().getFullYear()} Dribla. Gestão profissional para escolinhas de futebol.
        </footer>
        </div>
      </div>
    </>
  );
};
export default LandingPage;