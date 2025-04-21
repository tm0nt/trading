export default function SuporteSection() {
  return (
    <div className="bg-[#1a1a1a] rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-6">Suporte</h3>

      <div className="bg-[#121212] border border-[#2a2a2a] rounded-lg p-4 mb-6">
        <h4 className="font-medium mb-4">Abrir um ticket de suporte</h4>

        <div className="mb-4">
          <label className="block text-sm text-[#999] mb-1">Assunto</label>
          <select className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md p-2.5 text-white appearance-none">
            <option>Selecione um assunto</option>
            <option>Depósito</option>
            <option>Saque</option>
            <option>Conta</option>
            <option>Trading</option>
            <option>Outro</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-[#999] mb-1">Mensagem</label>
          <textarea
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md p-2.5 text-white min-h-[120px]"
            placeholder="Descreva seu problema ou dúvida em detalhes"
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-[#999] mb-1">
            Anexar arquivo (opcional)
          </label>
          <div className="border border-dashed border-[#2a2a2a] rounded-md p-4 text-center">
            <div className="text-sm text-[#999] mb-2">
              Arraste e solte arquivos aqui ou clique para selecionar
            </div>
            <button className="text-[rgb(1,219,151)] text-sm">
              Selecionar arquivo
            </button>
          </div>
        </div>

        <button className="w-full bg-[rgb(1,219,151)] hover:bg-[rgb(0,199,131)] text-white py-2 rounded-md transition-colors">
          Enviar ticket
        </button>
      </div>

      <div className="bg-[#121212] border border-[#2a2a2a] rounded-lg p-4">
        <h4 className="font-medium mb-4">Perguntas frequentes</h4>

        <div className="border-b border-[#2a2a2a] pb-4 mb-4">
          <div className="font-medium mb-2">Como faço um depósito?</div>
          <div className="text-sm text-[#999]">
            Para fazer um depósito, acesse a seção "Depositar" em sua conta e
            siga as instruções para o método de pagamento escolhido.
          </div>
        </div>

        <div className="border-b border-[#2a2a2a] pb-4 mb-4">
          <div className="font-medium mb-2">
            Quanto tempo leva para processar um saque?
          </div>
          <div className="text-sm text-[#999]">
            Os saques via Pix são processados instantaneamente. Outros métodos
            podem levar de 1 a 3 dias úteis.
          </div>
        </div>

        <div>
          <div className="font-medium mb-2">
            Como altero minhas informações pessoais?
          </div>
          <div className="text-sm text-[#999]">
            Você pode atualizar suas informações pessoais na seção "Visão geral"
            da sua conta.
          </div>
        </div>
      </div>
    </div>
  );
}
