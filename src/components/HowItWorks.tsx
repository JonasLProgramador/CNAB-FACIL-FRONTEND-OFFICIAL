export default function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Como Funciona
          </h2>
          <p className="text-xl text-gray-600">
            Simples como 1, 2, 3
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl font-bold text-purple-600">1</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Upload da Planilha</h3>
            <p className="text-gray-600">Faça upload do seu arquivo XLSX com os dados dos pagamentos</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl font-bold text-blue-600">2</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Validação Automática</h3>
            <p className="text-gray-600">O sistema valida automaticamente todos os dados conforme as regras CNAB</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl font-bold text-green-600">3</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Download do CNAB</h3>
            <p className="text-gray-600">Baixe seu arquivo .REM pronto para envio ao banco</p>
          </div>
        </div>
      </div>
    </section>
  );
}

