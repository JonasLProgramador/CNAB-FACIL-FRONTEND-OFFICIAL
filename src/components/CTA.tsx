import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold mb-6">
          Pronto para Simplificar seus Pagamentos?
        </h2>
        <p className="text-xl mb-8 text-purple-100">
          Junte-se a centenas de empresas que já automatizaram seus processos com o CNAB Fácil
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login" className="bg-green-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-600 transition-all transform hover:scale-105 flex items-center justify-center">
            Começar Gratuitamente
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
          <a href="#contato" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-purple-600 transition-all">
            Fale com um Especialista
          </a>
        </div>
      </div>
    </section>
  );
}
