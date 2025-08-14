'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Plan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  features: string[];
  popular?: boolean;
  available: boolean;
  description: string;
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Plano Básico',
    price: 100,
    description: 'Perfeito para começar com conversões CNAB',
    features: [
      'Conversão ilimitada de arquivos XLSX para CNAB240',
      'Suporte para PIX Banco Inter',
      'Download automático dos arquivos',
      'Suporte por email',
      'Interface moderna e intuitiva'
    ],
    popular: true,
    available: true
  },
  {
    id: 'professional',
    name: 'Plano Profissional',
    price: 180,
    originalPrice: 200,
    description: 'Para empresas que precisam de mais recursos',
    features: [
      'Tudo do Plano Básico',
      'Suporte para múltiplos bancos',
      'API para integração',
      'Relatórios avançados',
      'Suporte prioritário',
      'Backup automático'
    ],
    available: false
  },
  {
    id: 'enterprise',
    name: 'Plano Empresarial',
    price: 250,
    originalPrice: 300,
    description: 'Solução completa para grandes empresas',
    features: [
      'Tudo do Plano Profissional',
      'Processamento em lote',
      'Integração com ERP',
      'Suporte 24/7',
      'Gerente de conta dedicado',
      'Customizações personalizadas'
    ],
    available: false
  }
];

export default function PlanosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{name?: string; email?: string} | null>(null);

  useEffect(() => {
    // Verificar se usuário está logado
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Decodificar token para obter dados do usuário
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser(payload);
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      router.push('/login');
    }
  }, [router]);

  const handleSelectPlan = async (planId: string) => {
    if (planId !== 'basic') {
      return; // Apenas plano básico disponível
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Criar cobrança no Asaas
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-preference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planId: 'basic',
          planPrice: 100.00
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar preferência de pagamento');
      }

      const paymentData = await response.json();
      
      // Redirecionar para o checkout do Asaas
      window.open(paymentData.checkoutUrl, '_blank');
      
      // Mostrar mensagem de sucesso
      alert('Redirecionando para o checkout do Asaas. Complete o pagamento para ativar sua assinatura!');
      
    } catch (error) {
      console.error('Erro ao processar pagamento Asaas:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSubscribe = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Redirecionar para página de checkout intuitiva
      router.push('/checkout');
      
    } catch (error) {
      console.error('Erro ao redirecionar:', error);
      alert('Erro ao redirecionar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };



  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">CF</span>
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">CNAB Fácil</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Olá, {user.name}</span>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  router.push('/');
                }}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha o Plano Ideal para Você
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Converta seus arquivos XLSX para CNAB240 de forma rápida e segura. 
            Escolha o plano que melhor se adapta às suas necessidades.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 ${
                plan.popular ? 'ring-4 ring-purple-500 ring-opacity-50' : ''
              } ${!plan.available ? 'opacity-75' : ''}`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center py-2 text-sm font-semibold">
                  MAIS POPULAR
                </div>
              )}
              
              {!plan.available && (
                <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                  Em Breve
                </div>
              )}

              <div className={`p-8 ${plan.popular ? 'pt-16' : 'pt-8'}`}>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">R$ {plan.price}</span>
                    <span className="text-gray-500 ml-2">/mês</span>
                  </div>
                  {plan.originalPrice && (
                    <div className="flex items-center mt-2">
                      <span className="text-lg text-gray-400 line-through">R$ {plan.originalPrice}</span>
                      <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                        ECONOMIZE R$ {plan.originalPrice - plan.price}
                      </span>
                    </div>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => {
                    if (plan.available && plan.id === 'basic') {
                      router.push('/checkout');
                    }
                  }}
                  disabled={!plan.available || loading}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 mb-3 ${
                    plan.available
                      ? plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border-2 border-gray-200 hover:border-gray-300'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {!plan.available
                    ? 'Em Breve'
                    : loading && plan.id === 'basic'
                    ? 'Processando...'
                    : 'Escolher Plano'
                  }
                </button>

              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Perguntas Frequentes
          </h2>
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Como funciona a conversão CNAB240?
              </h3>
              <p className="text-gray-600">
                Nossa plataforma converte automaticamente seus arquivos Excel (XLSX) para o formato CNAB240, 
                seguindo as especificações do Banco Inter para pagamentos PIX.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Posso cancelar minha assinatura a qualquer momento?
              </h3>
              <p className="text-gray-600">
                Sim, você pode cancelar sua assinatura a qualquer momento. O acesso permanecerá ativo até o final do período pago.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Os dados são seguros?
              </h3>
              <p className="text-gray-600">
                Sim, utilizamos criptografia de ponta a ponta e não armazenamos seus arquivos após o processamento. 
                Sua privacidade e segurança são nossas prioridades.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Pronto para Começar?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Junte-se a centenas de empresas que já confiam no CNAB Fácil
            </p>
            <button
              onClick={() => handleSelectPlan('basic')}
              disabled={loading}
              className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors duration-300 shadow-lg hover:shadow-xl"
            >
              {loading ? 'Processando...' : 'Começar Agora'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
