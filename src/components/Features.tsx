'use client';

import { useState } from 'react';
import { Zap, Shield, CheckCircle } from 'lucide-react';

export default function Features() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Conversão em Segundos",
      description: "Transforme suas planilhas XLSX em arquivos CNAB 240 em questão de segundos. Economia de até 80% no tempo de processamento."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Segurança Total",
      description: "Processamento local dos dados sensíveis. Seus arquivos nunca são armazenados em nossos servidores."
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Conformidade Garantida",
      description: "Totalmente alinhado com as especificações de todos os bancos brasileiros. Validação automática de dados."
    }
  ];

  return (
    <section id="recursos" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Por que escolher o CNAB Fácil?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Desenvolvido especificamente para o mercado brasileiro, com foco total na simplicidade e segurança
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`bg-white rounded-xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer ${
                activeFeature === index ? 'ring-2 ring-purple-500' : ''
              }`}
              onMouseEnter={() => setActiveFeature(index)}
            >
              <div className="text-purple-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}