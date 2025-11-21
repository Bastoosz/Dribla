import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router'; 
import { Home, Users, CreditCard, User, LogOut, Activity, Menu, X } from 'lucide-react'; 
import { supabase } from '../lib/supabaseClient'; 
import { EscolinhaProfile } from './EscolinhaProfile';
interface LayoutProps {
  children: ReactNode;
  title: string; 
}
const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const router = useRouter();
  const [nomeEscolinha, setNomeEscolinha] = useState<string>('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  useEffect(() => {
    const fetchEscolinhaName = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('treinadores')
        .select('nome_escolinha')
        .eq('id', user.id)
        .single()
      if (data?.nome_escolinha) {
        setNomeEscolinha(data.nome_escolinha)
      }
    }
    fetchEscolinhaName()
  }, [])
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push('/login'); 
    } else {
      console.error('Erro ao fazer logout:', error.message);
    }
  };
  const navItems = [
    { href: '/home-acao', label: 'Dashboard', icon: Home },
    { href: '/elenco', label: 'Elenco', icon: Users },
    { href: '/financeiro', label: 'Financeiro', icon: CreditCard },
    { href: '/status', label: 'Status', icon: Activity },
    { href: '/perfil', label: 'Perfil', icon: User },
  ];
  return (
    <div className="min-h-screen flex bg-dribla-graphite text-dribla-light">
      {}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      {}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 p-4 flex flex-col justify-between border-r border-gray-800 shadow-lg transform transition-transform duration-300 lg:transform-none ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {}
        <div>
          <div className="mb-8 flex items-center justify-between pt-2">
            {}
             <Link href="/home-acao" className="text-3xl font-bold text-dribla-green tracking-wider inline-block">
               DRIBLA
             </Link>
             {}
             <button
               onClick={() => setIsMobileMenuOpen(false)}
               className="lg:hidden text-gray-400 hover:text-white"
             >
               <X className="w-6 h-6" />
             </button>
          </div>
          {}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-2.5 rounded-lg transition duration-200 ease-in-out group ${
                    isActive
                      ? 'bg-dribla-green text-gray-900 font-semibold shadow-md' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white' 
                  }`}
                >
                  <item.icon className={`w-5 h-5 mr-3 transition duration-200 ${isActive ? 'text-gray-900' : 'text-gray-500 group-hover:text-white'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        {}
        <div className="border-t border-gray-700 pt-4 mt-4 space-y-2">
           {}
           {}
           {}
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2.5 rounded-lg text-gray-400 hover:bg-red-800/50 hover:text-red-300 transition duration-200 group"
          >
            <LogOut className="w-5 h-5 mr-3 text-gray-500 group-hover:text-red-300 transition duration-200" />
            Sair
          </button>
        </div>
      </aside>
      {}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
         {}
         <header className="bg-gray-850 p-4 border-b border-gray-700 shadow-sm sticky top-0 z-10 flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-white">{title || 'Dashboard'}</h1>
            </div>
            {nomeEscolinha && (
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <span className="hidden md:inline">Escolinha:</span>
                <span className="text-dribla-green font-medium">{nomeEscolinha}</span>
              </div>
            )}
         </header>
         {}
         <main className="flex-1 p-4 md:p-6 lg:p-10 overflow-y-auto bg-dribla-graphite">
            {children}
         </main>
      </div>
    </div>
  );
};
export default Layout;
