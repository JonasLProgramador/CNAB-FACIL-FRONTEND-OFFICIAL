"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut } from 'lucide-react';

interface UserInfo {
  name: string;
  email: string;
}

// SubscriptionInfo removido - não mais necessário após simplificação

export default function Navbar() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  // subscriptionInfo removido - não mais necessário após simplificação
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetchUserInfo();
    fetchSubscriptionInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
      }
    } catch (error) {
      console.error('Erro ao buscar informações do usuário:', error);
    }
  };

  const fetchSubscriptionInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSubscriptionInfo({
          hasSubscription: false,
          status: 'none',
          plan: '',
          daysRemaining: 0
        });
        return;
      }

      // PRIMEIRO, VAMOS OBTER O userId DO TOKEN
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenPayload.sub;
      
      console.log('🔍 DEBUG - UserId extraído do token:', userId);
      console.log('🔍 DEBUG - Fazendo requisição para:', `${process.env.NEXT_PUBLIC_API_URL}/users/subscription/${userId}`);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/subscription/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log('🔍 DEBUG - Status da resposta:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 DEBUG - Resposta completa recebida:', JSON.stringify(data, null, 2));
      
        // EXTRAIR OS DADOS DE subscriptionDetails DA NOVA ESTRUTURA
        const subscriptionData = data.subscriptionDetails || {};
        console.log('🔍 DEBUG - subscriptionDetails extraídos:', subscriptionData);
        console.log('🔍 DEBUG - hasSubscription:', subscriptionData.hasSubscription, typeof subscriptionData.hasSubscription);
        console.log('🔍 DEBUG - status:', subscriptionData.status, typeof subscriptionData.status);
        console.log('🔍 DEBUG - plan:', subscriptionData.plan, typeof subscriptionData.plan);
      
        // Verificação robusta e múltipla
        const hasActiveSubscription = Boolean(subscriptionData.hasSubscription) && subscriptionData.status === 'active';
        const hasValidPlan = subscriptionData.plan && subscriptionData.plan !== '' && subscriptionData.plan !== null;
        const hasDaysRemaining = subscriptionData.daysRemaining > 0;
      
        console.log('🔍 DEBUG - hasActiveSubscription calculado:', hasActiveSubscription);
        console.log('🔍 DEBUG - hasValidPlan:', hasValidPlan);
        console.log('🔍 DEBUG - hasDaysRemaining:', hasDaysRemaining);
      
        // Considera ativo se tem assinatura E status ativo E plano válido
        const isReallyActive = hasActiveSubscription && hasValidPlan;
        console.log('🔍 DEBUG - isReallyActive final:', isReallyActive);
      
        setSubscriptionInfo({
          ...subscriptionData,
          hasSubscription: Boolean(subscriptionData.hasSubscription),
          isActive: isReallyActive,
          isReallyActive // propriedade adicional para debug
        });
      } else {
        console.error('🔍 DEBUG - Erro na resposta:', response.status);
        const errorText = await response.text();
        console.error('🔍 DEBUG - Texto do erro:', errorText);
        
        setSubscriptionInfo({
          hasSubscription: false,
          status: 'none',
          plan: '',
          daysRemaining: 0,
          isActive: false
        });
      }
    } catch (error) {
      console.error('🔍 DEBUG - Erro na requisição:', error);
      setSubscriptionInfo({
        hasSubscription: false,
        status: 'none',
        plan: '',
        daysRemaining: 0,
        isActive: false
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  // getPlanIcon removido - não mais necessário após simplificação

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo e Navegação */}
          <div className="flex items-center space-x-6">
            <button
              onClick={() => router.push('/conversor')}
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
            >
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CF</span>
              </div>
              <span className="font-bold text-xl">CNAB Fácil</span>
            </button>
            
            {/* Botão Voltar ao Início */}
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 font-medium"
            >
              ← Voltar ao Início
            </button>
          </div>

          {/* User Info and Actions */}
          <div className="flex items-center space-x-4">
            {/* Botão Conversor (para todo usuário logado - proteção via backend) */}
            <button
              onClick={() => router.push('/conversor')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Conversor
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors p-2 rounded-lg hover:bg-gray-50"
              >
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-purple-600" />
                </div>
                <span className="font-medium">{userInfo?.name || 'Usuário'}</span>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-medium text-gray-900">{userInfo?.name}</p>
                    <p className="text-sm text-gray-500">{userInfo?.email}</p>
                  </div>
                  
                  {/* Seção de assinatura removida conforme solicitado */}

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </nav>
  );
}
