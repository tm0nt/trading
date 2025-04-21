"use client";

import { useState, useEffect } from "react";
import TradingView from "@/components/trading-view";
import Header from "@/components/header";
import TradingPanel from "@/components/trading-panel";
import MobileTradingPanel from "@/components/mobile-trading-panel";
import { ToastContainer } from "@/components/ui/toast";
import { disconnectAllWebSockets } from "@/lib/websocket";

export default function TradingPage() {
  const [selectedTradingPair, setSelectedTradingPair] = useState("XRP/USDT");

  // Carregar par de trading selecionado do localStorage
  useEffect(() => {
    const savedTradingPair = localStorage.getItem("selectedTradingPair");
    if (savedTradingPair) {
      setSelectedTradingPair(savedTradingPair);
    }
  }, []);

  // Atualizar o par de trading quando ele mudar no localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const savedTradingPair = localStorage.getItem("selectedTradingPair");
      if (savedTradingPair && savedTradingPair !== selectedTradingPair) {
        setSelectedTradingPair(savedTradingPair);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [selectedTradingPair]);

  // Limpar todas as conexões WebSocket quando o componente for desmontado
  useEffect(() => {
    return () => {
      disconnectAllWebSockets();
    };
  }, []);

  // Função para atualizar o par de trading em todos os componentes
  const updateTradingPair = (pair: string) => {
    setSelectedTradingPair(pair);
    localStorage.setItem("selectedTradingPair", pair);
  };

  return (
    <ToastContainer>
      <main className="flex flex-col h-screen bg-[#121212] text-white overflow-hidden theme-transition">
        <Header
          onSelectTradingPair={updateTradingPair}
          selectedTradingPair={selectedTradingPair}
          showTradingPair={true}
        />
        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-col flex-1 overflow-hidden">
            <TradingView tradingPair={selectedTradingPair} />
          </div>
          <div className="hidden md:block">
            <TradingPanel tradingPair={selectedTradingPair} />
          </div>
        </div>
        <div className="md:hidden">
          <MobileTradingPanel tradingPair={selectedTradingPair} />
        </div>
      </main>
    </ToastContainer>
  );
}
