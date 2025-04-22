"use client";

import { useState, useEffect } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  ChevronDown,
  ArrowDown,
  ArrowUp,
  BarChart2,
  Target,
  DollarSign,
  Filter,
  Columns,
  Download,
} from "lucide-react";

type Operacao = {
  id: string;
  data: string;
  ativo: string;
  tempo: string;
  previsao: string;
  vela: string;
  abertura: string;
  tipo: string;
  fechamento: string;
  valor: string;
  receita: string;
  estornado: string;
  executado: string;
  status: string;
  resultado: string;
};

export default function HistoricoSection() {
  const [operacoes, setOperacoes] = useState<Operacao[]>([]);
  const [allOperacoes, setAllOperacoes] = useState<Operacao[]>([]);
  const [selectedTipo, setSelectedTipo] = useState("Todas as operações");
  const [selectedPrevisao, setSelectedPrevisao] = useState("Todas as previsões");
  const [selectedAtivo, setSelectedAtivo] = useState("Todos os ativos");
  const [selectedStatus, setSelectedStatus] = useState("Todos os status");
  const [totalReceita, setTotalReceita] = useState<number>(0);
  const [dateFrom, setDateFrom] = useState("");
  const [assertividade, setAssertividade] = useState<number>(0); // Estado para a assertividade
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [dateTo, setDateTo] = useState("");
  const receitaColor = totalReceita >= 0 ? "text-[rgb(1,219,151)]" : "text-[rgb(204,2,77)]";

  const [ativos, setAtivos] = useState<string[]>([]);

  function formatDate(date: string | Date): string {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Intl.DateTimeFormat('pt-BR', options).format(new Date(date));
  }
  
  // Função para formatar um número como moeda BRL
  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }
  // Carregar dados da API
  useEffect(() => {
    async function fetchOperacoes() {
      try {
        const res = await fetch("/api/account/operations");
        const data = await res.json();

        if (res.ok) {
          console.log("Dados recebidos:", data);

          setOperacoes(data.operations);
          setAllOperacoes(data.operations);

          // Extrair ativos únicos para o filtro
          const ativosUnicos = Array.from(
            new Set(data.operations.map((op: Operacao) => op.ativo))
          ) as string[];

          setAtivos(ativosUnicos);
          const receitaCalculada = data.operations.reduce((total: number, op: Operacao) => {
            const valor = Number(op.valor); // Convertendo o valor para número
            if (op.resultado === "ganho") {
              return total + valor; // Adiciona a receita nos ganhos
            } else if (op.resultado === "perda") {
              return total - valor; // Subtrai a receita nas perdas
            }
            return total;
          }, 0);

          setTotalReceita(receitaCalculada);

          const totalOperacoes = data.operations.length;
          const operacoesGanhas = data.operations.filter((op: Operacao) => op.resultado === "Ganho").length;
          const assertividadeCalculada = totalOperacoes ? (operacoesGanhas / totalOperacoes) * 100 : 0;

          setAssertividade(assertividadeCalculada); // Atualiza o valor da assertividade
        }
      } catch (error) {
        console.error("Erro ao buscar operações:", error);
      }
    }

    fetchOperacoes();
  }, []);

  const getPrevisaoColor = (previsao: string) => {
    if (previsao === "call") return "text-[rgb(1,219,151)]";
    if (previsao === "put") return "text-[rgb(204,2,77)]";
    return "text-white";
  };

  // Função para filtrar as operações
  const filtrarOperacoes = () => {
    const resultado = allOperacoes.filter((op) => {
      const dataOp = new Date(op.data); // Converte a data para Date
      const fromDate = dateFrom ? new Date(dateFrom) : new Date(0); // Caso `dateFrom` seja nulo ou vazio, atribui a data mínima (01/01/1970)
      const toDate = dateTo ? new Date(dateTo) : new Date(); // Caso `dateTo` seja nulo ou vazio, usa a data atual

      // Verifica se a operação está dentro do intervalo de datas
      const dentroDoPeriodo =
        (dataOp >= fromDate) && (dataOp <= toDate);

      // Filtros
      const tipoOK = selectedTipo === "Todas as operações" || op.tipo === selectedTipo;
      const previsaoOK = selectedPrevisao === "Todas as previsões" || op.previsao === selectedPrevisao;
      const ativoOK = selectedAtivo === "Todos os ativos" || op.ativo === selectedAtivo;
      const statusOK = selectedStatus === "Todos os status" || op.status === selectedStatus;

      return dentroDoPeriodo && tipoOK && previsaoOK && ativoOK && statusOK;
    });

    setOperacoes(resultado);
  };


  // Sempre que um filtro mudar, chamamos a função de filtro
  useEffect(() => {
    filtrarOperacoes();
  }, [selectedTipo, selectedPrevisao, selectedAtivo, selectedStatus, dateFrom, dateTo, allOperacoes]);

  const totalOperacoes = operacoes.length;

  const getResultadoColor = (resultado: string) => {
    if (resultado.startsWith("ganho")) return "text-[rgb(1,219,151)]";
    if (resultado.startsWith("perda")) return "text-[rgb(204,2,77)]";
    return "text-white";
  };

  // Exportar CSV
  const exportarCSV = () => {
    // Todos os headers possíveis com base no tipo Operacao
    const headers = [
      "ID",
      "Data",
      "Ativo",
      "Tempo",
      "Previsão",
      "Vela",
      "Abertura",
      "Tipo",
      "Fechamento",
      "Valor",
      "Receita",
      "Estornado",
      "Executado",
      "Status",
      "Resultado",
    ];
  
    // Gerando um nome aleatório para o arquivo CSV
    const randomNumber = Math.floor(Math.random() * 1000000); // Gera um número aleatório
    const filename = `history_operations_${randomNumber}.csv`; // Nome do arquivo com o número aleatório
  
    const csvRows = [
      headers.join(","),
      ...operacoes.map((op) =>
        [
          op.id,
          op.data,
          op.ativo,
          op.tempo,
          op.previsao,
          op.vela,
          op.abertura,
          op.tipo,
          op.fechamento,
          op.valor,
          op.receita,
          op.estornado,
          op.executado,
          op.status,
          op.resultado,
        ].join(",")
      ),
    ];
  
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename; // Usando o nome aleatório gerado
    a.click();
    window.URL.revokeObjectURL(url);
  };
  

  return (
    <div className="bg-[#0a0a0a] rounded-lg">
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-4">Histórico de Operações</h3>
        <p className="text-sm text-[#999] mb-6">
          Total de operações: {totalOperacoes}
        </p>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="relative">
            <select
              className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md p-3 text-white appearance-none"
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
            >
              <option value="Todas as operações">Todas as operações</option>
              <option value="demo">DEMO</option>
              <option value="real">REAL</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#666]" size={16} />
          </div>

          <div className="relative">
            <select
              className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md p-3 text-white appearance-none"
              value={selectedPrevisao}
              onChange={(e) => setSelectedPrevisao(e.target.value)}
            >
              <option value="Todas as previsões">Todas as previsões</option>
              <option value="call">Compra</option>
              <option value="put">Venda</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#666]" size={16} />
          </div>

          <div className="relative">
            <select
              className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md p-3 text-white appearance-none"
              value={selectedAtivo}
              onChange={(e) => setSelectedAtivo(e.target.value)}
            >
              <option value="Todos os ativos">Todos os ativos</option>
              {ativos.map((ativo, index) => (
                <option key={index} value={ativo}>
                  {ativo}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#666]" size={16} />
          </div>

          <div className="relative">
            <select
              className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md p-3 text-white appearance-none"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="Todos os status">Todos os status</option>
              <option value="ganho">Ganho</option>
              <option value="perda">Perda</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#666]" size={16} />
          </div>

          <div className="relative">
            <input
              type="date"
              className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md p-3 text-white"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="De"
            />
          </div>

          <div className="relative">
            <input
              type="date"
              className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md p-3 text-white"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="Até"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#121212] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-[#999]">Operações</div>
              <BarChart2 className="text-[rgb(1,219,151)]" size={16} />
            </div>
            <div className="text-xl font-bold">{totalOperacoes}</div>
          </div>

          <div className="bg-[#121212] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-[#999]">Assertividade</div>
              <Target className="text-[rgb(1,219,151)]" size={16} />
            </div>
            <div className="text-xl font-bold">{assertividade.toFixed(2)}%</div>
          </div>

          <div className="bg-[#121212] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-[#999]">Receita</div>
            <DollarSign className="text-[rgb(1,219,151)]" size={16} />
          </div>
          <div
            className={`text-xl font-bold ${receitaColor}`}
          >
            {formatCurrency(totalReceita)} {/* Exibe a receita formatada */}
          </div>
        </div>
        </div>
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={exportarCSV}
            className="flex items-center bg-[#121212] hover:bg-[#1a1a1a] border border-[#2a2a2a] rounded-md px-4 py-2 text-sm transition-colors"
          >
            <Download size={16} className="mr-2" />
            <span>Exportar</span>
          </button>
        </div>

        {/* Tabela */}
        {!isMobile && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse">
            <thead>
              <tr className="text-left bg-[#121212] text-[#999]">
                <th className="py-3 px-4 font-medium">ID</th>
                <th className="py-3 px-4 font-medium">Data</th>
                <th className="py-3 px-4 font-medium">Ativo</th>
                <th className="py-3 px-4 font-medium">Tipo</th>
                <th className="py-3 px-4 font-medium">P. ABRT</th>
                <th className="py-3 px-4 font-medium">P. FECH</th>
                <th className="py-3 px-4 font-medium">Receita</th>
                <th className="py-3 px-4 font-medium">Valor</th>
                <th className="py-3 px-4 font-medium">Previsão</th>
                <th className="py-3 px-4 font-medium">Resultado</th>
              </tr>
            </thead>
            <tbody>
              {operacoes.map((op) => (
                <tr key={op.id} className="border-b border-[#2a2a2a] hover:bg-[#121212]">
                  <td className="py-4 px-4 text-sm">{op.id}</td>
                  <td className="py-4 px-4 text-sm whitespace-nowrap">{formatDate(op.data)}</td>
                  <td className="py-4 px-4 text-sm uppercase">{op.ativo}</td>
                  <td className="py-4 px-4 text-sm uppercase">{op.tipo}</td>
                  <td className="py-4 px-4 text-sm">{op.abertura}</td>
                  <td className="py-4 px-4 text-sm">{op.fechamento}</td>
                  <td className="py-4 px-4 text-sm">{formatCurrency(Number(op.receita))}</td>
                  <td className="py-4 px-4 text-sm">{formatCurrency(Number(op.valor))}</td>
                  <td
                    className={`uppercase py-4 px-4 text-sm ${getPrevisaoColor(op.previsao)}`}
                  >
                    {op.previsao}
                  </td>                <td
                    className={`uppercase py-4 px-4 text-sm font-medium ${getResultadoColor(op.resultado)}`}
                  >
                    {op.resultado}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {isMobile && (
          <div className="space-y-4">
            {operacoes.map((op, index) => (
              <div key={index} className="bg-[#121212] rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs text-[#999]">{formatDate(op.data)}</div>
                  <div
                    className={`text-sm  uppercase font-medium ${getResultadoColor(op.resultado)}`}
                  >
                    {op.resultado}
                  </div>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm">
                    {op.ativo} - {op.tempo}
                  </div>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs text-[#999] ">Previsão</div>
                  <div className={`uppercase text-sm ${getPrevisaoColor(op.previsao)}`}>
                    {op.previsao}
                  </div>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs text-[#999] ">Receita</div>
                  <div className="text-sm">{formatCurrency(Number(op.receita))}</div>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs text-[#999]">Valor</div>
                  <div className="text-sm">{formatCurrency(Number(op.valor))}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-[#999]">ID</div>
                  <div className="text-xs text-[#666]">{op.id}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
