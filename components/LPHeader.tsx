// components/LPHeader.tsx

import React from 'react';
import Link from 'next/link';

const LPHeader: React.FC = () => {
  return (
    // Header fixo, escuro, com blur e borda inferior
    <header className="sticky top-0 z-50 w-full bg-dribla-graphite/80 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-dribla-green tracking-wider">
              DRIBLA
            </Link>
          </div>

          {/* Navegação da Direita (Login e CTA) */}
          <div className="flex items-center space-x-6">
            <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition duration-200">
              Login
            </Link>
            <Link href="/checkout?plano=VIP">
              <button className="px-4 py-2 bg-dribla-green text-gray-900 font-semibold rounded-lg hover:bg-green-600 transition duration-200 text-sm shadow-lg">
                Começar Agora
              </button>
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
};

export default LPHeader;