'use client';

import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Pricing() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handlePlanClick = (planName: string, available: boolean) => {
    if (!available) return;
    
    if (isLoggedIn) {
      // Se está logado, vai direto para o checkout
      router.push('/checkout');
    } else {
      // Se não está logado, vai para login
      router.push('/login');
    }
  };

  const plans = [
    {
      name: "Básico",
      price: "R$ 100",
      description: "Perfeito para começar",
      features: ["Conversões ilimitadas", "Suporte por email", "Validação automática", "Download direto CNAB240"],
      highlight: true,
      available: true
    },
    {
      name: "Profissional",
      price: "R$ 180",
      description: "Para uso avançado",
      features: ["Tudo do Básico", "Suporte prioritário", "Histórico de conversões", "API de integração", "Relatórios avançados"],
      highlight: false,
      available: false
    },
    {
      name: "Empresarial",
      price: "R$ 250",
      description: "Para grandes volumes",
      features: ["Tudo do Profissional", "Suporte dedicado", "Treinamento da equipe", "Integração personalizada", "SLA garantido"],
      highlight: false,
      available: false
    }
  ];

  return (
    <section id="precos" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Planos Transparentes
          </h2>
          <p className="text-xl text-gray-600">
            Escolha o plano ideal para seu negócio
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`bg-white rounded-xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 ${
                plan.highlight ? 'ring-2 ring-purple-500 transform scale-105' : ''
              }`}
            >
              {plan.highlight && (
                <div className="bg-purple-500 text-white text-sm font-semibold px-4 py-1 rounded-full inline-block mb-4">
                  Mais Popular
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-600 mb-4">{plan.description}</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                {plan.price !== "Grátis" && plan.price !== "Sob consulta" && (
                  <span className="text-gray-600">/mês</span>
                )}
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => handlePlanClick(plan.name, plan.available)}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                  plan.available
                    ? plan.highlight 
                      ? 'bg-purple-600 text-white hover:bg-purple-700 transform hover:scale-105' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!plan.available}
              >
                {plan.available ? (isLoggedIn ? "Assinar Agora" : "Começar Agora") : "Em Breve"}
              </button>
              
              {!plan.available && (
                <p className="text-center text-sm text-gray-500 mt-2">
                  Disponível em breve
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
