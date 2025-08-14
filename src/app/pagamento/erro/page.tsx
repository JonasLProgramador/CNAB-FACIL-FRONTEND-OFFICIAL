'use client';

import { XCircle, ArrowLeft, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function PagamentoErro() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Pagamento Não Aprovado
          </h1>
          <p className="text-gray-600">
            Houve um problema com seu pagamento. Verifique os dados do cartão e tente novamente.
          </p>
        </div>

        <div className="space-y-4">
          <Link 
            href="/planos"
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Tentar Novamente
          </Link>
          
          <Link 
            href="/"
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar ao Início
          </Link>
        </div>

        <div className="mt-6 p-4 bg-red-50 rounded-lg">
          <p className="text-sm text-red-700">
            <strong>Possíveis causas:</strong><br />
            • Dados do cartão incorretos<br />
            • Limite insuficiente<br />
            • Cartão bloqueado
          </p>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Precisa de ajuda? Entre em contato conosco.
        </div>
      </div>
    </div>
  );
}
