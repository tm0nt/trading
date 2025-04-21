"use client";

import { useState, useEffect } from "react";
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
import { useMediaQuery } from "@/hooks/use-media-query";

type Operacao = {
  id: string;
  data: string;
  ativo: string;
  tempo: string;
  previsao: string;
  vela: string;
  pAbrt: string;
  pFech: string;
  valor: string;
  estornado: string;
  executado: string;
  status: string;
  resultado: string;
};

export default function HistoricoSection() {
  const [operacoes, setOperacoes] = useState<Operacao[]>([]);
  const [allOperacoes, setAllOperacoes] = useState<Operacao[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("DEMO");
  const [selectedPrevisao, setSelectedPrevisao] =
    useState("Todas as previsões");
  const [selectedAtivo, setSelectedAtivo] = useState("Todos os ativos");
  const [selectedStatus, setSelectedStatus] = useState("Todos os status");
  const today = new Date().toLocaleDateString("pt-BR");

  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);

  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    async function fetchOperacoes() {
      try {
        const res = await fetch("/api/account/operations");
        const data = await res.json();
        if (res.ok) {
          setOperacoes(data.operations);
          setAllOperacoes(data.operations);
        }
      } catch (error) {
        console.error("Erro ao buscar operações:", error);
      }
    }
    fetchOperacoes();
  }, []);

  // Funções de cor
  const getStatusColor = (status: string) => {
    if (status === "Ganho") return "text-[rgb(1,219,151)]";
    if (status === "Perda") return "text-[rgb(204,2,77)]";
    return "text-white";
  };

  const getResultadoColor = (resultado: string) => {
    if (resultado.startsWith("+")) return "text-[rgb(1,219,151)]";
    if (resultado.startsWith("-")) return "text-[rgb(204,2,77)]";
    return "text-white";
  };

  const getPrevisaoColor = (previsao: string) => {
    if (previsao === "Compra") return "text-[rgb(1,219,151)]";
    if (previsao === "Venda") return "text-[rgb(204,2,77)]";
    return "text-white";
  };

  // Filtrar operações
  useEffect(() => {
    const resultado = allOperacoes.filter((op) => {
      const dataOp = op.data;
      const fromDate = dateFrom;
      const toDate = dateTo;

      const dentroDoPeriodo =
        (!fromDate || dataOp >= fromDate) && (!toDate || dataOp <= toDate);
      const contaOK =
        selectedAccount === "DEMO" || selectedAccount === "REAL" ? true : false;
      const previsaoOK =
        selectedPrevisao === "Todas as previsões" ||
        op.previsao === selectedPrevisao;
      const ativoOK =
        selectedAtivo === "Todos os ativos" || op.ativo === selectedAtivo;
      const statusOK =
        selectedStatus === "Todos os status" || op.status === selectedStatus;

      return dentroDoPeriodo && contaOK && previsaoOK && ativoOK && statusOK;
    });

    setOperacoes(resultado);
  }, [
    selectedAccount,
    selectedPrevisao,
    selectedAtivo,
    selectedStatus,
    dateFrom,
    dateTo,
    allOperacoes,
  ]);

  // Estatísticas
  const totalOperacoes = operacoes.length;
  const ganhos = operacoes.filter((op) => op.status === "Ganho").length;
  const assertividade = totalOperacoes
    ? Math.round((ganhos / totalOperacoes) * 100)
    : 0;

  const receita = operacoes.reduce((total, op) => {
    const valor = Number.parseFloat(
      op.resultado.replace("$", "").replace("+", ""),
    );
    return total + valor;
  }, 0);

  // Exportar CSV
  const exportarCSV = () => {
    const headers = [
      "ID",
      "Data",
      "Ativo",
      "Tempo",
      "Previsão",
      "Vela",
      "P.ABRT",
      "P.FECH",
      "Valor",
      "Estornado",
      "Executado",
      "Status",
      "Resultado",
    ];
    const csvRows = [
      headers.join(","), // cabeçalho
      ...operacoes.map((op) =>
        [
          op.id,
          op.data,
          op.ativo,
          op.tempo,
          op.previsao,
          op.vela,
          op.pAbrt,
          op.pFech,
          op.valor,
          op.estornado,
          op.executado,
          op.status,
          op.resultado,
        ].join(","),
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "historico_operacoes.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#0a0a0a] rounded-lg">
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">Histórico de operações</h3>
        <p className="text-sm text-[#999] mb-6">
          Total de operações: {totalOperacoes}
        </p>

        {/* Filtros - Layout responsivo */}
        {isMobile ? (
          <div className="space-y-4 mb-6">
            <div className="relative">
              <select
                className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md p-3 text-white appearance-none"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
              >
                <option>DEMO</option>
                <option>REAL</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#666]"
                size={16}
              />
            </div>

            <div className="relative">
              <select
                className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md p-3 text-white appearance-none"
                value={selectedPrevisao}
                onChange={(e) => setSelectedPrevisao(e.target.value)}
              >
                <option>Todas as previsões</option>
                <option>Compra</option>
                <option>Venda</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#666]"
                size={16}
              />
            </div>

            <div className="relative">
              <select
                className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md p-3 text-white appearance-none"
                value={selectedAtivo}
                onChange={(e) => setSelectedAtivo(e.target.value)}
              >
                <option>Todos os ativos</option>
                <option>XRPUSDT</option>
                <option>IDXUSDT</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#666]"
                size={16}
              />
            </div>

            <div className="relative">
              <select
                className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md p-3 text-white appearance-none"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option>Todos os status</option>
                <option>Ganho</option>
                <option>Perda</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#666]"
                size={16}
              />
            </div>

            <div className="space-y-2">
              <div className="text-xs text-[#999]">De</div>
              <input
                type="text"
                className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md p-3 text-white"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="text-xs text-[#999]">Até</div>
              <input
                type="text"
                className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md p-3 text-white"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="relative">
              <select
                className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md p-3 text-white appearance-none"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
              >
                <option>DEMO</option>
                <option>REAL</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#666]"
                size={16}
              />
            </div>

            <div className="relative">
              <select
                className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md p-3 text-white appearance-none"
                value={selectedPrevisao}
                onChange={(e) => setSelectedPrevisao(e.target.value)}
              >
                <option>Todas as previsões</option>
                <option>Compra</option>
                <option>Venda</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#666]"
                size={16}
              />
            </div>

            <div className="relative">
              <select
                className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md p-3 text-white appearance-none"
                value={selectedAtivo}
                onChange={(e) => setSelectedAtivo(e.target.value)}
              >
                <option>Todos os ativos</option>
                <option>XRPUSDT</option>
                <option>IDXUSDT</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#666]"
                size={16}
              />
            </div>

            <div className="relative">
              <select
                className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md p-3 text-white appearance-none"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option>Todos os status</option>
                <option>Ganho</option>
                <option>Perda</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#666]"
                size={16}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-[#999] mb-1">De</div>
                <input
                  type="text"
                  className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md p-3 text-white"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <div className="text-xs text-[#999] mb-1">Até</div>
                <input
                  type="text"
                  className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md p-3 text-white"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-[#121212] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-[#999]">Depósitos</div>
              <ArrowDown className="text-[rgb(1,219,151)]" size={16} />
            </div>
            <div className="text-xl font-bold">$0.00</div>
          </div>

          <div className="bg-[#121212] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-[#999]">Saques</div>
              <ArrowUp className="text-[rgb(1,219,151)]" size={16} />
            </div>
            <div className="text-xl font-bold">$0.00</div>
          </div>

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
            <div className="text-xl font-bold">{assertividade}%</div>
          </div>

          <div className="bg-[#121212] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-[#999]">Receita</div>
              <DollarSign className="text-[rgb(1,219,151)]" size={16} />
            </div>
            <div
              className={`text-xl font-bold ${receita >= 0 ? "text-[rgb(1,219,151)]" : "text-[rgb(204,2,77)]"}`}
            >
              {receita >= 0 ? "" : "-"}${Math.abs(receita).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button className="flex items-center bg-[#121212] hover:bg-[#1a1a1a] border border-[#2a2a2a] rounded-md px-4 py-2 text-sm transition-colors">
            <Columns size={16} className="mr-2" />
            <span>Colunas</span>
          </button>
          <button className="flex items-center bg-[#121212] hover:bg-[#1a1a1a] border border-[#2a2a2a] rounded-md px-4 py-2 text-sm transition-colors">
            <Filter size={16} className="mr-2" />
            <span>Filtros</span>
          </button>
          <button
            onClick={exportarCSV}
            className="flex items-center bg-[#121212] hover:bg-[#1a1a1a] border border-[#2a2a2a] rounded-md px-4 py-2 text-sm transition-colors"
          >
            <Download size={16} className="mr-2" />
            <span>Exportar</span>
          </button>
        </div>
        {/* Tabela de operações - Visível apenas em desktop */}
        {!isMobile && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse">
              <thead>
                <tr className="text-left text-sm text-[#999] border-b border-[#2a2a2a]">
                  <th className="py-3 px-4 font-medium">ID</th>
                  <th className="py-3 px-4 font-medium whitespace-nowrap">
                    Data
                  </th>
                  <th className="py-3 px-4 font-medium">Ativo</th>
                  <th className="py-3 px-4 font-medium">Tempo</th>
                  <th className="py-3 px-4 font-medium">Previsão</th>
                  <th className="py-3 px-4 font-medium">Vela</th>
                  <th className="py-3 px-4 font-medium">P. ABRT</th>
                  <th className="py-3 px-4 font-medium">P. FECH</th>
                  <th className="py-3 px-4 font-medium">Valor</th>
                  <th className="py-3 px-4 font-medium">Estornado</th>
                  <th className="py-3 px-4 font-medium">Executado</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {operacoes.map((op, index) => (
                  <tr
                    key={index}
                    className="border-b border-[#2a2a2a] hover:bg-[#121212] transition-colors"
                  >
                    <td className="py-4 px-4 text-sm">{op.id}</td>
                    <td className="py-4 px-4 text-sm whitespace-nowrap">
                      {op.data}
                    </td>
                    <td className="py-4 px-4 text-sm">{op.ativo}</td>
                    <td className="py-4 px-4 text-sm">{op.tempo}</td>
                    <td
                      className={`py-4 px-4 text-sm ${getPrevisaoColor(op.previsao)}`}
                    >
                      {op.previsao}
                    </td>
                    <td className="py-4 px-4 text-sm">{op.vela}</td>
                    <td className="py-4 px-4 text-sm">{op.pAbrt}</td>
                    <td className="py-4 px-4 text-sm">{op.pFech}</td>
                    <td className="py-4 px-4 text-sm">{op.valor}</td>
                    <td className="py-4 px-4 text-sm">{op.estornado}</td>
                    <td className="py-4 px-4 text-sm">{op.executado}</td>
                    <td
                      className={`py-4 px-4 text-sm ${getStatusColor(op.status)}`}
                    >
                      {op.status}
                    </td>
                    <td
                      className={`py-4 px-4 text-sm font-medium ${getResultadoColor(op.resultado)}`}
                    >
                      {op.resultado}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Versão mobile - Lista de operações */}
        {isMobile && (
          <div className="space-y-4">
            {operacoes.map((op, index) => (
              <div key={index} className="bg-[#121212] rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs text-[#999]">{op.data}</div>
                  <div
                    className={`text-sm font-medium ${getResultadoColor(op.resultado)}`}
                  >
                    {op.resultado}
                  </div>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm">
                    {op.ativo} - {op.tempo}
                  </div>
                  <div className={`text-sm ${getStatusColor(op.status)}`}>
                    {op.status}
                  </div>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs text-[#999]">Previsão</div>
                  <div className={`text-sm ${getPrevisaoColor(op.previsao)}`}>
                    {op.previsao}
                  </div>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs text-[#999]">Valor</div>
                  <div className="text-sm">{op.valor}</div>
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
