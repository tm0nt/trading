"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useAccountStore } from "@/store/account-store";
import { useToast } from "@/components/ui/toast";

export default function SacarSection() {
  const toast = useToast();
  const [pixKeyType, setPixKeyType] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [MIN_WITHDRAW_VALUE, setMIN_WITHDRAW_VALUE] = useState(100);
  const [withdrawValue, setWithdrawValue] = useState("");
  const [loadingWithdraw, setLoadingWithdraw] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState<{ id: string } | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState("sacar");
  const [withdraw, setWithdraw] = useState<any[]>([]);
  const { realBalance } = useAccountStore();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [statusFilter, setStatusFilter] = useState("Todos os status");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  function formatarDataExtenso(dataISO: string): string {
    const data = new Date(dataISO);

    // Verifica se a data é válida
    if (isNaN(data.getTime())) {
      return "Data inválida";
    }

    const dia = data.getDate();
    const meses = [
      "janeiro",
      "fevereiro",
      "março",
      "abril",
      "maio",
      "junho",
      "julho",
      "agosto",
      "setembro",
      "outubro",
      "novembro",
      "dezembro",
    ];
    const mes = meses[data.getMonth()];
    const ano = data.getFullYear();

    return `${dia} de ${mes} de ${ano}`;
  }

  // Filter withdrawals based on filters
  const filteredWithdraw = withdraw.filter((saque) => {
    // Status filter
    if (
      statusFilter !== "Todos os status" &&
      saque.status !== statusFilter.toLowerCase()
    ) {
      return false;
    }

    // Start date filter
    if (startDate) {
      const saqueDate = new Date(saque.dataPedido);
      const filterStartDate = new Date(startDate);
      filterStartDate.setHours(0, 0, 0, 0);

      if (saqueDate < filterStartDate) {
        return false;
      }
    }

    // End date filter
    if (endDate) {
      const saqueDate = new Date(saque.dataPedido);
      const filterEndDate = new Date(endDate);
      filterEndDate.setHours(23, 59, 59, 999);

      if (saqueDate > filterEndDate) {
        return false;
      }
    }

    return true;
  });

  // Fetch minimum withdraw value
  useEffect(() => {
    const fetchMinWithdrawValue = async () => {
      try {
        const response = await fetch("/api/config/general");
        if (!response.ok) throw new Error("Failed to fetch config");

        const config = await response.json();
        if (config.valorMinimoSaque) {
          setMIN_WITHDRAW_VALUE(Number(config.valorMinimoSaque));
        }
      } catch (error) {
        console.error("Error fetching minimum withdraw value:", error);
      }
    };

    fetchMinWithdrawValue();
  }, []);

  // Fetch withdrawal history
  useEffect(() => {
    const fetchWithdrawHistory = async () => {
      try {
        const response = await fetch("/api/account/withdraw/history");
        const data = await response.json();
        setWithdraw(data);
      } catch (error) {
        console.error("Error fetching withdraw history:", error);
      }
    };

    fetchWithdrawHistory();
  }, []);

  // Format currency
  const formatCurrency = (value: any) => {
    if (value === null || value === undefined) return "R$ 0,00";
    const numericValue =
      typeof value === "string"
        ? Number(value.replace(/\D/g, "")) / 100
        : Number(value);
    return numericValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Handle withdraw submission
  const handleWithdraw = async () => {
    const numericValue = Number(withdrawValue.replace(/\D/g, "")) / 100;

    if (numericValue < MIN_WITHDRAW_VALUE) {
      toast.open({
        variant: "error",
        title: `Valor mínimo não atingido`,
        description: `O valor mínimo para saque é ${formatCurrency(MIN_WITHDRAW_VALUE)}`,
        duration: 5000,
      });
      return;
    }

    if (numericValue > realBalance) {
      toast.open({
        variant: "error",
        title: "Saldo insuficiente",
        description: `Seu saldo disponível é ${formatCurrency(realBalance)}`,
        duration: 5000,
      });
      return;
    }

    if (!pixKeyType) {
      toast.open({
        variant: "error",
        title: "Tipo de chave não selecionado",
        description: "Selecione o tipo da chave PIX",
        duration: 5000,
      });
      return;
    }

    if (!pixKey) {
      toast.open({
        variant: "error",
        title: "Chave PIX não informada",
        description: "Digite sua chave PIX",
        duration: 5000,
      });
      return;
    }

    setLoadingWithdraw(true);

    try {
      const response = await fetch("/api/account/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valor: numericValue,
          tipoChave: pixKeyType,
          chave: pixKey,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const result = await response.json();

      setWithdrawSuccess({ id: result.id });
      setWithdrawValue("");
      setPixKey("");
      setPixKeyType("");

      // Refresh withdrawal history
      const historyResponse = await fetch("/api/account/withdraw/history");
      setWithdraw(await historyResponse.json());

      toast.open({
        variant: "success",
        title: "Saque solicitado com sucesso!",
        description: `ID da transação: ${result.id}`,
        duration: 5000,
      });
    } catch (error) {
      toast.open({
        variant: "error",
        title: "Erro ao processar saque",
        description:
          error instanceof Error ? error.message : "Tente novamente mais tarde",
        duration: 5000,
      });
    } finally {
      setLoadingWithdraw(false);
    }
  };

  // Render mobile withdrawal item
  const renderMobileWithdrawal = (saque: any) => (
    <div key={saque.id} className="bg-[#121212] rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm font-medium">{formatCurrency(saque.valor)}</div>
        <span
          className={`px-2 py-1 rounded-full text-xs capitalize ${
            saque.status === "concluido"
              ? "bg-[rgba(1,219,151,0.1)] text-[rgb(1,219,151)]"
              : saque.status === "pendente"
                ? "bg-[rgba(255,170,0,0.1)] text-[rgb(255,170,0)]"
                : "bg-[rgba(204,2,77,0.1)] text-[rgb(204,2,77)]"
          }`}
        >
          {saque.status}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="text-[#999]">ID</div>
        <div className="text-right">{saque.id.slice(0, 8)}...</div>
        <div className="text-[#999]">Data Pedido</div>
        <div className="text-right">
          {formatarDataExtenso(saque.dataPedido)}
        </div>
        <div className="text-[#999]">Data Pagamento</div>
        <div className="text-right">
          {saque.dataPagamento ? formatarDataExtenso(saque.dataPagamento) : "-"}
        </div>
        <div className="text-[#999]">Tipo PIX</div>
        <div className="text-right capitalize">{saque.tipoChave}</div>
        <div className="text-[#999]">Chave PIX</div>
        <div className="text-right">{saque.chave}</div>
        <div className="text-[#999]">Taxa</div>
        <div className="text-right">{formatCurrency(saque.taxa)}</div>
      </div>
    </div>
  );

  // Render desktop withdrawal row
  const renderDesktopWithdrawal = (saque: any) => (
    <tr key={saque.id} className="border-b border-[#2a2a2a] hover:bg-[#121212]">
      <td className="py-4 px-4 text-sm">{saque.id.slice(0, 8)}...</td>
      <td className="py-4 px-4 text-sm">
        {formatarDataExtenso(saque.dataPedido)}
      </td>
      <td className="py-4 px-4 text-sm">
        {saque.dataPagamento ? formatarDataExtenso(saque.dataPagamento) : "-"}
      </td>
      <td className="py-4 px-4 text-sm capitalize">{saque.tipoChave}</td>
      <td className="py-4 px-4 text-sm">{saque.chave}</td>
      <td className="py-4 px-4 text-sm">
        <span
          className={`px-2 py-1 rounded-full text-xs capitalize ${
            saque.status === "concluido"
              ? "bg-[rgba(1,219,151,0.1)] text-[rgb(1,219,151)]"
              : saque.status === "pendente"
                ? "bg-[rgba(255,170,0,0.1)] text-[rgb(255,170,0)]"
                : "bg-[rgba(204,2,77,0.1)] text-[rgb(204,2,77)]"
          }`}
        >
          {saque.status}
        </span>
      </td>
      <td className="py-4 px-4 text-sm">{formatCurrency(saque.valor)}</td>
      <td className="py-4 px-4 text-sm">{formatCurrency(saque.taxa)}</td>
    </tr>
  );

  return (
    <div className="bg-[#1a1a1a] rounded-lg p-6">
      {/* Tabs */}
      <div className="flex border-b border-[#2a2a2a] mb-6">
        <button
          className={`pb-2 px-4 ${activeTab === "sacar" ? "text-[rgb(1,219,151)] border-b-2 border-[rgb(1,219,151)]" : "text-[#999]"}`}
          onClick={() => setActiveTab("sacar")}
        >
          Sacar
        </button>
        <button
          className={`pb-2 px-4 ${activeTab === "historico" ? "text-[rgb(1,219,151)] border-b-2 border-[rgb(1,219,151)]" : "text-[#999]"}`}
          onClick={() => setActiveTab("historico")}
        >
          Histórico
        </button>
      </div>

      {activeTab === "sacar" ? (
        <>
          <h3 className="text-lg font-semibold mb-6">Sacar</h3>

          {/* Available Balance */}
          <div className="bg-[#121212] border border-[#2a2a2a] rounded-lg p-4 mb-6">
            <div className="flex justify-between mb-4">
              <h4 className="font-medium">Saldo disponível</h4>
              <div className="font-bold">{formatCurrency(realBalance)}</div>
            </div>
            <p className="text-sm text-[#999] mb-4">
              Você precisa ter saldo disponível para realizar um saque.
            </p>
          </div>

          {/* Withdraw Method */}
          <div className="bg-[#121212] border border-[#2a2a2a] rounded-lg p-4 mb-6">
            <h4 className="font-medium mb-4">Método de saque</h4>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 cursor-pointer hover:border-[rgb(1,219,151)]">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 rounded-full bg-[rgba(1,219,151,0.1)] flex items-center justify-center mr-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z"
                      stroke="rgb(1,219,151)"
                      strokeWidth="2"
                    />
                    <path
                      d="M3 10H21"
                      stroke="rgb(1,219,151)"
                      strokeWidth="2"
                    />
                    <path
                      d="M7 15H7.01"
                      stroke="rgb(1,219,151)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M11 15H13"
                      stroke="rgb(1,219,151)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="font-medium">Pix</div>
              </div>
              <p className="text-sm text-[#999]">Saque instantâneo via Pix</p>
            </div>
          </div>

          {/* Withdraw Form */}
          <div className="bg-[#121212] border border-[#2a2a2a] rounded-lg p-4 mb-6">
            <h4 className="font-medium mb-4">Valor do saque</h4>
            <input
              type="text"
              value={withdrawValue}
              onChange={(e) => setWithdrawValue(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md p-3 mb-4"
              placeholder="Digite o valor"
            />
            <p className="text-xs text-[#999] mb-6">
              Mínimo: {formatCurrency(MIN_WITHDRAW_VALUE)}
            </p>

            <h4 className="font-medium mb-4">Tipo da chave Pix</h4>
            <select
              value={pixKeyType}
              onChange={(e) => setPixKeyType(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md p-3 mb-6"
            >
              <option value="">Selecione o tipo</option>
              <option value="email">E-mail</option>
              <option value="cpf">CPF</option>
              <option value="telefone">Telefone</option>
              <option value="aleatoria">Chave aleatória</option>
            </select>

            <h4 className="font-medium mb-4">Chave Pix</h4>
            <input
              type="text"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md p-3"
              placeholder="Digite sua chave Pix"
            />
          </div>

          {/* Submit Button */}
          <button
            className="w-full bg-[rgb(1,219,151)] hover:bg-[rgb(0,199,131)] text-white py-3 rounded-md disabled:opacity-50"
            disabled={loadingWithdraw}
            onClick={handleWithdraw}
          >
            {loadingWithdraw ? "Processando..." : "Solicitar Saque"}
          </button>
        </>
      ) : (
        <>
          <h3 className="text-lg font-semibold mb-6">Histórico de Saques</h3>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md p-3"
              >
                <option value="Todos os status">Todos os status</option>
                <option value="concluido">Concluído</option>
                <option value="pendente">Pendente</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            <div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md p-3"
                placeholder="Data inicial"
              />
            </div>

            <div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md p-3"
                placeholder="Data final"
              />
            </div>
          </div>

          {/* Desktop Table */}
          {!isMobile && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left text-sm text-[#999] border-b border-[#2a2a2a]">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Data Pedido</th>
                    <th className="py-3 px-4">Data Pagamento</th>
                    <th className="py-3 px-4">Tipo PIX</th>
                    <th className="py-3 px-4">Chave PIX</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Valor</th>
                    <th className="py-3 px-4">Taxa</th>
                  </tr>
                </thead>
                <tbody>{filteredWithdraw.map(renderDesktopWithdrawal)}</tbody>
              </table>
            </div>
          )}

          {/* Mobile List */}
          {isMobile && (
            <div className="space-y-4">
              {filteredWithdraw.map(renderMobileWithdrawal)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
