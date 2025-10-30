// pages/planos.tsx

import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout'; // Layout principal com sidebar
import Link from 'next/link';
import { Check } from 'lucide-react'; // Ícones

// Componente para o Card do Plano
interface PlanoCardProps {
  nome: string;
  preco: string;
  limiteAlunos: string;
  beneficios: string[];
  destaque?: boolean; // Para destacar o plano VIP ou recomendado
  planoQuery: 'VIP' | 'PREMIUM'; // Para o link do checkout
}

const PlanoCard: React.FC<PlanoCardProps> = ({ nome, preco, limiteAlunos, beneficios, destaque = false, planoQuery }) => {
  return (
    <div className={`relative p-8 rounded-xl border ${ // Adicionado 'relative' para o span de destaque
      destaque ? 'border-dribla-green bg-gray-800 shadow-lg scale-105' : 'border-gray-700 bg-gray-850 hover:border-gray-600'
    } transition duration-300 flex flex-col`}>
      {destaque && (
        <span className="absolute top-0 right-0 -mt-3 -mr-3 px-3 py-1 bg-dribla-green text-gray-900 text-xs font-bold rounded-full shadow">
          Recomendado
        </span>
      )}
      <h3 className={`text-2xl font-bold mb-4 ${destaque ? 'text-dribla-green' : 'text-white'}`}>{nome}</h3>
      <p className="text-4xl font-extrabold text-white mb-1">{preco}<span className="text-lg font-normal text-gray-400">/mês</span></p>
      <p className="text-sm text-gray-400 mb-6">{limiteAlunos} Alunos</p>

      <ul className="space-y-3 mb-8 flex-grow">
        {beneficios.map((beneficio, index) => (
          <li key={index} className="flex items-start">
            <Check className="w-5 h-5 text-dribla-green mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-gray-300 text-sm">{beneficio}</span>
          </li>
        ))}
      </ul>

      <Link href={`/checkout?plano=${planoQuery}`}>
        <button className={`w-full py-3 rounded-lg font-bold transition duration-200 ${
          destaque ? 'bg-dribla-green text-gray-900 hover:bg-green-600' : 'bg-gray-700 text-white hover:bg-dribla-green hover:text-gray-900'
        }`}>
          Selecionar Plano
        </button>
      </Link>
    </div>
  );
};


const PlanosPage: React.FC = () => {
  // === CORREÇÃO AQUI: Adicionado "as const" ===
  // Isso informa ao TypeScript que os valores são literais e fixos
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
      planoQuery: 'VIP', // TypeScript agora sabe que é 'VIP', não string
    },
    {
      nome: 'Plano Premium',
      preco: 'R$ 99',
      limiteAlunos: 'Ilimitado',
      beneficios: [
        'Tudo do Plano VIP',
        'Mensagens de cobrança personalizáveis',
        'Relatórios financeiros avançados',
        'Acesso prioritário a novas funcionalidades',
        'Suporte Prioritário',
      ],
      destaque: false,
      planoQuery: 'PREMIUM', // TypeScript agora sabe que é 'PREMIUM', não string
    },
  ] as const; // <--- A asserção "as const" é aplicada aqui

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

        {/* Grid dos Planos */}
        {/* Ajustado para centralizar melhor com 2 planos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {planos.map((plano) => (
            <PlanoCard
              key={plano.nome}
              nome={plano.nome}
              preco={plano.preco}
              limiteAlunos={plano.limiteAlunos}
              beneficios={plano.beneficios}
              destaque={plano.destaque}
              planoQuery={plano.planoQuery} // Agora o tipo bate corretamente
            />
          ))}
        </div>

        <div className="text-center mt-12 text-sm text-gray-500">
            <p>Precisa de ajuda para escolher? <Link href="/contato" className="text-dribla-green hover:underline">Fale Conosco</Link>.</p>
            <p className='mt-2'>Todos os planos podem ser cancelados a qualquer momento.</p>
        </div>
      </Layout>
    </>
  );
};

export default PlanosPage;
