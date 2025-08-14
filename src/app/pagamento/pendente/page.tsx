'use client';

import { Clock, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function PagamentoPendente() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Pagamento Pendente
          </h1>
          <p className="text-gray-600">
            Seu pagamento está sendo processado. Isso pode levar alguns minutos.
          </p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Verificar Status
          </button>
          
          <Link 
            href="/"
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Voltar ao Início
          </Link>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-700">
            <strong>Aguarde a confirmação</strong><br />
            Você receberá um email quando o pagamento for processado.
          </p>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          O processamento pode levar até 24 horas em alguns casos.
        </div>
      </div>
    </div>
  );
}
