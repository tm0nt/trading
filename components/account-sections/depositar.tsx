"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { ChevronDown, AlertCircle, Check, ArrowLeft, Copy } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useCpfMask } from "@/hooks/use-cpf-mask";
import { useToast } from "@/components/ui/toast";
import LoadingScreen from "@/components/loading-screen";

interface PixQRCodeScreenProps {
  amount: string;
  pixCode: string;
  onBack: () => void;
}

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

function PixQRCodeScreen({ amount, onBack, pixCode }: PixQRCodeScreenProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="bg-[#121212] border border-[#2a2a2a] rounded-lg p-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-[#999] hover:text-white transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>Voltar</span>
        </button>
        <div className="text-sm text-[#999]">Depósito via PIX</div>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Escaneie o QR Code</h3>
        <p className="text-sm text-[#999] mb-4">
          Escaneie o QR Code abaixo com o aplicativo do seu banco ou copie o
          código PIX
        </p>
        <div className="text-[rgb(1,219,151)] text-xl font-bold mb-4">
          {amount}
        </div>
      </div>

      {/* QR Code */}
      <div className="flex justify-center mb-6">
        <div className="bg-white p-4 rounded-lg w-64 h-64 flex items-center justify-center">
          {/* INTEGRAÇÃO DB: Substituir por QR code real gerado pelo gateway de pagamento */}
          {/* Exemplo: <img src={`${paymentGatewayUrl}/qrcode/${transactionId}`} alt="QR Code PIX" /> */}
         <img src={`https://quickchart.io/qr?text=${pixCode}`} width="350" alt="QrCode Pix"/>
        </div>
      </div>

      {/* Código PIX */}
      <div className="mb-6">
        <label className="block text-sm text-[#999] mb-2">
          Código PIX Copia e Cola
        </label>
        <div className="relative">
          {/* INTEGRAÇÃO DB: Substituir por código PIX real gerado pelo gateway de pagamento */}
          {/* Exemplo: value={paymentData.pixCopyPasteCode} */}
          <input
            type="text"
            value={pixCode}
            readOnly
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md p-3 pr-10 text-white text-sm font-mono overflow-hidden text-ellipsis"
          />
        </div>
      </div>

      {/* Botão de copiar */}
      <button
        onClick={handleCopyCode}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-md transition-colors ${
          copied
            ? "bg-[rgba(1,219,151,0.2)] text-[rgb(1,219,151)] border border-[rgb(1,219,151)]"
            : "bg-[rgb(1,219,151)] hover:bg-[rgb(0,199,131)] text-white"
        }`}
      >
        {copied ? (
          <>
            <Check size={18} />
            <span>Código copiado!</span>
          </>
        ) : (
          <>
            <Copy size={18} />
            <span>Copiar código PIX</span>
          </>
        )}
      </button>

      <div className="mt-6 text-center text-xs text-[#999]">
        {/* INTEGRAÇÃO DB: Substituir por informações reais do gateway de pagamento */}
        <p>
          O pagamento será confirmado automaticamente em até 5 minutos após a
          transferência.
        </p>
        <p className="mt-2">Este QR Code é válido por 30 minutos.</p>
      </div>
    </div>
  );
}

export default function DepositarSection() {
  const [pixQrcode, setPixCode] = useState("");
  const [activeTab, setActiveTab] = useState("depositar");
  const [deposits, setDeposits] = useState<any[]>([]);
  const [depositValue, setDepositValue] = useState("");
  const [devedorNome, setDevedorNome] = useState("");
  const {
    maskedValue: cpfMasked,
    handleChange: handleCpfChange,
    isValid: isCpfValid,
  } = useCpfMask();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const toast = useToast();
  const [MIN_DEPOSIT_VALUE, setMIN_DEPOSIT_VALUE] = useState(60); // Valor inicial padrão

  // Estados para controlar o fluxo de telas
  const [isLoading, setIsLoading] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  // Adicionar um novo estado para controlar a validação do nome
  const [isNomeValid, setIsNomeValid] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/config/general");
        const data = await response.json();
        if (data.valorMinimoDeposito) {
          setMIN_DEPOSIT_VALUE(Number(data.valorMinimoDeposito));
        }
      } catch (error) {
        console.error("Erro ao buscar valor mínimo de depósito:", error);
        // Mantém o valor padrão caso ocorra erro
      }
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    const fetchDeposits = async () => {
      const response = await fetch("/api/account/deposit/history");
      const data = await response.json();
      setDeposits(data);
    };

    fetchDeposits();
  }, []);

  const formatCurrency = (value: string | number) => {
    // Converte para número
    const num =
      typeof value === "string"
        ? Number.parseFloat(value.replace(/[^\d,-]/g, "").replace(",", "."))
        : value;

    return num.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
  };

  // Função para lidar com a mudança no valor do depósito
  const handleDepositValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setDepositValue(value);
  };

  // Função para lidar com o clique nos botões de valor predefinido
  const handlePresetValueClick = (value: number) => {
    setDepositValue((value).toString());
  };

  // Renderizar o indicador de validação do CPF
  const renderCpfValidationIndicator = () => {
    if (!cpfMasked) return null;

    if (isCpfValid) {
      return (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[rgb(1,219,151)]">
          <Check size={16} />
        </div>
      );
    } else if (cpfMasked.length >= 14) {
      // CPF completo mas inválido
      return (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[rgb(204,2,77)]">
          <AlertCircle size={16} />
        </div>
      );
    }

    return null;
  };

  // Adicionar esta função após a função renderCpfValidationIndicator
  // Função para validar se o nome tem nome e sobrenome
  const validateNome = (nome: string) => {
    // Remove espaços extras e verifica se há pelo menos dois nomes
    const nameParts = nome.trim().split(/\s+/);
    return (
      nameParts.length >= 2 &&
      nameParts[0].length > 0 &&
      nameParts[1].length > 0
    );
  };

  // Função para renderizar o indicador de validação do nome
  const renderNomeValidationIndicator = () => {
    if (!devedorNome) return null;

    if (isNomeValid) {
      return (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[rgb(1,219,151)]">
          <Check size={16} />
        </div>
      );
    }

    return null;
  };

  const [statusFilter, setStatusFilter] = useState("Todos os status");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Filtragem baseada nos filtros
  // Filtragem baseada nos filtros
  const filteredDeposits = deposits.filter((dep) => {
    // Filtro por status
    if (
      statusFilter !== "Todos os status" &&
      dep.status.toLowerCase() !== statusFilter.toLowerCase()
    ) {
      return false;
    }

    // Filtro por data inicial
    if (startDate) {
      const depositDate = new Date(dep.dataCriacao);
      const filterStartDate = new Date(startDate);
      // Resetar horas para comparar apenas datas
      filterStartDate.setHours(0, 0, 0, 0);
      depositDate.setHours(0, 0, 0, 0);

      if (depositDate < filterStartDate) {
        return false;
      }
    }

    // Filtro por data final
    if (endDate) {
      const depositDate = new Date(dep.dataCriacao);
      const filterEndDate = new Date(endDate);
      // Resetar horas para comparar apenas datas
      filterEndDate.setHours(23, 59, 59, 999);
      depositDate.setHours(23, 59, 59, 999);

      if (depositDate > filterEndDate) {
        return false;
      }
    }

    return true;
  });

  // Modificar a função handleContinue para incluir a validação do nome completo
  const handleContinue = async () => {
    const numericValue = parseFloat(depositValue);

    if (numericValue < MIN_DEPOSIT_VALUE) {
      toast.open({
        variant: "error",
        title: "Valor mínimo não atingido",
        description: `O valor mínimo para depósito é de R$ ${MIN_DEPOSIT_VALUE},00`,
        duration: 5000,
      });
      return;
    }

    // INTEGRAÇÃO DB: Validar CPF com API de verificação real
    if (!isCpfValid) {
      toast.open({
        variant: "error",
        title: "CPF inválido",
        description: "Por favor, insira um CPF válido para continuar.",
        duration: 5000,
      });
      return;
    }

    // INTEGRAÇÃO DB: Validar nome com regras de negócio reais
    if (!devedorNome.trim()) {
      toast.open({
        variant: "error",
        title: "Nome não informado",
        description: "Por favor, insira o nome do devedor para continuar.",
        duration: 5000,
      });
      return;
    }

    // INTEGRAÇÃO DB: Validar se o nome tem nome e sobrenome com regras de negócio reais
    if (!isNomeValid) {
      toast.open({
        variant: "error",
        title: "Nome incompleto",
        description: "Por favor, insira nome e sobrenome do devedor.",
        duration: 5000,
      });
      return;
    }
    const depositData = {
      valor: numericValue, 
      cpf: cpfMasked.replace(/\D/g, ''), 
      nome: devedorNome,
    };

    try {
      setIsLoading(true);
      setShowQRCode(false);
      
      const response = await fetch('/api/account/deposit/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(depositData),
      });
  
      const responseData = await response.json();
  
      if (response.ok) {
        setPixCode(responseData.qrcode);
        // Agora setShowQRCode é chamado diretamente aqui, não pelo LoadingScreen
        setIsLoading(false);
        setShowQRCode(true);
      } else {
        setIsLoading(false);
        toast.open({
          variant: "error",
          title: "Erro ao processar o depósito",
          description: responseData.error || "Ocorreu um erro ao realizar o depósito.",
          duration: 5000,
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Erro ao realizar depósito:", error);
      toast.open({
        variant: "error",
        title: "Erro de conexão",
        description: "Não foi possível processar sua solicitação. Tente novamente mais tarde.",
        duration: 5000,
      });
    }
  };
  // Função para voltar ao formulário
  const handleBackToForm = () => {
    setShowQRCode(false);
  };

  // Renderizar o conteúdo apropriado com base no estado atual
  const renderDepositContent = () => {
    if (isLoading) {
      return <LoadingScreen     isLoading={isLoading}
      onComplete={() => setShowQRCode(true)}  />;
    }

    if (showQRCode) {
      return (
        <PixQRCodeScreen
          amount={formatCurrency(depositValue)}
          onBack={handleBackToForm}
          pixCode={pixQrcode}

        />
      );
    }

    return (
      <>
        <h3 className="text-lg font-semibold mb-6">Depositar via PIX</h3>

        <div className="bg-[#121212] border border-[#2a2a2a] rounded-lg p-4 mb-6">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-[rgba(1,219,151,0.1)] flex items-center justify-center mr-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z"
                  stroke="rgb(1,219,151)"
                  strokeWidth="2"
                />
                <path d="M3 10H21" stroke="rgb(1,219,151)" strokeWidth="2" />
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
          <div className="text-sm text-[#999]">
            Depósito instantâneo via Pix
          </div>
        </div>

        <div className="bg-[#121212] border border-[#2a2a2a] rounded-lg p-4 mb-6">
          <h4 className="font-medium mb-4">Valor do depósito</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              className="bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] rounded-md px-4 py-2 transition-colors"
              onClick={() => handlePresetValueClick(60)}
            >
              R$ 60
            </button>
            <button
              className="bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] rounded-md px-4 py-2 transition-colors"
              onClick={() => handlePresetValueClick(100)}
            >
              R$ 100
            </button>
            <button
              className="bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] rounded-md px-4 py-2 transition-colors"
              onClick={() => handlePresetValueClick(200)}
            >
              R$ 200
            </button>
            <button
              className="bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] rounded-md px-4 py-2 transition-colors"
              onClick={() => handlePresetValueClick(500)}
            >
              R$ 500
            </button>
          </div>
          <div className="mb-4">
            <input
              type="text"
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md p-2.5 text-white"
              placeholder="Digite o valor"
              value={depositValue ? formatCurrency(depositValue) : ""}
              onChange={handleDepositValueChange}
            />
            <div className="text-xs text-[#999] mt-1">
              Valor mínimo: R$ {MIN_DEPOSIT_VALUE},00
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-[#999] mb-1">
              CPF do devedor
            </label>
            <div className="relative">
              <input
                type="text"
                className={`w-full bg-[#1a1a1a] border ${
                  cpfMasked.length >= 14
                    ? isCpfValid
                      ? "border-[rgb(1,219,151)]"
                      : "border-[rgb(204,2,77)]"
                    : "border-[#2a2a2a]"
                } rounded-md p-2.5 text-white pr-10`}
                placeholder="Digite o CPF"
                value={cpfMasked}
                onChange={(e) => handleCpfChange(e.target.value)}
              />
              {renderCpfValidationIndicator()}
            </div>
          </div>

          {/* Modificar o trecho do input de nome do devedor no renderDepositContent */}
          {/* Substitua o bloco do input de nome do devedor por: */}
          <div className="mb-4">
            <label className="block text-sm text-[#999] mb-1">
              Nome do devedor
            </label>
            <div className="relative">
              <input
                type="text"
                className={`w-full bg-[#1a1a1a] border ${
                  devedorNome
                    ? isNomeValid
                      ? "border-[rgb(1,219,151)]"
                      : "border-[rgb(204,2,77)]"
                    : "border-[#2a2a2a]"
                } rounded-md p-2.5 text-white pr-10`}
                placeholder="Digite o nome completo"
                value={devedorNome}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setDevedorNome(newValue);
                  setIsNomeValid(validateNome(newValue));
                }}
              />
              {renderNomeValidationIndicator()}
            </div>
            {devedorNome && !isNomeValid && (
              <div className="text-xs text-[rgb(204,2,77)] mt-1">
                Informe nome e sobrenome
              </div>
            )}
          </div>
        </div>

        <button
          className="w-full bg-[rgb(1,219,151)] hover:bg-[rgb(0,199,131)] text-white py-3 rounded-md transition-colors"
          onClick={handleContinue}
        >
          Continuar
        </button>
      </>
    );
  };

  return (
    <div className="bg-[#1a1a1a] rounded-lg p-6">
      {/* Tabs para alternar entre depositar e histórico */}
      <div className="flex border-b border-[#2a2a2a] mb-6">
        <button
          className={`text-sm pb-2 px-4 ${
            activeTab === "depositar"
              ? "text-[rgb(1,219,151)] border-b-2 border-[rgb(1,219,151)]"
              : "text-[#999]"
          }`}
          onClick={() => {
            setActiveTab("depositar");
            setIsLoading(false);
            setShowQRCode(false);
          }}
        >
          Depositar
        </button>
        <button
          className={`text-sm pb-2 px-4 ${
            activeTab === "historico"
              ? "text-[rgb(1,219,151)] border-b-2 border-[rgb(1,219,151)]"
              : "text-[#999]"
          }`}
          onClick={() => {
            setActiveTab("historico");
            setIsLoading(false);
            setShowQRCode(false);
          }}
        >
          Histórico
        </button>
      </div>

      {activeTab === "depositar" ? (
        renderDepositContent()
      ) : (
        <>
          <h3 className="text-lg font-semibold mb-6">Histórico de Depósitos</h3>

          {/* Filtros para histórico */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <select
                className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md p-3 text-white appearance-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="Todos os status">Todos os status</option>
                <option value="concluido">Concluído</option>
                <option value="pendente">Pendente</option>
                <option value="cancelado">Cancelado</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#666]"
                size={16}
              />
            </div>

            <div>
              <input
                type="date"
                className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md p-3 text-white"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Data inicial"
              />
            </div>

            <div>
              <input
                type="date"
                className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md p-3 text-white"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Data final"
              />
            </div>
          </div>

          {/* Tabela de histórico de depósitos - Desktop */}
          {!isMobile && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse">
                <thead>
                  <tr className="text-left text-sm text-[#999] border-b border-[#2a2a2a]">
                    <th className="py-3 px-4 font-medium">ID Transação</th>
                    <th className="py-3 px-4 font-medium">Tipo</th>
                    <th className="py-3 px-4 font-medium">Valor</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium whitespace-nowrap">
                      Data de Criação
                    </th>
                    <th className="py-3 px-4 font-medium whitespace-nowrap">
                      Data de Pagamento
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeposits.map((dep, index) => (
                    <tr
                      key={index}
                      className="border-b border-[#2a2a2a] hover:bg-[#121212] transition-colors"
                    >
                      <td className="py-4 px-4 text-sm">{dep.id}</td>
                      <td className="py-4 px-4 text-sm capitalize">
                        {dep.tipo}
                      </td>
                      <td className="py-4 px-4 text-sm">
                        {formatCurrency(dep.valor)}
                      </td>
                      <td className="py-4 px-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs capitalize ${
                            dep.status === "concluido"
                              ? "bg-[rgba(1,219,151,0.1)] text-[rgb(1,219,151)]"
                              : dep.status === "pendente"
                                ? "bg-[rgba(255,170,0,0.1)] text-[rgb(255,170,0)]"
                                : "bg-[rgba(204,2,77,0.1)] text-[rgb(204,2,77)]"
                          }`}
                        >
                          {dep.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm whitespace-nowrap">
                        {formatarDataExtenso(dep.dataCriacao)}
                      </td>
                      <td className="py-4 px-4 text-sm whitespace-nowrap">
                        {dep.dataPagamento}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Versão mobile - Lista de depósitos */}
          {isMobile && (
            <div className="space-y-4">
              {filteredDeposits.map((dep, index) => (
                <div key={index} className="bg-[#121212] rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-sm font-medium">
                      {formatCurrency(dep.valor)}
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs capitalize ${
                        dep.status === "concluido"
                          ? "bg-[rgba(1,219,151,0.1)] text-[rgb(1,219,151)]"
                          : dep.status === "pendente"
                            ? "bg-[rgba(255,170,0,0.1)] text-[rgb(255,170,0)]"
                            : "bg-[rgba(204,2,77,0.1)] text-[rgb(204,2,77)]"
                      }`}
                    >
                      {dep.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-[#999]">ID Transação</div>
                    <div className="text-right">{dep.id}</div>
                    <div className="text-[#999]">Tipo</div>
                    <div className="text-right capitalize">{dep.tipo}</div>
                    <div className="text-[#999]">Data de Criação</div>
                    <div className="text-right">
                      {formatarDataExtenso(dep.dataCriacao)}
                    </div>
                    <div className="text-[#999]">Data de Pagamento</div>
                    <div className="text-right">{dep.dataPagamento}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
