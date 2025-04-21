"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Search, Star, X, Bitcoin, DollarSign } from "lucide-react";

interface TradingPair {
  symbol: string;
  change24h: number;
  profit: number;
  isFavorite: boolean;
  logo: string;
  type: "crypto" | "forex";
}

interface TradingPairDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPair: (pair: string) => void;
  selectedPair: string;
  triggerRect?: DOMRect | null;
}

export default function TradingPairDropdown({
  isOpen,
  onClose,
  onSelectPair,
  selectedPair,
  triggerRect,
}: TradingPairDropdownProps) {
  const [activeCategory, setActiveCategory] = useState<
    "crypto" | "forex" | "favorites"
  >("crypto");
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>([
    {
      symbol: "IDX/USDT",
      change24h: 1.4,
      profit: 90,
      isFavorite: false,
      logo: "blue",
      type: "crypto",
    },
    {
      symbol: "MEMX/USDT",
      change24h: -2.89,
      profit: 90,
      isFavorite: false,
      logo: "purple",
      type: "crypto",
    },
    {
      symbol: "BTC/USDT",
      change24h: 1.28,
      profit: 90,
      isFavorite: false,
      logo: "orange",
      type: "crypto",
    },
    {
      symbol: "ETH/USDT",
      change24h: 1.87,
      profit: 90,
      isFavorite: false,
      logo: "blue",
      type: "crypto",
    },
    {
      symbol: "SOL/USDT",
      change24h: 2.29,
      profit: 90,
      isFavorite: false,
      logo: "purple",
      type: "crypto",
    },
    {
      symbol: "XRP/USDT",
      change24h: 1.27,
      profit: 90,
      isFavorite: false,
      logo: "green",
      type: "crypto",
    },
    {
      symbol: "ADA/USDT",
      change24h: -0.91,
      profit: 90,
      isFavorite: false,
      logo: "blue",
      type: "crypto",
    },
    {
      symbol: "EUR/USD",
      change24h: 0.32,
      profit: 90,
      isFavorite: false,
      logo: "blue",
      type: "forex",
    },
    {
      symbol: "GBP/USD",
      change24h: 0.18,
      profit: 90,
      isFavorite: false,
      logo: "green",
      type: "forex",
    },
    {
      symbol: "USD/JPY",
      change24h: -0.45,
      profit: 90,
      isFavorite: false,
      logo: "orange",
      type: "forex",
    },
    {
      symbol: "AUD/USD",
      change24h: 0.21,
      profit: 90,
      isFavorite: false,
      logo: "purple",
      type: "forex",
    },
  ]);

  // Carregar favoritos do localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem("tradingPairFavorites");
    if (savedFavorites) {
      try {
        const favorites = JSON.parse(savedFavorites) as string[];
        setTradingPairs((prev) =>
          prev.map((pair) => ({
            ...pair,
            isFavorite: favorites.includes(pair.symbol),
          })),
        );
      } catch (e) {
        console.error("Erro ao carregar favoritos:", e);
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const toggleFavorite = (symbol: string) => {
    setTradingPairs((prev) => {
      const updated = prev.map((pair) =>
        pair.symbol === symbol
          ? { ...pair, isFavorite: !pair.isFavorite }
          : pair,
      );

      // Salvar favoritos no localStorage
      const favorites = updated
        .filter((pair) => pair.isFavorite)
        .map((pair) => pair.symbol);
      localStorage.setItem("tradingPairFavorites", JSON.stringify(favorites));

      return updated;
    });
  };

  const handleSelectPair = (symbol: string) => {
    onSelectPair(symbol);
    onClose();
  };

  // Filtrar pares de trading com base na categoria e pesquisa
  const filteredPairs = tradingPairs.filter((pair) => {
    const matchesSearch = pair.symbol
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    if (activeCategory === "favorites") {
      return pair.isFavorite && matchesSearch;
    }

    return pair.type === activeCategory && matchesSearch;
  });

  // Renderiza o logo do par de trading
  const renderLogo = (type: string) => {
    const colors: Record<string, string> = {
      blue: "#3b82f6",
      purple: "#8b5cf6",
      orange: "#f97316",
      green: "#10b981",
    };

    const color = colors[type] || "#3b82f6";

    return (
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
        style={{ backgroundColor: color }}
      >
        {type.charAt(0).toUpperCase()}
      </div>
    );
  };

  if (!isOpen) return null;

  // Calcular posição do dropdown com base no elemento que foi clicado
  const getDropdownStyle = () => {
    if (!triggerRect) return {};

    // Em desktop, posicionar abaixo do elemento clicado
    return {
      position: "absolute",
      top: `${triggerRect.bottom + window.scrollY}px`,
      left: `${triggerRect.left + window.scrollX}px`,
    } as React.CSSProperties;
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-200 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        ref={dropdownRef}
        className={`z-50 bg-gradient-to-b from-[#151515] to-[#121212] border border-[#2a2a2a] rounded-lg shadow-xl overflow-hidden transition-all duration-300 ease-out ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        } ${
          // Em mobile, ocupar quase toda a tela
          "md:w-[600px] md:h-[600px] md:fixed md:transform md:origin-top-left"
        }`}
        style={{
          // Em mobile, posição fixa
          ...(window.innerWidth < 768
            ? {
                position: "fixed",
                top: "16px",
                left: "16px",
                right: "16px",
                height: "calc(100vh - 32px)",
              }
            : getDropdownStyle()),
        }}
      >
        <div className="flex h-full">
          {/* Sidebar vertical */}
          <div className="bg-[#121212] border-r border-[#2a2a2a] py-4">
            {/* Versão desktop: ícones com texto */}
            <div className="hidden md:flex md:flex-col md:items-start md:space-y-4 md:px-4 md:w-48">
              <button
                className={`flex items-center p-3 rounded-lg transition-colors duration-200 w-full ${
                  activeCategory === "favorites"
                    ? "bg-[#1a1a1a] text-[rgb(1,219,151)]"
                    : "text-white hover:bg-[#1a1a1a]"
                }`}
                onClick={() => setActiveCategory("favorites")}
              >
                <Star
                  className={`mr-2 ${activeCategory === "favorites" ? "text-[rgb(1,219,151)]" : ""}`}
                  size={20}
                />
                <span>Favoritos</span>
              </button>

              <button
                className={`flex items-center p-3 rounded-lg transition-colors duration-200 w-full ${
                  activeCategory === "crypto"
                    ? "bg-[#1a1a1a] text-[rgb(1,219,151)]"
                    : "text-white hover:bg-[#1a1a1a]"
                }`}
                onClick={() => setActiveCategory("crypto")}
              >
                <div
                  className={`w-8 h-8 rounded-full ${
                    activeCategory === "crypto"
                      ? "bg-[rgb(1,219,151)]/10"
                      : "bg-[#2a2a2a]"
                  } flex items-center justify-center mr-2`}
                >
                  <Bitcoin
                    className={
                      activeCategory === "crypto" ? "text-[rgb(1,219,151)]" : ""
                    }
                    size={18}
                  />
                </div>
                <span>Cripto</span>
              </button>

              <button
                className={`flex items-center p-3 rounded-lg transition-colors duration-200 w-full ${
                  activeCategory === "forex"
                    ? "bg-[#1a1a1a] text-[rgb(1,219,151)]"
                    : "text-white hover:bg-[#1a1a1a]"
                }`}
                onClick={() => setActiveCategory("forex")}
              >
                <div
                  className={`w-8 h-8 rounded-full ${
                    activeCategory === "forex"
                      ? "bg-[rgb(1,219,151)]/10"
                      : "bg-[#2a2a2a]"
                  } flex items-center justify-center mr-2`}
                >
                  <DollarSign
                    className={
                      activeCategory === "forex" ? "text-[rgb(1,219,151)]" : ""
                    }
                    size={18}
                  />
                </div>
                <span>Forex</span>
              </button>
            </div>

            {/* Versão mobile: apenas ícones */}
            <div className="flex flex-col items-center space-y-6 px-3 md:hidden">
              <button
                className={`p-2 rounded-full ${
                  activeCategory === "favorites"
                    ? "bg-[rgb(1,219,151)]/10"
                    : "bg-[#1a1a1a]"
                }`}
                onClick={() => setActiveCategory("favorites")}
              >
                <Star
                  className={
                    activeCategory === "favorites"
                      ? "text-[rgb(1,219,151)]"
                      : "text-white"
                  }
                  size={20}
                />
              </button>

              <button
                className={`p-2 rounded-full ${
                  activeCategory === "crypto"
                    ? "bg-[rgb(1,219,151)]/10"
                    : "bg-[#1a1a1a]"
                }`}
                onClick={() => setActiveCategory("crypto")}
              >
                <Bitcoin
                  className={
                    activeCategory === "crypto"
                      ? "text-[rgb(1,219,151)]"
                      : "text-white"
                  }
                  size={20}
                />
              </button>

              <button
                className={`p-2 rounded-full ${activeCategory === "forex" ? "bg-[rgb(1,219,151)]/10" : "bg-[#1a1a1a]"}`}
                onClick={() => setActiveCategory("forex")}
              >
                <DollarSign
                  className={
                    activeCategory === "forex"
                      ? "text-[rgb(1,219,151)]"
                      : "text-white"
                  }
                  size={20}
                />
              </button>
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-[#2a2a2a]">
              <div className="text-white text-sm font-medium">
                {activeCategory === "favorites"
                  ? "Favoritos"
                  : activeCategory === "crypto"
                    ? "Criptomoedas"
                    : "Forex"}
              </div>
              <div className="flex items-center">
                <div className="text-[#999] text-sm mr-4">
                  Total: {filteredPairs.length}
                </div>
                <button
                  onClick={onClose}
                  className="text-[#999] hover:text-white p-1 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-hidden flex flex-col">
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-[#666]" />
                </div>
                <input
                  type="text"
                  placeholder="Pesquisar ativo"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-[#3a3a3a] transition-colors duration-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="overflow-y-auto flex-1">
                <table className="w-full min-w-[300px]">
                  <thead className="text-left text-[#999] text-sm">
                    <tr>
                      <th className="pb-2 pl-2 whitespace-nowrap">Símbolo</th>
                      <th className="pb-2 whitespace-nowrap">Mudança</th>
                      <th className="pb-2 whitespace-nowrap">Lucro</th>
                      <th className="pb-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPairs.length > 0 ? (
                      filteredPairs.map((pair) => (
                        <tr
                          key={pair.symbol}
                          className="hover:bg-[#1a1a1a] cursor-pointer transition-colors"
                          onClick={() => handleSelectPair(pair.symbol)}
                        >
                          <td className="py-3 pl-2">
                            <div className="flex items-center">
                              {renderLogo(pair.logo)}
                              <span className="ml-2 text-white whitespace-nowrap text-xs">
                                {pair.symbol}
                              </span>
                            </div>
                          </td>
                          <td
                            className={`${pair.change24h >= 0 ? "text-[rgb(1,219,151)]" : "text-[rgb(204,2,77)]"} text-xs whitespace-nowrap`}
                          >
                            {pair.change24h > 0 ? "+" : ""}
                            {pair.change24h}%
                          </td>
                          <td className="text-xs whitespace-nowrap">
                            <div className="text-white">90%</div>
                          </td>
                          <td>
                            <button
                              className="p-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(pair.symbol);
                              }}
                            >
                              <Star
                                size={16}
                                className={
                                  pair.isFavorite
                                    ? "text-[rgb(1,219,151)]"
                                    : "text-[#444]"
                                }
                                fill={
                                  pair.isFavorite ? "rgb(1,219,151)" : "none"
                                }
                              />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-8 text-center text-[#999]"
                        >
                          {searchQuery
                            ? "Nenhum resultado encontrado para sua pesquisa."
                            : activeCategory === "favorites"
                              ? "Você ainda não tem favoritos. Adicione clicando na estrela."
                              : "Nenhum ativo disponível nesta categoria."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
