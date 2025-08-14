'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
}

// SubscriptionInfo removido - não mais necessário após simplificação

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  // subscriptionInfo removido - não mais necessário após simplificação
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Buscar dados do usuário
          const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUser(userData);
            
            // Busca de dados da assinatura removida - não mais necessária após simplificação
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Image
            width={150}
            height={150}
            src={'/redimen2.png'}
            alt='CNAB Fácil Logo'
          />
          
          <nav className="hidden md:flex items-center space-x-4">
            <a href="#recursos" className="px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 font-medium">Recursos</a>
            <a href="#precos" className="px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 font-medium">Preços</a>
            <a href="#cases" className="px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 font-medium">Cases</a>
            
            {!isLoading && (
              user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700 font-medium">
                    Olá, {user.name.split(' ')[0]}
                  </span>
                  
                  {/* Botão Conversor (para todo usuário logado - proteção via backend) */}
                  <a
                    href="/conversor"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Conversor
                  </a>
                    
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-red-600 transition-colors"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <Link href="/login" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Começar por R$ 100/mês
                </Link>
              )
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}