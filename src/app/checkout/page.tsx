'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface PersonalData {
  cpf: string;
  phone: string;
  street: string;
  number: string;
  zipCode: string;
  city: string;
  state: string;
}

export default function Checkout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{name?: string; email?: string} | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [formData, setFormData] = useState<PersonalData>({
    cpf: '',
    phone: '',
    street: '',
    number: '',
    zipCode: '',
    city: '',
    state: '',
  });

  // Verificar autenticação
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    
    if (!storedToken) {
      router.push('/login');
      return;
    }
    
    // Decodificar token para obter dados do usuário
    try {
      const payload = JSON.parse(atob(storedToken.split('.')[1]));
      setUser(payload);
      setToken(storedToken);
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      router.push('/login');
    }
  }, [router]);

  // Máscara para CPF
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  // Máscara para telefone
  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  // Máscara para CEP
  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  };

  // Buscar endereço por CEP
  const fetchAddressByCEP = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            street: data.logradouro || '',
            city: data.localidade || '',
            state: data.uf || '',
          }));
          toast.success('Endereço preenchido automaticamente!');
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  // Manipular mudanças no formulário
  const handleInputChange = (field: keyof PersonalData, value: string) => {
    let formattedValue = value;

    if (field === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (field === 'phone') {
      formattedValue = formatPhone(value);
    } else if (field === 'zipCode') {
      formattedValue = formatCEP(value);
      if (formattedValue.replace(/\D/g, '').length === 8) {
        fetchAddressByCEP(formattedValue);
      }
    }

    setFormData(prev => ({
      ...prev,
      [field]: formattedValue,
    }));
  };

  // Validar formulário
  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.cpf || formData.cpf.replace(/\D/g, '').length !== 11) {
      errors.push('CPF deve ter 11 dígitos');
    }
    if (!formData.phone || formData.phone.replace(/\D/g, '').length < 10) {
      errors.push('Telefone deve ter pelo menos 10 dígitos');
    }
    if (!formData.street.trim()) {
      errors.push('Rua é obrigatória');
    }
    if (!formData.number.trim()) {
      errors.push('Número é obrigatório');
    }
    if (!formData.zipCode || formData.zipCode.replace(/\D/g, '').length !== 8) {
      errors.push('CEP deve ter 8 dígitos');
    }
    if (!formData.city.trim()) {
      errors.push('Cidade é obrigatória');
    }
    if (!formData.state.trim() || formData.state.length !== 2) {
      errors.push('Estado deve ter 2 caracteres (ex: SP)');
    }

    return errors;
  };

  // Finalizar checkout
  const handleCheckout = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setLoading(true);
    try {
      // 1. Salvar dados pessoais
      const personalDataResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile/personal-data`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          cpf: formData.cpf.replace(/\D/g, ''),
          phone: formData.phone.replace(/\D/g, ''),
          street: formData.street,
          number: formData.number,
          zipCode: formData.zipCode.replace(/\D/g, ''),
          city: formData.city,
          state: formData.state.toUpperCase(),
        }),
      });

      if (!personalDataResponse.ok) {
        throw new Error('Erro ao salvar dados pessoais');
      }

      toast.success('Dados pessoais salvos com sucesso!');

      // 2. Criar preferência de pagamento
      const paymentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-preference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId: 'basic',
          planPrice: 5.00, // Valor de teste
        }),
      });

      if (!paymentResponse.ok) {
        throw new Error('Erro ao criar preferência de pagamento');
      }

      const paymentData = await paymentResponse.json();

      // Redirecionar para o checkout do Asaas
      window.open(paymentData.checkoutUrl, '_blank');

    } catch (error) {
      console.error('Erro no checkout:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Finalizar Assinatura
          </h1>
          <p className="text-sm text-gray-600">
            Ao continuar, você será redirecionado para o Asaas para finalizar o pagamento.
          </p>
        </div>

        {/* Card do Plano */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Plano Básico</h3>
              <p className="text-gray-600">Conversão ilimitada de XLSX para CNAB240</p>
              <div className="flex items-center mt-2">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  ✨ Mais Popular
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">R$ 100,00</div>
              <div className="text-sm text-gray-500">por mês</div>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Dados Pessoais
          </h2>

          <div className="space-y-4">
            {/* CPF */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF *
              </label>
              <input
                type="text"
                value={formData.cpf}
                onChange={(e) => handleInputChange('cpf', e.target.value)}
                placeholder="000.000.000-00"
                maxLength={14}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone *
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
                maxLength={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* CEP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CEP * <span className="text-xs text-gray-500">(preenchimento automático)</span>
              </label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                placeholder="00000-000"
                maxLength={9}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Rua e Número */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rua *
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  placeholder="Nome da rua"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número *
                </label>
                <input
                  type="text"
                  value={formData.number}
                  onChange={(e) => handleInputChange('number', e.target.value)}
                  placeholder="123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Cidade e Estado */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Nome da cidade"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="SP"
                  maxLength={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
                />
              </div>
            </div>
          </div>

          {/* Botão de Checkout */}
          <div className="mt-8">
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processando...
                </div>
              ) : (
                'Finalizar Assinatura'
              )}
            </button>
          </div>

          {/* Informações de Segurança */}
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>🔒 Seus dados estão seguros e protegidos</p>
            <p>Pagamento processado pelo Asaas</p>
          </div>
        </div>

        {/* Voltar */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.back()}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
