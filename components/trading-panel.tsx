"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { TrendingUp, TrendingDown, Plus, Minus } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useAccountStore, type Operation, type OperationResult } from "@/store/account-store";
import ActiveOperationCard from "./active-operation-card";
import HistoryItem from "./history-item";
import Link from "next/link";
import { fetchCurrentPrice } from "@/lib/api";
import { subscribeToPriceUpdates, unsubscribeFromPriceUpdates } from "@/lib/websocket";

interface TradingPanelProps {
  tradingPair: string;
}

const TIME_INTERVALS = [1, 5, 10, 15, 30, 1440]; // 1440 minutes = 1 day
const ASSET_COLORS: Record<string, string> = {
  "XRP/USDT": "#10b981",
  "BTC/USDT": "#f97316",
  "ETH/USDT": "#3b82f6",
  "SOL/USDT": "#8b5cf6",
  "ADA/USDT": "#3b82f6",
  "IDX/USDT": "#3b82f6",
  "MEMX/USDT": "#8b5cf6",
};

export default function TradingPanel({ tradingPair }: TradingPanelProps) {
  const [activeTab, setActiveTab] = useState<"operacoes" | "historico">("operacoes");
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
  const valueInputRef = useRef<HTMLInputElement>(null);
  const assetSymbol = tradingPair.replace("/", "");

  const {
    realBalance,
    demoBalance,
    addOperation,
    removeOperation,
    activeOperations,
    syncBalances,
    addOperationResult,
    operationHistory,
    updateCurrentPrice,
    currentPrices,
  } = useAccountStore();

  // Memoized formatting functions
  const formatCurrency = useCallback((value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }, []);

  const formatTimeDisplay = useCallback((seconds: number) => {
    if (seconds <= 0) return "00:00";
    if (seconds > 86400) return `${Math.floor(seconds / 3600)}h`;
    
    const minutes = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  }, []);

  // Calculate time until next interval
  const calculateSecondsUntilNextInterval = useCallback((intervalMinutes: number) => {
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
  }, []);

  // Operation handlers
  const createOperation = useCallback(async (type: "buy" | "sell") => {
    const now = new Date();
    const expiryTimeMs = now.getTime() + remainingSeconds * 1000;
    const currentPriceValue = currentPrice || (await fetchCurrentPrice(assetSymbol));

    return {
      id: Date.now().toString(),
      asset: assetSymbol,
      type,
      value,
      entryTime: now.toISOString(),
      timeframe: timeValue === 1440 ? "1d" : `${timeValue}m`,
      expiryTime: expiryTimeMs,
      progress: 100,
      entryPrice: currentPriceValue,
    } as Operation;
  }, [assetSymbol, currentPrice, remainingSeconds, timeValue, value]);

  const processOperationResult = useCallback(async (operation: Operation) => {
    try {
      const closePrice = currentPrices[operation.asset] || (await fetchCurrentPrice(operation.asset));
      const isWin = operation.type === "buy" ? closePrice > operation.entryPrice : closePrice < operation.entryPrice;
      const profit = operation.value * 0.9;

      const result: OperationResult = {
        id: operation.id,
        asset: operation.asset,
        type: operation.type,
        value: operation.value,
        timeframe: operation.timeframe,
        entryTime: new Date(operation.entryTime).toLocaleString("pt-BR"),
        expiryTime: new Date(operation.expiryTime).toLocaleString("pt-BR"),
        openPrice: operation.entryPrice.toFixed(4),
        closePrice: closePrice.toFixed(4),
        result: isWin ? "win" : "loss",
        profit: isWin ? profit : 0,
      };

      addOperationResult(result);

      toast.open({
        variant: isWin ? "success" : "error",
        title: isWin ? "Operação bem-sucedida!" : "Operação mal-sucedida",
        description: isWin
          ? `Você ganhou ${formatCurrency(profit)} com esta operação.`
          : `Você perdeu ${formatCurrency(operation.value)} nesta operação.`,
        duration: 5000,
      });
    } catch (error) {
      console.error("Erro ao processar resultado:", error);
      toast.open({
        variant: "error",
        title: "Erro ao processar operação",
        description: "Ocorreu um erro ao processar o resultado da sua operação.",
        duration: 5000,
      });
    }
  }, [addOperationResult, currentPrices, formatCurrency, toast]);

  // Trade execution handlers
  const executeTrade = useCallback(async (type: "buy" | "sell") => {
    if (isProcessingOperation) return;
    setIsProcessingOperation(true);

    try {
      const accountStorageRaw = localStorage.getItem("account-storage");
      if (!accountStorageRaw) throw new Error("Conta não encontrada");
      
      const accountStorage = JSON.parse(accountStorageRaw);
      const selectedAccount = accountStorage.state.selectedAccount;
      const balance = selectedAccount === "real" ? realBalance : demoBalance;

      if (value > balance) {
        toast.open({
          variant: "error",
          title: "Saldo insuficiente",
          description: `Você não possui saldo suficiente em sua conta ${selectedAccount}.`,
          duration: 5000,
        });
        return;
      }

      // Update market sentiment
      if (type === "buy" && sellPercentage > 5) {
        setBuyPercentage(prev => prev + 1);
        setSellPercentage(prev => prev - 1);
      } else if (type === "sell" && buyPercentage > 5) {
        setSellPercentage(prev => prev + 1);
        setBuyPercentage(prev => prev - 1);
      }
      syncBalances()
      const operation = await createOperation(type);
      addOperation(operation);

      toast.open({
        variant: "success",
        title: "Operação realizada!",
        description: `Você ${type === "buy" ? "comprou" : "vendeu"} ${tradingPair} por ${formatCurrency(value)}.`,
        duration: 5000,
      });

      setTimeout(() => {
        removeOperation(operation.id);
        processOperationResult(operation);
      }, operation.expiryTime - Date.now());

    } catch (error) {
      console.error(`Erro na operação de ${type}:`, error);
      toast.open({
        variant: "error",
        title: "Erro na operação",
        description: "Ocorreu um erro ao realizar a operação.",
        duration: 5000,
      });
    } finally {
      setIsProcessingOperation(false);
    }
  }, [
    isProcessingOperation,
    realBalance,
    demoBalance,
    value,
    createOperation,
    addOperation,
    removeOperation,
    processOperationResult,
    tradingPair,
    formatCurrency,
    toast,
    buyPercentage,
    sellPercentage
  ]);

  // Value handlers
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    if (rawValue === "") {
      setInputValue("");
      return;
    }

    const numericValue = parseInt(rawValue, 10) || 1;
    setInputValue(numericValue.toString());
    setValue(Math.max(1, numericValue));
  };

  // Timer effect
  useEffect(() => {
    const initialSeconds = calculateSecondsUntilNextInterval(timeValue);
    setRemainingSeconds(initialSeconds);
    setTotalSeconds(timeValue === 1440 ? 86400 : timeValue * 60);

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 5) setButtonsDisabled(true);
        if (prev <= 1) {
          setButtonsDisabled(false);
          return calculateSecondsUntilNextInterval(timeValue);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeValue, calculateSecondsUntilNextInterval]);

  // Price subscription effect
  useEffect(() => {
    const handlePriceUpdate = (price: number) => {
      setCurrentPrice(prev => prev === price ? prev : price);
      updateCurrentPrice(assetSymbol, price);
    };

    if (currentPrices[assetSymbol]) {
      setCurrentPrice(currentPrices[assetSymbol]);
    }

    subscribeToPriceUpdates(assetSymbol, handlePriceUpdate);
    return () => unsubscribeFromPriceUpdates(assetSymbol, handlePriceUpdate);
  }, [assetSymbol, updateCurrentPrice]);

  // Filter operations and history
  const filteredOperations = activeOperations.filter(op => op.asset === assetSymbol);
  const filteredHistory = operationHistory.filter(op => op.asset === assetSymbol);

  // Render trading pair logo
  const renderTradingPairLogo = () => {
    const color = ASSET_COLORS[tradingPair] || "#3b82f6";
    const symbol = tradingPair.split("/")[0].charAt(0);

    return (
      <div 
        className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px]"
        style={{ backgroundColor: color }}
      >
        {symbol}
      </div>
    );
  };

  return (
    <div className="w-80 bg-[#121212] border-l border-[#2a2a2a] flex flex-col">
      {/* Trading controls */}
      <div className="p-4">
        {/* Asset and timer display */}
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

        {/* Progress bar */}
        <div className="w-full h-1 bg-[#333] rounded-full overflow-hidden mb-4 relative">
          <div
            className="h-full bg-[rgb(1,219,151)] absolute top-0 left-0 transition-all duration-1000"
            style={{ width: `${(remainingSeconds / totalSeconds) * 100}%` }}
          />
        </div>

        {/* Time and value controls */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs mb-1">Tempo</div>
            <div className="flex items-center border border-[#2a2a2a] rounded overflow-hidden h-12">
              <button
                className="bg-[#1a1a1a] text-white p-2 w-12 flex justify-center items-center"
                onClick={() => setTimeValue(prev => TIME_INTERVALS[Math.max(0, TIME_INTERVALS.indexOf(prev) - 1)])}
              >
                <Minus size={16} />
              </button>
              <div className="flex-1 text-center py-2 min-w-[70px] text-base">
                {timeValue === 1440 ? "1d" : `${timeValue}m`}
              </div>
              <button
                className="bg-[#1a1a1a] text-white p-2 w-12 flex justify-center items-center"
                onClick={() => setTimeValue(prev => TIME_INTERVALS[Math.min(TIME_INTERVALS.length - 1, TIME_INTERVALS.indexOf(prev) + 1)])}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs mb-1">Valor (R$)</div>
            <div className="flex items-center border border-[#2a2a2a] rounded overflow-hidden h-12">
              <button
                className="bg-[#1a1a1a] text-white p-2 w-12 flex justify-center items-center"
                onClick={() => setValue(prev => Math.max(1, prev - 1))}
              >
                <Minus size={16} />
              </button>

              {isEditingValue ? (
                <input
                  ref={valueInputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleValueChange}
                  onBlur={() => setIsEditingValue(false)}
                  className="flex-1 text-center py-2 bg-transparent border-none focus:outline-none min-w-[70px] text-base"
                  autoFocus
                />
              ) : (
                <div
                  className="flex-1 text-center py-2 cursor-text truncate min-w-[70px] text-base"
                  onClick={() => setIsEditingValue(true)}
                >
                  {value}
                </div>
              )}

              <button
                className="bg-[#1a1a1a] text-white p-2 w-12 flex justify-center items-center"
                onClick={() => setValue(prev => prev + 1)}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Profit display */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs text-[#999]">Receita</div>
            <div className="text-[rgb(1,219,151)] font-semibold">+90%</div>
          </div>
          <div className="text-[rgb(1,219,151)] text-2xl font-bold mb-2">
            {formatCurrency(value * 0.9)}
          </div>
        </div>

        {/* Trade buttons */}
        <div className="mb-4">
          <div className="flex flex-col gap-3">
            <button
              className={`${
                buttonsDisabled || isProcessingOperation
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-[rgb(8,134,90)] hover:bg-[rgb(7,115,77)]"
              } text-white py-4 rounded w-full flex items-center justify-center h-14`}
              onClick={() => executeTrade("buy")}
              disabled={buttonsDisabled || isProcessingOperation}
            >
              {isProcessingOperation ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="font-semibold mr-1">COMPRA</span>
                  <TrendingUp size={16} />
                </>
              )}
            </button>

            {/* Market sentiment */}
            <div className="flex items-center justify-between">
              <div className="text-[rgb(1,219,151)]">{buyPercentage}%</div>
              <div className="flex-1 mx-2 h-1 bg-[#333] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[rgb(1,219,151)] rounded-l-full"
                  style={{ width: `${buyPercentage}%` }}
                />
                <div
                  className="h-full bg-[rgb(204,2,77)] rounded-r-full"
                  style={{ width: `${sellPercentage}%` }}
                />
              </div>
              <div className="text-[rgb(204,2,77)]">{sellPercentage}%</div>
            </div>

            <button
              className={`${
                buttonsDisabled || isProcessingOperation
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-[rgb(204,2,77)] hover:bg-[rgb(180,2,70)]"
              } text-white py-4 rounded w-full flex items-center justify-center h-14`}
              onClick={() => executeTrade("sell")}
              disabled={buttonsDisabled || isProcessingOperation}
            >
              {isProcessingOperation ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="font-semibold mr-1">VENDA</span>
                  <TrendingDown size={16} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Operations/history tabs */}
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
            {activeTab === "operacoes" ? (
              <div className="max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#2a2a2a]">
                {filteredOperations.length > 0 ? (
                  <div className="space-y-2">
                    {filteredOperations.map(op => (
                      <ActiveOperationCard
                        key={op.id}
                        operation={op}
                        onExpire={() => removeOperation(op.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-[#999] text-center">
                    Nenhuma operação ativa
                  </div>
                )}
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#2a2a2a]">
                {filteredHistory.length > 0 ? (
                  <>
                    {filteredHistory.map(op => (
                      <HistoryItem key={op.id} operation={op} />
                    ))}
                    <div className="mt-4 pt-4 border-t border-[#2a2a2a] sticky bottom-0 bg-[#121212] pb-2">
                      <Link
                        href="/account?section=historico"
                        className="flex items-center justify-between w-full bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] rounded-lg p-3"
                      >
                        <span className="text-sm font-medium">Ver histórico completo</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M7 17L17 7" stroke="currentColor" strokeWidth="2" />
                          <path d="M7 7H17V17" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-[#999] text-center">
                    Nenhum histórico disponível
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