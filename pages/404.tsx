import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { BeamsBackground } from '../components/ui/BeamsBackground';
export default function Custom404() {
  return (
    <>
      <Head>
        <title>404 - Página não encontrada | Dribla</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4">
        <BeamsBackground 
          intensity="medium" 
          className="fixed inset-0"
        />
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-9xl font-extrabold bg-gradient-to-r from-dribla-green to-dribla-green-600 bg-clip-text text-transparent mb-4">
              404
            </h1>
            <h2 className="text-3xl font-bold mb-4 text-white">
              Página não encontrada
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              A página que você está procurando não existe ou foi movida.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/home-acao">
              <button className="flex items-center gap-2 px-6 py-3 bg-dribla-green text-gray-900 font-bold rounded-lg hover:bg-dribla-green-600 transition-all duration-200 shadow-lg hover:scale-105">
                <Home className="w-5 h-5" />
                Ir para Dashboard
              </button>
            </Link>
            <button 
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all duration-200 border border-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800">
            <p className="text-gray-500 text-sm">
              Precisa de ajuda?{' '}
              <Link href="/contato" className="text-dribla-green hover:text-dribla-green-600 transition-colors">
                Entre em contato
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
