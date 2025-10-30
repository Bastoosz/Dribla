// components/Layout.tsx

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router'; // Para destacar o link ativo
import { Home, Users, CreditCard, User, LogOut } from 'lucide-react'; // Ícones
import { supabase } from '../lib/supabaseClient'; // Para o botão de logout

interface LayoutProps {
  children: ReactNode;
  title: string; // Título da página atual a ser exibido no cabeçalho
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const router = useRouter();

  // Função para fazer logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push('/login'); // Redireciona para login após logout
    } else {
      console.error("Erro ao fazer logout:", error);
      // Adicionar feedback visual de erro aqui, se necessário (ex: toast)
    }
  };

  // Itens da navegação da Sidebar
  const navItems = [
    { href: '/home-acao', label: 'Dashboard', icon: Home },
    { href: '/elenco', label: 'Elenco', icon: Users },
    { href: '/financeiro', label: 'Financeiro', icon: CreditCard }, // <-- LINK ADICIONADO
    // { href: '/configuracoes', label: 'Configurações', icon: Settings }, // Exemplo para futuras páginas
  ];

  return (
    <div className="min-h-screen flex bg-dribla-graphite text-dribla-light">
      {/* Sidebar Fixa */}
      <aside className="w-64 bg-gray-900 p-4 flex flex-col justify-between border-r border-gray-800 shadow-lg">
        {/* Parte Superior: Logo e Navegação Principal */}
        <div>
          <div className="mb-8 text-center pt-2">
            {/* Logo Clicável */}
             <Link href="/home-acao" className="text-3xl font-bold text-dribla-green tracking-wider inline-block">
               DRIBLA
             </Link>
          </div>
          {/* Menu de Navegação */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  // Estilos do link, incluindo o estado ativo
                  className={`flex items-center px-4 py-2.5 rounded-lg transition duration-200 ease-in-out group ${
                    isActive
                      ? 'bg-dribla-green text-gray-900 font-semibold shadow-md' // Estilo Ativo
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white' // Estilo Inativo/Hover
                  }`}
                >
                  <item.icon className={`w-5 h-5 mr-3 transition duration-200 ${isActive ? 'text-gray-900' : 'text-gray-500 group-hover:text-white'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Parte Inferior: Perfil (Futuro) e Logout */}
        <div className="border-t border-gray-700 pt-4 mt-4 space-y-2">
           {/* Link para Perfil (Ainda não criado) - Descomentar quando a página existir */}
           {/* <Link href="/perfil" className={`flex items-center px-4 py-2.5 rounded-lg transition duration-200 ${ router.pathname === '/perfil' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
             <User className="w-5 h-5 mr-3" /> Perfil
           </Link> */}
           {/* Botão de Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2.5 rounded-lg text-gray-400 hover:bg-red-800/50 hover:text-red-300 transition duration-200 group"
          >
            <LogOut className="w-5 h-5 mr-3 text-gray-500 group-hover:text-red-300 transition duration-200" />
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal Flexível */}
      <div className="flex-1 flex flex-col overflow-hidden">
         {/* Cabeçalho Superior Fixo (Opcional, mas útil) */}
         <header className="bg-gray-850 p-4 border-b border-gray-700 shadow-sm sticky top-0 z-10 flex items-center h-16">
            {/* Título da Página Atual */}
            <h1 className="text-xl font-semibold text-white">{title}</h1>
            {/* Pode adicionar outras informações aqui, como nome do usuário */}
         </header>

         {/* Área de Conteúdo com Scroll */}
         <main className="flex-1 p-6 md:p-10 overflow-y-auto bg-dribla-graphite">
            {children}
         </main>
      </div>

    </div>
  );
};

export default Layout;

