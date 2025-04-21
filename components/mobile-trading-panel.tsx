"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { TrendingUp, TrendingDown, Minus, Plus } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import {
  useAccountStore,
  type Operation,
  type OperationResult,
} from "@/store/account-store";
import ActiveOperationCard from "./active-operation-card";
import HistoryItem from "./history-item";
import Link from "next/link";
import { fetchCurrentPrice } from "@/lib/api";
import {
  subscribeToPriceUpdates,
  unsubscribeFromPriceUpdates,
} from "@/lib/websocket";

// Definindo as novas cores
const GREEN_COLOR = "rgb(8, 134, 90)";
const RED_COLOR = "rgb(204, 2, 77)";
const DEFAULT_GREEN = "rgb(1, 219, 151)";

// Atualizar os intervalos de tempo disponíveis
const timeIntervals = [1, 5, 10, 15, 30, 1440]; // 1440 minutos = 1 dia

// Atualizar a interface do componente MobileTradingPanel para receber o par de trading
interface MobileTradingPanelProps {
  tradingPair: string;
}

export default function MobileTradingPanel({
  tradingPair,
}: MobileTradingPanelProps) {
  const [activeTab, setActiveTab] = useState("operacoes");
  const [timeValue, setTimeValue] = useState(1); // Default: 1 minute
  const [monetaryValue, setMonetaryValue] = useState(1); // Default: R$ 1
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [inputValue, setInputValue] = useState("1");
  const [buyPercentage, setBuyPercentage] = useState(54);
  const [sellPercentage, setSellPercentage] = useState(46);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [isProcessingOperation, setIsProcessingOperation] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const toast = useToast();

  const {
    deductBalance,
    addOperation,
    removeOperation,
    activeOperations,
    addOperationResult,
    operationHistory,
    addBalance,
    updateCurrentPrice,
    currentPrices,
  } = useAccountStore();

  const valueInputRef = useRef<HTMLInputElement>(null);

  // Calculate revenue (90% of the entered value)
  const calculateRevenue = () => {
    return monetaryValue * 0.9;
  };

  // Format currency to Brazilian Real
  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Atualizar a função formatTimeDisplay para mostrar "1d" para o intervalo de 1 dia
  const formatTimeDisplay = (seconds: number) => {
    if (seconds <= 0) return "00:00";

    // Se o tempo restante for maior que 24 horas, mostrar em formato de horas
    if (seconds > 86400) {
      // 86400 segundos = 24 horas
      const hours = Math.floor(seconds / 3600);
      return `${hours}h`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  // Modificar a função calculateSecondsUntilNextInterval para trabalhar com "números fechados"
  const calculateSecondsUntilNextInterval = (intervalMinutes: number) => {
    const now = new Date();

    if (intervalMinutes === 1440) {
      // Lógica para 1 dia (1440 minutos)
      const tomorrow = new Date(now);
      tomorrow.setHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Segundos até a meia-noite
      return Math.floor((tomorrow.getTime() - now.getTime()) / 1000);
    }

    // Para intervalos em minutos (1m, 5m, 10m, 15m, 30m)
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();

    // Calcular o próximo horário "fechado" baseado no intervalo
    const currentMinuteOfDay = minutes % intervalMinutes;
    const nextIntervalMinutes = intervalMinutes - currentMinuteOfDay;

    // Se estamos exatamente no início de um intervalo e não há segundos/milissegundos,
    // então o próximo intervalo é um intervalo completo à frente
    const isExactlyAtInterval =
      currentMinuteOfDay === 0 && seconds === 0 && milliseconds === 0;

    // Calcular segundos até o próximo intervalo
    let secondsUntilNext =
      nextIntervalMinutes * 60 - seconds - milliseconds / 1000;

    // Se estamos exatamente no início de um intervalo, avançar um intervalo completo
    if (isExactlyAtInterval) {
      secondsUntilNext = intervalMinutes * 60;
    }

    return Math.round(secondsUntilNext);
  };

  // Calculate progress percentage (inverted)
  const calculateProgress = () => {
    if (totalSeconds === 0) return 100;
    return (remainingSeconds / totalSeconds) * 100;
  };

  // Handle time increment
  const incrementTime = () => {
    const currentIndex = timeIntervals.indexOf(timeValue);

    if (currentIndex < timeIntervals.length - 1) {
      setTimeValue(timeIntervals[currentIndex + 1]);
    }
  };

  // Handle time decrement
  const decrementTime = () => {
    const currentIndex = timeIntervals.indexOf(timeValue);

    if (currentIndex > 0) {
      setTimeValue(timeIntervals[currentIndex - 1]);
    }
  };

  // Handle value increment
  const incrementValue = () => {
    setMonetaryValue((prev) => prev + 1);
    setInputValue((prev) => {
      const newValue = Number.parseInt(prev) + 1;
      return newValue.toString();
    });
  };

  // Handle value decrement
  const decrementValue = () => {
    if (monetaryValue > 1) {
      setMonetaryValue((prev) => prev - 1);
      setInputValue((prev) => {
        const newValue = Number.parseInt(prev) - 1;
        return newValue.toString();
      });
    }
  };

  // Handle direct value input
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, ""); // Remove non-digits

    if (rawValue === "") {
      setInputValue("");
      return;
    }

    const numericValue = Number.parseInt(rawValue);
    if (!isNaN(numericValue)) {
      setInputValue(numericValue.toString());
      setMonetaryValue(numericValue);
    }
  };

  // Handle value input focus
  const handleValueFocus = () => {
    setIsEditingValue(true);
    if (valueInputRef.current) {
      valueInputRef.current.select();
    }
  };

  // Handle value input blur
  const handleValueBlur = () => {
    setIsEditingValue(false);
    if (inputValue === "") {
      setInputValue("1");
      setMonetaryValue(1);
    }
  };

  // Função para criar uma nova operação
  const createOperation = async (type: "buy" | "sell") => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const formattedDateTime = now.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // Calcular o tempo de expiração baseado no próximo intervalo
    const secondsUntilNext = calculateSecondsUntilNextInterval(timeValue);
    const expiryTimeMs = now.getTime() + secondsUntilNext * 1000;

    // Buscar o preço atual do ativo
    try {
      // Usar o preço do WebSocket se disponível, caso contrário buscar da API
      const currentPriceValue =
        currentPrice || (await fetchCurrentPrice(tradingPair.replace("/", "")));

      const operation: Operation = {
        id: Date.now().toString(),
        asset: tradingPair.replace("/", ""),
        type,
        value: monetaryValue,
        entryTime: formattedDateTime,
        timeframe: timeValue === 1440 ? "1d" : `${timeValue}m`,
        expiryTime: expiryTimeMs,
        progress: 100,
        entryPrice: currentPriceValue,
      };

      return operation;
    } catch (error) {
      console.error("Erro ao buscar preço atual:", error);
      throw error;
    }
  };

  // Função para processar o resultado da operação
  const processOperationResult = async (operation: Operation) => {
    try {
      // Buscar o preço atual (preço de fechamento)
      // Usar o preço do WebSocket se disponível, caso contrário buscar da API
      const closePrice =
        currentPrices[operation.asset] ||
        (await fetchCurrentPrice(operation.asset));

      // Determinar se o usuário ganhou ou perdeu
      let isWin = false;
      if (operation.type === "buy") {
        // Se comprou e o preço subiu, ganhou
        isWin = closePrice > operation.entryPrice;
      } else {
        // Se vendeu e o preço caiu, ganhou
        isWin = closePrice < operation.entryPrice;
      }

      // Calcular o lucro (90% do valor investido)
      const profit = operation.value * 0.9;

      // Se ganhou, adicionar o valor + lucro ao saldo
      if (isWin) {
        // Adicionar valor investido + lucro
        addBalance(operation.value + profit);
      }

      // Criar o resultado da operação para o histórico
      const result: OperationResult = {
        id: operation.id,
        asset: operation.asset,
        type: operation.type,
        value: operation.value,
        timeframe: operation.timeframe,
        entryTime: operation.entryTime,
        expiryTime: new Date(operation.expiryTime).toLocaleString("pt-BR"),
        openPrice: `${operation.entryPrice.toFixed(4)}`,
        closePrice: `${closePrice.toFixed(4)}`,
        result: isWin ? "win" : "loss",
        profit: isWin ? profit : 0,
      };

      // Adicionar ao histórico
      addOperationResult(result);

      // Notificar o usuário
      toast.open({
        variant: isWin ? "success" : "error",
        title: isWin ? "Operação bem-sucedida!" : "Operação mal-sucedida",
        description: isWin
          ? `Você ganhou ${formatCurrency(profit)} com esta operação.`
          : `Você perdeu ${formatCurrency(operation.value)} nesta operação.`,
        duration: 5000,
      });
    } catch (error) {
      console.error("Erro ao processar resultado da operação:", error);

      // Em caso de erro, notificar o usuário
      toast.open({
        variant: "error",
        title: "Erro ao processar operação",
        description:
          "Ocorreu um erro ao processar o resultado da sua operação.",
        duration: 5000,
      });
    }
  };

  // Handle buy button click
  const handleBuyClick = async () => {
    if (isProcessingOperation) return;

    setIsProcessingOperation(true);

    try {
      // Verificar se o usuário tem saldo suficiente
      if (!deductBalance(monetaryValue)) {
        toast.open({
          variant: "error",
          title: "Saldo insuficiente",
          description: `Você não tem saldo suficiente para realizar esta operação.`,
          duration: 5000,
        });
        setIsProcessingOperation(false);
        return;
      }

      // Atualizar percentuais
      if (sellPercentage > 5) {
        setBuyPercentage((prev) => prev + 1);
        setSellPercentage((prev) => prev - 1);
      }

      // Criar e adicionar a operação
      const operation = await createOperation("buy");
      addOperation(operation);

      // Mostrar toast de confirmação
      toast.open({
        variant: "success",
        title: "Operação realizada com sucesso!",
        description: `Você comprou ${tradingPair} por ${formatCurrency(monetaryValue)} no período de ${timeValue === 1440 ? "1d" : `${timeValue}m`}.`,
        duration: 5000,
      });

      // Agendar o processamento do resultado após o tempo da vela
      const timeoutMs = operation.expiryTime - Date.now();

      // Esperar até o tempo de expiração
      setTimeout(() => {
        // Remover a operação ativa
        removeOperation(operation.id);

        // Processar o resultado
        processOperationResult(operation);
      }, timeoutMs);
    } catch (error) {
      console.error("Erro ao realizar operação de compra:", error);

      // Em caso de erro, devolver o saldo ao usuário
      addBalance(monetaryValue);

      toast.open({
        variant: "error",
        title: "Erro na operação",
        description: "Ocorreu um erro ao realizar a operação. Tente novamente.",
        duration: 5000,
      });
    } finally {
      setIsProcessingOperation(false);
    }
  };

  // Handle sell button click
  const handleSellClick = async () => {
    if (isProcessingOperation) return;

    setIsProcessingOperation(true);

    try {
      // Verificar se o usuário tem saldo suficiente
      if (!deductBalance(monetaryValue)) {
        toast.open({
          variant: "error",
          title: "Saldo insuficiente",
          description: `Você não tem saldo suficiente para realizar esta operação.`,
          duration: 5000,
        });
        setIsProcessingOperation(false);
        return;
      }

      // Atualizar percentuais
      if (buyPercentage > 5) {
        setSellPercentage((prev) => prev + 1);
        setBuyPercentage((prev) => prev - 1);
      }

      // Criar e adicionar a operação
      const operation = await createOperation("sell");
      addOperation(operation);

      // Mostrar toast de confirmação
      toast.open({
        variant: "success",
        title: "Operação realizada com sucesso!",
        description: `Você vendeu ${tradingPair} por ${formatCurrency(monetaryValue)} no período de ${timeValue === 1440 ? "1d" : `${timeValue}m`}.`,
        duration: 5000,
      });

      // Agendar o processamento do resultado após o tempo da vela
      const timeoutMs = operation.expiryTime - Date.now();

      // Esperar até o tempo de expiração
      setTimeout(() => {
        // Remover a operação ativa
        removeOperation(operation.id);

        // Processar o resultado
        processOperationResult(operation);
      }, timeoutMs);
    } catch (error) {
      console.error("Erro ao realizar operação de venda:", error);

      // Em caso de erro, devolver o saldo ao usuário
      addBalance(monetaryValue);

      toast.open({
        variant: "error",
        title: "Erro na operação",
        description: "Ocorreu um erro ao realizar a operação. Tente novamente.",
        duration: 5000,
      });
    } finally {
      setIsProcessingOperation(false);
    }
  };

  // Função para lidar com a expiração de uma operação
  const handleOperationExpire = (id: string) => {
    removeOperation(id);
  };

  // Subscrever para atualizações de preço
  useEffect(() => {
    const formattedSymbol = tradingPair.replace("/", "");

    // Mova a definição da função para fora do useEffect ou use useCallback
    const handlePriceUpdate = (price: number) => {
      // Evite atualizar o estado se o preço não mudou
      setCurrentPrice((prevPrice) => {
        if (prevPrice === price) return prevPrice;
        return price;
      });

      // Use uma referência para o símbolo atual para evitar problemas de closure
      updateCurrentPrice(formattedSymbol, price);
    };

    // Verificar se já temos o preço no store, mas evite atualizar o estado se não for necessário
    if (
      currentPrices[formattedSymbol] &&
      currentPrice !== currentPrices[formattedSymbol]
    ) {
      setCurrentPrice(currentPrices[formattedSymbol]);
    }

    // Subscrever para atualizações de preço
    subscribeToPriceUpdates(formattedSymbol, handlePriceUpdate);

    // Limpar subscrição quando o componente for desmontado
    return () => {
      unsubscribeFromPriceUpdates(formattedSymbol, handlePriceUpdate);
    };
  }, [tradingPair, updateCurrentPrice]); // Remova currentPrices das dependências

  // Initialize and update timer
  useEffect(() => {
    // Calculate initial remaining seconds
    const initialSeconds = calculateSecondsUntilNextInterval(timeValue);
    setRemainingSeconds(initialSeconds);

    // Para 1 dia, o total de segundos é 24 horas
    if (timeValue === 1440) {
      setTotalSeconds(86400); // 86400 segundos = 24 horas
    } else {
      setTotalSeconds(timeValue * 60);
    }

    // Set up interval to update remaining seconds
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        // Desabilitar botões quando o tempo restante for <= 5 segundos
        if (prev <= 5) {
          setButtonsDisabled(true);
        }

        if (prev <= 1) {
          // Reset timer when it reaches zero
          const newSeconds = calculateSecondsUntilNextInterval(timeValue);
          // Reativar botões quando o timer resetar
          setButtonsDisabled(false);
          return newSeconds;
        } else {
          return prev - 1;
        }
      });
    }, 1000);

    // Clean up interval on unmount or when timeValue changes
    return () => clearInterval(timer);
  }, [timeValue]);

  // Renderiza o logo do par de trading
  const renderTradingPairLogo = () => {
    const colors: Record<string, string> = {
      "XRP/USDT": "#10b981",
      "BTC/USDT": "#f97316",
      "ETH/USDT": "#3b82f6",
      "SOL/USDT": "#8b5cf6",
      "ADA/USDT": "#3b82f6",
      "IDX/USDT": "#3b82f6",
      "MEMX/USDT": "#8b5cf6",
    };

    const color = colors[tradingPair] || "#3b82f6";
    const symbol = tradingPair.split("/")[0];

    return (
      <div
        className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px]"
        style={{ backgroundColor: color }}
      >
        {symbol.charAt(0)}
      </div>
    );
  };

  // Filtrar operações para o par de trading atual
  const filteredOperations = activeOperations.filter(
    (op) => op.asset === tradingPair.replace("/", ""),
  );

  // Filtrar histórico para o par de trading atual
  const filteredHistory = operationHistory.filter(
    (op) => op.asset === tradingPair.replace("/", ""),
  );

  return (
    <div className="bg-[#121212] border-t border-[#2a2a2a] flex flex-col theme-transition">
      <div className="p-4">
        <div className="flex items-center mb-2">
          <div className="flex items-center bg-[#1e2c38] rounded px-2 py-1 mr-2">
            {renderTradingPairLogo()}
            <span className="text-xs ml-1">{tradingPair}</span>
            {currentPrice && (
              <span className="ml-2 text-xs text-[rgb(1,219,151)]">
                {currentPrice.toFixed(4)}
              </span>
            )}
          </div>

          <div className="text-[rgb(1,219,151)] text-xs">
            {formatTimeDisplay(remainingSeconds)}
          </div>
        </div>

        {/* Progress bar - Diminuindo da esquerda para a direita */}
        <div className="w-full h-1 bg-[#333] rounded-full overflow-hidden mb-4 relative">
          <div
            className="h-full bg-[rgb(1,219,151)] absolute top-0 left-0 transition-all duration-1000"
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs mb-1">Tempo</div>
            <div className="flex items-center border border-[#2a2a2a] rounded overflow-hidden h-10">
              <button
                className="flex-none bg-[#1a1a1a] text-white p-2 flex justify-center items-center w-10"
                onClick={decrementTime}
              >
                <Minus size={16} />
              </button>
              <div className="flex-1 text-center py-2 min-w-[50px]">
                {timeValue === 1440 ? "1d" : `${timeValue}m`}
              </div>
              <button
                className="flex-none bg-[#1a1a1a] text-white p-2 flex justify-center items-center w-10"
                onClick={incrementTime}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs mb-1">Valor (R$)</div>
            <div className="flex items-center border border-[#2a2a2a] rounded overflow-hidden h-10">
              <button
                className="flex-none bg-[#1a1a1a] text-white p-2 flex justify-center items-center w-10"
                onClick={decrementValue}
              >
                <Minus size={16} />
              </button>

              {isEditingValue ? (
                <input
                  ref={valueInputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleValueChange}
                  onBlur={handleValueBlur}
                  className="flex-1 text-center py-2 bg-transparent border-none focus:outline-none min-w-[50px]"
                  autoFocus
                />
              ) : (
                <div
                  className="flex-1 text-center py-2 cursor-text truncate min-w-[50px]"
                  onClick={handleValueFocus}
                >
                  {formatCurrency(monetaryValue).replace("R$", "").trim()}
                </div>
              )}

              <button
                className="flex-none bg-[#1a1a1a] text-white p-2 flex justify-center items-center w-10"
                onClick={incrementValue}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs text-[#999]">Receita</div>
            <div className="text-[rgb(1,219,151)] font-semibold">+90%</div>
          </div>
          <div className="text-[rgb(1,219,151)] text-2xl font-bold mb-2">
            {formatCurrency(calculateRevenue())}
          </div>
        </div>

        <div className="mb-4">
          {/* Força compradora e vendedora com percentuais nas laterais */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-[rgb(1,219,151)]">{buyPercentage}%</div>
            <div className="flex-1 mx-2 h-1 bg-[#333] rounded-full overflow-hidden">
              <div
                className="h-full bg-[rgb(1,219,151)] rounded-l-full"
                style={{ width: `${buyPercentage}%`, float: "left" }}
              ></div>
              <div
                className="h-full bg-[rgb(204,2,77)] rounded-r-full"
                style={{ width: `${sellPercentage}%`, float: "right" }}
              ></div>
            </div>
            <div className="text-[rgb(204,2,77)]">{sellPercentage}%</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              className={`${
                buttonsDisabled || isProcessingOperation
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-[rgb(8,134,90)] hover:bg-[rgb(7,115,77)]"
              } text-white py-4 rounded w-full flex items-center justify-center h-14 transition-colors buy-button`}
              onClick={handleBuyClick}
              disabled={buttonsDisabled || isProcessingOperation}
              style={{ color: "white" }}
            >
              {isProcessingOperation ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span
                    className="font-semibold mr-1 text-white"
                    style={{ color: "white" }}
                  >
                    COMPRA
                  </span>
                  <TrendingUp
                    size={16}
                    className="text-white"
                    style={{ color: "white" }}
                  />
                </>
              )}
            </button>

            <button
              className={`${
                buttonsDisabled || isProcessingOperation
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-[rgb(204,2,77)] hover:bg-[rgb(180,2,70)]"
              } text-white py-4 rounded w-full flex items-center justify-center h-14 transition-colors sell-button`}
              onClick={handleSellClick}
              disabled={buttonsDisabled || isProcessingOperation}
              style={{ color: "white" }}
            >
              {isProcessingOperation ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span
                    className="font-semibold mr-1 text-white"
                    style={{ color: "white" }}
                  >
                    VENDA
                  </span>
                  <TrendingDown
                    size={16}
                    className="text-white"
                    style={{ color: "white" }}
                  />
                </>
              )}
            </button>
          </div>
        </div>

        <div className="border-t border-[#2a2a2a] pt-4">
          <div className="flex border-b border-[#2a2a2a]">
            <button
              className={`text-sm pb-2 px-4 ${activeTab === "operacoes" ? "text-[rgb(1,219,151)] border-b-2 border-[rgb(1,219,151)]" : "text-[#999]"}`}
              onClick={() => setActiveTab("operacoes")}
            >
              Operações
            </button>
            <button
              className={`text-sm pb-2 px-4 ${activeTab === "historico" ? "text-[rgb(1,219,151)] border-b-2 border-[rgb(1,219,151)]" : "text-[#999]"}`}
              onClick={() => setActiveTab("historico")}
            >
              Histórico
            </button>
          </div>

          <div className="py-4">
            {activeTab === "operacoes" && (
              <div className="max-h-[200px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#2a2a2a] scrollbar-track-transparent">
                {filteredOperations.length > 0 ? (
                  <div className="space-y-2">
                    {filteredOperations.map((operation) => (
                      <ActiveOperationCard
                        key={operation.id}
                        operation={operation}
                        onExpire={handleOperationExpire}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-[#999] text-center">
                    Não há operações abertas no momento no ativo selecionado.
                  </div>
                )}
              </div>
            )}

            {activeTab === "historico" && (
              <div className="max-h-[200px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#2a2a2a] scrollbar-track-transparent">
                {filteredHistory.length > 0 ? (
                  <div>
                    {/* Mostrar apenas o primeiro item do histórico */}
                    {filteredHistory.slice(0, 1).map((operation) => (
                      <HistoryItem key={operation.id} operation={operation} />
                    ))}

                    {/* Botão para ver histórico completo */}
                    <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
                      <Link
                        href="/account?section=historico"
                        className="flex items-center justify-center w-full bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] rounded-lg p-3 transition-colors"
                      >
                        <span className="text-sm font-medium">
                          Ver histórico completo
                        </span>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="ml-2"
                        >
                          <path
                            d="M7 17L17 7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M7 7H17V17"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-[#999] text-center">
                    Não há histórico de operações para este ativo.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
