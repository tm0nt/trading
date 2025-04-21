"use client";

import { useEffect, useRef, useState } from "react";

interface TradingViewProps {
  tradingPair: string;
}

export default function TradingView({
  tradingPair = "XRP/USDT",
}: TradingViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [priceInfo, setPriceInfo] = useState({
    currentPrice: 0,
    change24h: 0,
    volume24h: 0,
  });

  // Format the trading pair for TradingView (e.g., XRP/USDT -> XRPUSDT)
  const formatTradingPair = (pair: string) => {
    return pair.replace("/", "");
  };

  // Simulate fetching price info for the selected trading pair
  const fetchPriceInfo = (pair: string) => {
    // In a real app, this would be an API call to get current price data
    setTimeout(() => {
      const basePrice = getBasePrice(pair);
      const randomChange = Math.random() * 6 - 3; // Random change between -3% and +3%
      const volume = basePrice * (1000000 + Math.random() * 5000000); // Random volume

      setPriceInfo({
        currentPrice: basePrice,
        change24h: randomChange,
        volume24h: volume,
      });

      setIsLoading(false);
    }, 1000);
  };

  // Get base price for different assets (simulated)
  const getBasePrice = (pair: string) => {
    const pairSymbol = pair.split("/")[0];

    // Base prices for different assets
    const basePrices: Record<string, number> = {
      XRP: 2.15,
      BTC: 67500.25,
      ETH: 3450.75,
      SOL: 165.3,
      ADA: 0.45,
      IDX: 3785.5,
      MEMX: 0.0075,
    };

    return basePrices[pairSymbol] || 1.0;
  };

  // Initialize or update the widget when trading pair changes
  useEffect(() => {
    setIsLoading(true);
    fetchPriceInfo(tradingPair);

    // Clear previous chart if any
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }

    // Create a new script element for the TradingView widget
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    // Format the trading pair for the widget
    const symbol = formatTradingPair(tradingPair);

    // Configure the widget
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: "1",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "br",
      enable_publishing: false,
      allow_symbol_change: false,
      calendar: false,
      support_host: "https://www.tradingview.com",
      hide_top_toolbar: false,
      hide_side_toolbar: false,
      hide_legend: false,
      save_image: false,
      studies: [], // Removed MA
      show_popup_button: true,
      popup_width: "1000",
      popup_height: "650",
      hide_volume: true, // Volume remains hidden
      container_id: "tradingview_widget",
    });

    // Create a container for the widget
    const container = document.createElement("div");
    container.id = "tradingview_widget";
    container.className = "tradingview-widget-container";
    container.style.height = "100%";
    container.style.width = "100%";

    // Append the container and script to the DOM
    if (containerRef.current) {
      containerRef.current.appendChild(container);
      container.appendChild(script);
    }

    // Cleanup function
    return () => {
      if (containerRef.current) {
        const widgetContainer = containerRef.current.querySelector(
          "#tradingview_widget",
        );
        if (widgetContainer) {
          containerRef.current.removeChild(widgetContainer);
        }
      }
    };
  }, [tradingPair]);

  // Adicionar um manipulador de erro para o TradingView
  useEffect(() => {
    // Função para lidar com erros de carregamento do TradingView
    const handleTradingViewError = () => {
      setIsLoading(false);

      // Mostrar uma mensagem de erro para o usuário
      if (containerRef.current) {
        const errorDiv = document.createElement("div");
        errorDiv.className =
          "flex flex-col items-center justify-center h-full bg-[#121212]/90";
        errorDiv.innerHTML = `
        <button class="bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white px-4 py-2 rounded">
          Recarregar gráfico
        </button>
      `;

        // Adicionar evento de clique para recarregar
        errorDiv.querySelector("button")?.addEventListener("click", () => {
          if (containerRef.current) {
            containerRef.current.innerHTML = "";
            // Recriar o widget
            const container = document.createElement("div");
            container.id = "tradingview_widget";
            container.className = "tradingview-widget-container";
            container.style.height = "100%";
            container.style.width = "100%";
            containerRef.current.appendChild(container);

            // Recriar o script
            const script = document.createElement("script");
            script.src =
              "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
            script.type = "text/javascript";
            script.async = true;
            script.innerHTML = JSON.stringify({
              autosize: true,
              symbol: formatTradingPair(tradingPair),
              interval: "1",
              timezone: "Etc/UTC",
              theme: "dark",
              style: "1",
              locale: "br",
              enable_publishing: false,
              allow_symbol_change: false,
              calendar: false,
              support_host: "https://www.tradingview.com",
              hide_top_toolbar: false,
              hide_side_toolbar: false,
              hide_legend: false,
              save_image: false,
              studies: [],
              show_popup_button: true,
              popup_width: "1000",
              popup_height: "650",
              hide_volume: true,
              container_id: "tradingview_widget",
            });
            container.appendChild(script);
          }
        });

        containerRef.current.appendChild(errorDiv);
      }
    };

    // Adicionar um timeout para detectar falhas de carregamento
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        handleTradingViewError();
      }
    }, 15000); // 15 segundos de timeout

    return () => clearTimeout(timeoutId);
  }, [isLoading, tradingPair]);

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }

    setIsFullscreen(!isFullscreen);
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Extract the base and quote currencies
  const [baseCurrency, quoteCurrency] = tradingPair.split("/");

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* Header with trading pair info */}

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#121212]/80 z-10">
          <div className="w-10 h-10 border-4 border-[#2a2a2a] border-t-[rgb(1,219,151)] rounded-full animate-spin"></div>
        </div>
      )}

      {/* TradingView chart container */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ height: "calc(100% - 4px)" }}
      ></div>

      {/* Current price indicator (shown while loading) */}
      {isLoading && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-[rgb(1,219,151)] text-white px-2 py-1 text-xs rounded z-10">
          <div>{priceInfo.currentPrice.toFixed(5)}</div>
          <div>
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      )}
    </div>
  );
}
