"use client";
import React, { useState, useCallback, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Sparkles, Wand2, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface ConversaoResponse {
  success: boolean;
  filename: string;
  downloadUrl: string;
  totalRegistros: number;
  message?: string;
}

interface ErrorResponse {
  message: string;
  statusCode?: number;
}

export default function ConversorPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<ConversaoResponse | null>(null);
  const [showMagicAnimation, setShowMagicAnimation] = useState<boolean>(false);
  const [, setConversionComplete] = useState<boolean>(false);
  const [dadosEmpresa, setDadosEmpresa] = useState({
    cnpj: '',
    nome: '',
    conta: '',
    digitoConta: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    cep: '',
    uf: ''
  });
  const [codigoFinalidade, setCodigoFinalidade] = useState<string>('20');

  // Estado para controlar o loading da verificação
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  // Verificar autenticação e assinatura ativa no lado do cliente
  useEffect(() => {
    const checkAuthAndSubscription = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        setCheckingSubscription(true);
        
        // PRIMEIRO, VAMOS OBTER O userId DO TOKEN
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const userId = tokenPayload.sub;
        
        console.log('UserId extraído do token:', userId);
        
        // Verificar se usuário tem assinatura ativa
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/subscription/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('🌐 Status da resposta:', response.status);
        console.log('🌐 Headers da resposta:', response.headers);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Erro HTTP:', response.status, errorText);
          throw new Error(`Erro ao verificar assinatura: ${response.status} - ${errorText}`);
        }

        // NOVA LÓGICA: usar response.json() diretamente
        const data = await response.json();
        console.log('📊 DADOS COMPLETOS DA RESPOSTA:', data);
        
        // EXTRAIR OS DADOS DE subscriptionDetails DA NOVA ESTRUTURA
        const subscriptionData = data.subscriptionDetails || {};
        console.log('📊 subscriptionDetails extraídos:', subscriptionData);
        
        // 🔒 PROTEÇÃO CRÍTICA: Verificar se tem assinatura ativa
        if (!subscriptionData.hasSubscription || subscriptionData.status !== 'active') {
          console.log('❌ ACESSO NEGADO - REDIRECIONANDO PARA PLANOS:', {
            hasSubscription: subscriptionData.hasSubscription,
            status: subscriptionData.status,
            motivo: !subscriptionData.hasSubscription ? 'Sem assinatura' : `Status não é active (atual: ${subscriptionData.status})`
          });
          
          // Aguardar um pouco para mostrar a mensagem de redirecionamento
          setTimeout(() => {
            router.push('/planos');
          }, 2000);
          return;
        }

        console.log('✅ Assinatura ativa verificada - acesso liberado ao conversor');
        setCheckingSubscription(false);
        setMounted(true);
      } catch (error) {
        console.error('Erro ao verificar assinatura:', error);
        // Aguardar um pouco para mostrar a mensagem de erro
        setTimeout(() => {
          router.push('/planos');
        }, 2000);
      }
    };

    checkAuthAndSubscription();
  }, [router]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.includes('spreadsheet') || droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls')) {
        setFile(droppedFile);
        setError('');
      } else {
        setError('Por favor, selecione apenas arquivos Excel (.xlsx ou .xls)');
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Por favor, selecione um arquivo Excel');
      return;
    }

    // Validar campos obrigatórios
    const requiredFields = {
      cnpj: 'CNPJ',
      nome: 'Nome da empresa',
      conta: 'Conta',
      digitoConta: 'Dígito da conta',
      endereco: 'Endereço',
      numero: 'Número',
      bairro: 'Bairro',
      cidade: 'Cidade',
      cep: 'CEP',
      uf: 'UF'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!dadosEmpresa[field as keyof typeof dadosEmpresa]) {
        setError(`Campo obrigatório: ${label}`);
        return;
      }
    }

    setLoading(true);
    setError('');
    setSuccess(null);
    setConversionComplete(false);
    
    // ✨ Iniciar animação mágica após 1 segundo de processamento
    setTimeout(() => {
      if (loading) {
        setShowMagicAnimation(true);
      }
    }, 1000);

    const formData = new FormData();
    
    // 🔑 OBTER TOKEN ANTES DE CRIAR O FORMDATA
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }
    
    formData.append('planilha', file);
    formData.append('cnpj', dadosEmpresa.cnpj);
    formData.append('nome', dadosEmpresa.nome);
    formData.append('conta', dadosEmpresa.conta);
    formData.append('digitoConta', dadosEmpresa.digitoConta);
    formData.append('endereco', dadosEmpresa.endereco);
    formData.append('numero', dadosEmpresa.numero);
    formData.append('complemento', dadosEmpresa.complemento);
    formData.append('bairro', dadosEmpresa.bairro);
    formData.append('cidade', dadosEmpresa.cidade);
    formData.append('cep', dadosEmpresa.cep);
    formData.append('uf', dadosEmpresa.uf);
    formData.append('codigoFinalidade', codigoFinalidade);
    
    // 🔑 ADICIONAR TOKEN JWT NO FORMDATA (OBRIGATÓRIO PARA O BACKEND)
    formData.append('jwtToken', token);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/conversor/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        // Para erros, o backend pode retornar JSON
        try {
          const errorData: ErrorResponse = await response.json();
          throw new Error(errorData.message || 'Erro ao processar arquivo');
        } catch {
          throw new Error(`Erro ao processar arquivo: ${response.status}`);
        }
      }

      // 📁 O BACKEND RETORNA ARQUIVO DIRETAMENTE (NÃO JSON!)
      // Vamos processar como download de arquivo
      const blob = await response.blob();
      
      // Obter nome do arquivo do header Content-Disposition ou usar padrão CI240_001
      const contentDisposition = response.headers.get('Content-Disposition');
      const timestamp = Date.now().toString();
      const numeroSequencialArquivo7Digitos = timestamp.slice(-7).padStart(7, '0');
      let filename = `CI240_001_${numeroSequencialArquivo7Digitos}.REM`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      // 🎉 Conversão concluída com sucesso!
      setShowMagicAnimation(false);
      setSuccess({ 
        success: true,
        message: 'Arquivo convertido com sucesso!',
        downloadUrl: URL.createObjectURL(blob),
        filename: filename,
        totalRegistros: 0
      });
      setConversionComplete(true);
      
      // 🚀 Download automático imediato
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpar URL do blob após download
      setTimeout(() => {
        URL.revokeObjectURL(link.href);
      }, 1000);
      
    } catch (err) {
      console.error('Erro na conversão:', err);
      setShowMagicAnimation(false);
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao processar arquivo');
    } finally {
      setLoading(false);
    }
  };



  // Não renderizar até estar montado (evita hidratação)
  // Tela de loading para verificação de assinatura
  if (checkingSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md mx-4">
          <div className="mb-6">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Verificando Assinatura
            </h2>
            <p className="text-gray-600">
              Aguarde enquanto verificamos seu plano ativo...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Tela de redirecionamento quando não tem assinatura
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md mx-4">
          <div className="mb-6">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Assinatura Necessária
            </h2>
            <p className="text-gray-600 mb-4">
              É necessário ter uma assinatura ativa para usar o conversor.
            </p>
            <p className="text-sm text-gray-500">
              Redirecionando para a página de planos...
            </p>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
        <div className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-700 mb-4">
            Conversor XLSX → CNAB 240
          </h1>
          <p className="text-xl text-gray-600">
            Transforme suas planilhas em arquivos de remessa bancária PIX
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Drag and Drop Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-purple-500 bg-purple-50' 
                  : file 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 hover:border-purple-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {file ? (
                <div className="flex items-center justify-center space-x-3">
                  <FileText className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-lg font-medium text-green-700">{file.name}</p>
                    <p className="text-sm text-green-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Arraste seu arquivo Excel aqui
                  </p>
                  <p className="text-gray-500">
                    ou clique para selecionar (.xlsx, .xls)
                  </p>
                </div>
              )}
            </div>

            {/* Link para planilha exemplo */}
            <div className="text-center py-4">
              <a 
                href="/planilha-exemplo-cnab.xlsx" 
                download="planilha-exemplo-cnab.xlsx"
                className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 font-medium"
              >
                <FileText className="w-4 h-4 mr-2" />
                📥 Baixar Planilha de Exemplo
              </a>
              <p className="text-sm text-gray-500 mt-2">
                Use esta planilha como modelo para seus dados
              </p>
            </div>

            {/* Dados da Empresa */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <h3 className="col-span-full text-xl font-semibold text-gray-800 mb-4">
                Dados da Empresa (Pagador)
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CNPJ da Empresa *
                </label>
                <input
                  type="text"
                  required
                  value={dadosEmpresa.cnpj}
                  onChange={(e) => setDadosEmpresa({...dadosEmpresa, cnpj: e.target.value})}
                  placeholder="00.000.000/0000-00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Empresa *
                </label>
                <input
                  type="text"
                  required
                  value={dadosEmpresa.nome}
                  onChange={(e) => setDadosEmpresa({...dadosEmpresa, nome: e.target.value})}
                  placeholder="NOME DA SUA EMPRESA"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número da Conta *
                </label>
                <input
                  type="text"
                  required
                  value={dadosEmpresa.conta}
                  onChange={(e) => setDadosEmpresa({...dadosEmpresa, conta: e.target.value})}
                  placeholder="000000000000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dígito da Conta *
                </label>
                <input
                  type="text"
                  required
                  maxLength={1}
                  value={dadosEmpresa.digitoConta}
                  onChange={(e) => setDadosEmpresa({...dadosEmpresa, digitoConta: e.target.value})}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço
                </label>
                <input
                  type="text"
                  value={dadosEmpresa.endereco}
                  onChange={(e) => setDadosEmpresa({...dadosEmpresa, endereco: e.target.value})}
                  placeholder="Rua, Avenida..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número
                </label>
                <input
                  type="text"
                  value={dadosEmpresa.numero}
                  onChange={(e) => setDadosEmpresa({...dadosEmpresa, numero: e.target.value})}
                  placeholder="123"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complemento
                </label>
                <input
                  type="text"
                  value={dadosEmpresa.complemento}
                  onChange={(e) => setDadosEmpresa({...dadosEmpresa, complemento: e.target.value})}
                  placeholder="Apto 101, Sala 202..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bairro
                </label>
                <input
                  type="text"
                  value={dadosEmpresa.bairro}
                  onChange={(e) => setDadosEmpresa({...dadosEmpresa, bairro: e.target.value})}
                  placeholder="Centro, Vila Madalena..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade
                </label>
                <input
                  type="text"
                  value={dadosEmpresa.cidade}
                  onChange={(e) => setDadosEmpresa({...dadosEmpresa, cidade: e.target.value})}
                  placeholder="São Paulo"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CEP
                </label>
                <input
                  type="text"
                  value={dadosEmpresa.cep}
                  onChange={(e) => setDadosEmpresa({...dadosEmpresa, cep: e.target.value})}
                  placeholder="00000-000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado (UF)
                </label>
                <select
                  value={dadosEmpresa.uf}
                  onChange={(e) => setDadosEmpresa({...dadosEmpresa, uf: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Selecione o Estado</option>
                  <option value="SP">São Paulo</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="PR">Paraná</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="GO">Goiás</option>
                  <option value="MT">Mato Grosso</option>
                  <option value="MS">Mato Grosso do Sul</option>
                  <option value="BA">Bahia</option>
                  <option value="SE">Sergipe</option>
                  <option value="PE">Pernambuco</option>
                  <option value="AL">Alagoas</option>
                  <option value="PB">Paraíba</option>
                  <option value="RN">Rio Grande do Norte</option>
                  <option value="CE">Ceará</option>
                  <option value="PI">Piauí</option>
                  <option value="MA">Maranhão</option>
                  <option value="TO">Tocantins</option>
                  <option value="PA">Pará</option>
                  <option value="AP">Amapá</option>
                  <option value="AM">Amazonas</option>
                  <option value="RR">Roraima</option>
                  <option value="AC">Acre</option>
                  <option value="RO">Rondônia</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="ES">Espírito Santo</option>
                </select>
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Finalidade PIX *
                </label>
                <select
                  value={codigoFinalidade}
                  onChange={(e) => setCodigoFinalidade(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="20">20 - Transferência PIX (Padrão)</option>
                  <option value="01">01 - Crédito em Conta Corrente</option>
                  <option value="02">02 - Pagamento de Fornecedor</option>
                  <option value="03">03 - Pagamento de Salário</option>
                  <option value="05">05 - Pagamento de Honorários</option>
                  <option value="10">10 - Pagamento de Tributos</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Código 20 é o padrão para transferências PIX entre empresas
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !file}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  <span>Converter para CNAB 240</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Magic Animation Overlay */}
        {showMagicAnimation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center max-w-md mx-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500 opacity-20 animate-pulse"></div>
              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  <Wand2 className="w-16 h-16 text-purple-600 animate-bounce" />
                </div>
                <div className="flex justify-center space-x-2 mb-4">
                  <Sparkles className="w-6 h-6 text-yellow-500 animate-ping" />
                  <Sparkles className="w-8 h-8 text-pink-500 animate-pulse" />
                  <Sparkles className="w-6 h-6 text-blue-500 animate-ping" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">✨ Magia Acontecendo ✨</h3>
                <p className="text-gray-600">Transformando seus dados em CNAB 240...</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message with Magic */}
        {success && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <div className="flex space-x-1">
                <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                <Sparkles className="w-3 h-3 text-pink-500 animate-ping" />
                <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-green-800 mb-2">
                  🎉 Conversão Mágica Concluída!
                </h3>
                <p className="text-green-700 text-lg mb-2">
                  {success.totalRegistros} registros transformados com sucesso
                </p>
                <p className="text-green-600">
                  📥 Download iniciará automaticamente em instantes...
                </p>
              </div>
            </div>
            <div className="mt-4 bg-green-100 rounded-lg p-3">
              <p className="text-sm text-green-700 text-center">
                ✨ Arquivo: <strong>{success.filename}</strong> ✨
              </p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 mt-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold text-blue-800 mb-4 flex items-center">
            <Wand2 className="w-6 h-6 mr-2" />
            Como usar a magia do conversor:
          </h3>
          <ul className="text-blue-700 space-y-3 text-lg">
            <li className="flex items-center">
              <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">1</span>
              Prepare sua planilha Excel com os dados dos pagamentos PIX
            </li>
            <li className="flex items-center">
              <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">2</span>
              Preencha os dados da sua empresa (pagador)
            </li>
            <li className="flex items-center">
              <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">3</span>
              Faça upload do arquivo Excel (.xlsx ou .xls)
            </li>
            <li className="flex items-center">
              <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">4</span>
              Clique em &quot;Converter&quot; e veja a magia acontecer ✨
            </li>
            <li className="flex items-center">
              <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">5</span>
              O download do arquivo CNAB 240 iniciará automaticamente!
            </li>
          </ul>
          
          {/* Botão Voltar ao Início */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 flex items-center space-x-2 mx-auto shadow-lg"
            >
              <Home className="w-5 h-5" />
              <span>Voltar ao Início</span>
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
