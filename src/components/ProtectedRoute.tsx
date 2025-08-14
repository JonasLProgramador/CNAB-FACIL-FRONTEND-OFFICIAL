'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  subscription?: {
    status: string;
    plan: string;
    endDate: string;
  };
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
}

export default function ProtectedRoute({ children, requireSubscription = false }: ProtectedRouteProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // Verificar se o token é válido e obter dados do usuário
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        const userData = await response.json();
        setUser(userData);

        // Se a rota requer assinatura, verificar status
        if (requireSubscription) {
          if (!userData.subscription || userData.subscription.status !== 'active') {
            router.push('/planos');
            return;
          }

          // Verificar se a assinatura não expirou
          const endDate = new Date(userData.subscription.endDate);
          const now = new Date();
          
          if (endDate < now) {
            router.push('/planos');
            return;
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        localStorage.removeItem('token');
        router.push('/login');
      }
    };

    checkAuth();
  }, [router, requireSubscription]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
