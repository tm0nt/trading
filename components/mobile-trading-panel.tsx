"use client";

import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { TrendingUp, TrendingDown, Plus, Minus } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useAccountStore, type Operation, type OperationResult } from "@/store/account-store";
import ActiveOperationCard from "./active-operation-card";
import HistoryItem from "./history-item";
import Link from "next/link";
import { fetchCurrentPrice } from "@/lib/api";
import { subscribeToPriceUpdates, unsubscribeFromPriceUpdates } from "@/lib/websocket";

// Definindo intervalos de tempo
const timeIntervals = [1, 5, 10, 15, 30, 1440]; // 1440 minutos = 1 dia

// Interface para o componente TradingPanel
interface TradingPanelProps {
  tradingPair: string;
}

export default function TradingPanel({ tradingPair }: TradingPanelProps) {
  const [activeTab, setActiveTab] = useState("operacoes");
  const [timeValue, setTimeValue] = useState(1);
  const [value, setValue] = useState(1);
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
    realBalance,
    demoBalance,
    addOperation,
    removeOperation,
    activeOperations,
    syncBalances,
    addOperationResult,
    operationHistory,
    addBalance,
    updateCurrentPrice,
    currentPrices,
  } = useAccountStore();

  const valueInputRef = useRef<HTMLInputElement>(null);

  // Formatação do valor para moeda brasileira
  const formatCurrency = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // Função para formatar o tempo (em minutos ou horas)
  const formatTimeDisplay = useCallback((seconds: number) => {
    if (seconds <= 0) return "00:00";
    if (seconds > 86400) {
      const hours = Math.floor(seconds / 3600);
      return `${hours}h`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  }, []);

  // Calcular segundos até o próximo intervalo
  const calculateSecondsUntilNextInterval = (intervalMinutes: number) => {
    const now = new Date();
    if (intervalMinutes === 1440) {
      const tomorrow = new Date(now);
      tomorrow.setHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return Math.floor((tomorrow.getTime() - now.getTime()) / 1000);
    }

    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();
    const currentMinuteOfDay = minutes % intervalMinutes;
    const nextIntervalMinutes = intervalMinutes - currentMinuteOfDay;
    const isExactlyAtInterval = currentMinuteOfDay === 0 && seconds === 0 && milliseconds === 0;
    let secondsUntilNext = nextIntervalMinutes * 60 - seconds - milliseconds / 1000;
    if (isExactlyAtInterval) secondsUntilNext = intervalMinutes * 60;
    return Math.round(secondsUntilNext);
  };

  // Funções de incremento/decremento de tempo e valor
  const incrementTime = () => {
    const currentIndex = timeIntervals.indexOf(timeValue);
    if (currentIndex < timeIntervals.length - 1) setTimeValue(timeIntervals[currentIndex + 1]);
  };

  const decrementTime = () => {
    const currentIndex = timeIntervals.indexOf(timeValue);
    if (currentIndex > 0) setTimeValue(timeIntervals[currentIndex - 1]);
  };

  const incrementValue = () => {
    setValue((prev) => prev + 1);
    setInputValue((prev) => (Number.parseInt(prev) + 1).toString());
  };

  const decrementValue = () => {
    if (value > 1) {
      setValue((prev) => prev - 1);
      setInputValue((prev) => (Number.parseInt(prev) - 1).toString());
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    if (rawValue === "") {
      setInputValue("");
      return;
    }
    const numericValue = Number.parseInt(rawValue);
    if (!isNaN(numericValue)) {
      setInputValue(numericValue.toString());
      setValue(numericValue);
    }
  };

  const handleValueFocus = () => {
    setIsEditingValue(true);
    if (valueInputRef.current) {
      valueInputRef.current.select();
    }
  };

  const handleValueBlur = () => {
    setIsEditingValue(false);
    if (inputValue === "") {
      setInputValue("1");
      setValue(1);
    }
  };

  // Calcular receita (90% do valor inserido)
  const calculateRevenue = (val: number) => val * 0.9;

  const calculateProgress = () => totalSeconds === 0 ? 100 : (remainingSeconds / totalSeconds) * 100;

  // Verificar saldo disponível para realizar a operação
  const checkBalance = (selectedAccount: string) => {
    if (selectedAccount === "real" && value > realBalance) {
      toast.open({ variant: "error", title: "Saldo insuficiente", description: "Você não possui saldo suficiente para realizar essa operação.", duration: 5000 });
      return false;
    }
    if (selectedAccount === "demo" && value > demoBalance) {
      toast.open({ variant: "error", title: "Saldo insuficiente", description: "Você não possui saldo suficiente em sua conta demo.", duration: 5000 });
      return false;
    }
    return true;
  };

  // Função para criar uma nova operação
  const createOperation = async (type: "buy" | "sell") => {
    const now = new Date();
    const formattedDateTime = now.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const secondsUntilNext = calculateSecondsUntilNextInterval(timeValue);
    const expiryTimeMs = now.getTime() + secondsUntilNext * 1000;

    try {
      const currentPriceValue = currentPrice || await fetchCurrentPrice(tradingPair.replace("/", ""));
      return {
        id: Date.now().toString(),
        asset: tradingPair.replace("/", ""),
        type,
        value,
        entryTime: formattedDateTime,
        timeframe: timeValue === 1440 ? "1d" : `${timeValue}m`,
        expiryTime: expiryTimeMs,
        progress: 100,
        entryPrice: currentPriceValue,
      };
    } catch (error) {
      console.error("Erro ao buscar preço atual:", error);
      throw error;
    }
  };

  // Função para processar o resultado da operação
  const processOperationResult = async (operation: Operation, operationId: string) => {
    try {
      const closePrice = await fetchCurrentPrice(operation.asset);
  
      // Normalizando a precisão dos preços para 4 casas decimais antes de comparar
      const normalizedEntryPrice = parseFloat(operation.entryPrice.toFixed(4));
      const normalizedClosePrice = parseFloat(closePrice.toFixed(4));
  
      // Determinando se a operação foi ganha ou perdida
      const isWin = (operation.type === "buy")
        ? normalizedClosePrice > normalizedEntryPrice  // Compra é ganha se preço de fechamento for maior que de entrada
        : normalizedClosePrice < normalizedEntryPrice; // Venda é ganha se preço de fechamento for menor que de entrada
  
      const profit = operation.value * 0.9;
  
      // Obtém a conta do usuário
      const accountStorageRaw = localStorage.getItem("account-storage");
      if (!accountStorageRaw) throw new Error("Conta não encontrada no localStorage");
  
      const accountStorage = JSON.parse(accountStorageRaw);
      const selectedAccount = accountStorage.state.selectedAccount;
  
      // Atualiza a operação no banco de dados
      const updateOperation = await fetch(`/api/account/operations/search/?id=${operationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: selectedAccount,
          status: "concluido",
          resultado: isWin ? "ganho" : "perda",
          fechamento: normalizedClosePrice
        }),
      });
  
      if (!updateOperation.ok) throw new Error("Erro ao atualizar a operação");
  
      const operationData = await updateOperation.json();
  
      // Estrutura para resultado da operação
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
      syncBalances();
      addOperationResult(result);
  
      // Exibe a notificação de sucesso ou falha da operação
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
      toast.open({
        variant: "error",
        title: "Erro ao processar operação",
        description: "Ocorreu um erro ao processar o resultado da sua operação.",
        duration: 5000,
      });
    }
  };
  
  

  // Handle buy button click
  const handleBuyClick = async () => {
    console.log("Botão de compra/venda clicado.");
    
    // Verifica se já está processando uma operação
    if (isProcessingOperation) {
      console.log("Operação já está em processamento. Retornando...");
      return;
    }
    setIsProcessingOperation(true);
  
    try {
      console.log("Iniciando operação de compra");
  
      // Verifica se há dados no localStorage
      const accountStorageRaw = localStorage.getItem("account-storage");
      console.log("Dados no localStorage:", accountStorageRaw);
      if (!accountStorageRaw) throw new Error("Conta não encontrada no localStorage");
  
      const accountStorage = JSON.parse(accountStorageRaw);
      const selectedAccount = accountStorage.state.selectedAccount;
  
      // Verifica o saldo da conta
      if (!checkBalance(selectedAccount)) {
        console.log("Saldo insuficiente para compra.");
        return;
      }
  
      // Ajusta os percentuais de compra e venda
      if (sellPercentage > 5) {
        console.log("Ajustando percentuais de compra e venda...");
        setBuyPercentage((prev) => prev + 1);
        setSellPercentage((prev) => prev - 1);
      }
  
      // Busca o preço atual ou utiliza o preço atual, caso já esteja definido
      const currentPriceValue = currentPrice || await fetchCurrentPrice(tradingPair.replace("/", ""));
      console.log("Preço atual:", currentPriceValue);
  
      // Cria a operação de compra
      const operation = await createOperation("buy");
      console.log("Operação criada:", operation);
      addOperation(operation);
  
      // Dados para o corpo da requisição
      const requestBody = {
        balance: selectedAccount,
        tipo: selectedAccount,
        data: new Date(),
        ativo: tradingPair,
        tempo: timeValue === 1440 ? `1d` : `${timeValue}m`,
        previsao: "call",
        vela: "verde",
        abertura: currentPriceValue,
        fechamento: 0,
        receita: calculateRevenue(value),
        valor: value,
        status: "executado",
        resultado: "pendente",
      };
      console.log("Enviando requisição:", requestBody);
  
      // Envia a requisição para a API
      const response = await fetch("/api/account/operations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
  
      const data = await response.json();
      console.log("Resposta da API:", data);
  
      // Obtém o ID da operação
      const operationId = data.id;
      syncBalances();
  
      // Exibe o toast de sucesso
      toast.open({
        variant: "success",
        title: "Operação realizada com sucesso!",
        description: `Você comprou ${tradingPair} por ${formatCurrency(value)} no período de ${timeValue === 1440 ? "1d" : `${timeValue}m`}.`,
        duration: 5000,
      });

      // Calcula o tempo restante para expiração e configura o timeout
      const timeoutMs = operation.expiryTime - Date.now();
      console.log("Tempo restante para expiração:", timeoutMs);
      setTimeout(() => {
        console.log("Removendo operação e processando resultado...", operation);
        removeOperation(operation.id);
        processOperationResult(operation, operationId);
      }, timeoutMs);
  
    } catch (error) {
      console.error("Erro ao realizar operação de compra:", error);
      toast.open({ variant: "error", title: "Erro na operação", description: "Ocorreu um erro ao realizar a operação. Tente novamente.", duration: 5000 });
    } finally {
      // Finaliza o processamento da operação
      setIsProcessingOperation(false);
      console.log("Operação de compra finalizada.");
    }
  };
  

  // Handle sell button click
  const handleSellClick = async () => {
    if (isProcessingOperation) return;
    setIsProcessingOperation(true);

    try {
      const accountStorageRaw = localStorage.getItem("account-storage");
      if (!accountStorageRaw) throw new Error("Conta não encontrada no localStorage");

      const accountStorage = JSON.parse(accountStorageRaw);
      const selectedAccount = accountStorage.state.selectedAccount;

      if (!checkBalance(selectedAccount)) return;

      if (buyPercentage > 5) {
        setSellPercentage((prev) => prev + 1);
        setBuyPercentage((prev) => prev - 1);
      }

      const currentPriceValue = currentPrice || await fetchCurrentPrice(tradingPair.replace("/", ""));

      // Criar operação de venda
      const response = await fetch("/api/account/operations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          balance: selectedAccount,
          tipo: selectedAccount,
          data: new Date(),
          ativo: tradingPair,
          tempo: timeValue === 1440 ? `1d` : `${timeValue}m`,
          previsao: "put",
          vela: "vermelha",
          abertura: currentPriceValue,
          fechamento: 0,
          valor: value,
          receita: calculateRevenue(value),
          status: "executado",
          resultado: "pendente",
        }),
      });

      const operation = await createOperation("sell");
      addOperation(operation);

    

      const data = await response.json();
      const operationId = data.id;
      syncBalances();

      toast.open({
        variant: "success",
        title: "Operação realizada com sucesso!",
        description: `Você vendeu ${tradingPair} por ${formatCurrency(value)} no período de ${timeValue === 1440 ? "1d" : `${timeValue}m`}.`,
        duration: 5000,
      });

      const timeoutMs = operation.expiryTime - Date.now();
      setTimeout(() => {
        removeOperation(operation.id);
        processOperationResult(operation, operationId);
      }, timeoutMs);

    } catch (error) {
      console.error("Erro ao realizar operação de venda:", error);
      addBalance(value);

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

  // Função para renderizar o logo do par de trading
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

  // Filtrar operações e histórico para o par de trading atual
  const filteredOperations = activeOperations.filter(
    (op) => op.asset === tradingPair.replace("/", ""),
  );

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
                  {formatCurrency(value).replace("R$", "").trim()}
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
            {formatCurrency(calculateRevenue(value))}
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
