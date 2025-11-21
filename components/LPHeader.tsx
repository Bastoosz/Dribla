import React from 'react';
import Link from 'next/link';
const LPHeader: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md border-b border-dribla-graphite-600">
      <div className="dribla-gradient-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center group">
                <span className="text-2xl font-bold tracking-wider bg-gradient-to-r from-dribla-light-900 to-dribla-green-400 bg-clip-text text-transparent group-hover:to-dribla-green-300 transition-all duration-300">
                  DRI<span className="text-dribla-green-500 group-hover:text-dribla-green-400 transition-colors duration-300">B</span>LA
                </span>
              </Link>
            </div>
            {}
            <div className="flex items-center space-x-6">
              <Link href="/login" className="dribla-nav-link">
                Login
              </Link>
              <Link href="/cadastro">
                <button className="dribla-button">
                  Começar Agora
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
export default LPHeader;