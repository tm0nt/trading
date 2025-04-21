"use client";

import { useRef, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAccountStore } from "@/store/account-store";
import { accountService } from "@/lib/services/account-service";

interface AccountDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleBalanceVisibility: () => void;
  isBalanceVisible: boolean;
  onSelectAccount: (type: "demo" | "real") => void;
  selectedAccount: "demo" | "real";
  triggerRect?: DOMRect | null;
}

export default function AccountDropdown({
  isOpen,
  onClose,
  onToggleBalanceVisibility,
  isBalanceVisible,
  onSelectAccount,
  selectedAccount,
  triggerRect,
}: AccountDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { demoBalance, realBalance, setDemoBalance, setRealBalance } =
    useAccountStore();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const balances = await accountService.getBalances();
        setDemoBalance(balances.demoBalance);
        setRealBalance(balances.realBalance);
      } catch (error) {
        console.error("Erro ao buscar saldos:", error);
      }
    };

    if (isOpen) {
      fetchBalances();
    }
  }, [isOpen, setDemoBalance, setRealBalance]);

  const handleReloadDemoAccount = async () => {
    try {
      const newBalance = await accountService.reloadDemoAccount();
      setDemoBalance(newBalance);
    } catch (error) {
      console.error("Erro ao recarregar conta demo:", error);
    }
  };

  // Format currency to Brazilian Real
  const formatCurrency = (value: number) => {
    if (isNaN(value)) {
      return "R$ 0,00"; // ou algum outro valor padrão caso o valor seja inválido
    }
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getDropdownStyle = (): React.CSSProperties => {
    if (!triggerRect) return {};

    return {
      position: "absolute",
      top: `${triggerRect.bottom + window.scrollY}px`,
      right: `${window.innerWidth - triggerRect.right - window.scrollX + 12}px`,
    };
  };

  const dropdownStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        top: "16px",
        left: "16px",
        right: "16px",
        maxHeight: "calc(100vh - 32px)",
        overflowY: "auto",
      }
    : {
        ...getDropdownStyle(),
        width: "20rem",
      };

  return (
    <div
      className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-200 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        ref={dropdownRef}
        className={`z-50 bg-gradient-to-b from-[#151515] to-[#121212] border border-[#2a2a2a] rounded-lg shadow-xl overflow-hidden transition-all duration-300 ease-out ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        style={dropdownStyle}
      >
        {/* Header do dropdown com toggle de visibilidade */}
        <div className="p-3 border-b border-[#2a2a2a] bg-[#151515] flex justify-between items-center">
          <div className="text-sm font-medium">Selecione sua conta</div>
          <button
            onClick={onToggleBalanceVisibility}
            className="p-1.5 hover:bg-[#2a2a2a] rounded-full transition-colors duration-200"
            title={isBalanceVisible ? "Ocultar saldos" : "Mostrar saldos"}
          >
            {isBalanceVisible ? (
              <Eye size={18} className="text-[#999]" strokeWidth={1.5} />
            ) : (
              <EyeOff size={18} className="text-[#999]" strokeWidth={1.5} />
            )}
          </button>
        </div>

        {/* Opções de conta */}
        <div className="p-3 space-y-3">
          {/* Nos cards de conta */}
          {/* Conta Real */}
          <div
            className={`p-3 rounded-lg border ${
              selectedAccount === "real"
                ? "border-[rgb(1,219,151)] bg-[rgb(1,219,151)]/5"
                : "border-[#2a2a2a] bg-[#1a1a1a]"
            } transition-colors duration-200 cursor-pointer`}
            onClick={() => onSelectAccount("real")}
          >
            <div className="flex items-center mb-1">
              <div
                className={`w-4 h-4 rounded-full mr-2 border-2 ${
                  selectedAccount === "real"
                    ? "border-[rgb(1,219,151)] bg-[rgb(1,219,151)]"
                    : "border-[#2a2a2a] bg-transparent"
                }`}
              />
              <div className="text-sm font-medium text-[rgb(1,219,151)]">
                Conta Real
              </div>
            </div>
            {/* INTEGRAÇÃO DB: Substituir por saldo real do usuário do banco de dados */}
            <div className="text-xl font-bold mb-1">
              {isBalanceVisible ? formatCurrency(realBalance) : "••••••"}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-[#999]">Negocie com saldo real</div>
              <button className="bg-[rgb(8,134,90)] text-white text-xs py-1.5 px-3 rounded transition-colors duration-200 hover:bg-[rgb(7,115,77)]">
                Depositar
              </button>
            </div>
          </div>

          {/* Conta Demo */}
          <div
            className={`p-3 rounded-lg border ${
              selectedAccount === "demo"
                ? "border-[rgb(204,2,77)] bg-[rgb(204,2,77)]/5"
                : "border-[#2a2a2a] bg-[#1a1a1a]"
            } transition-colors duration-200 cursor-pointer`}
            onClick={() => onSelectAccount("demo")}
          >
            <div className="flex items-center mb-1">
              <div
                className={`w-4 h-4 rounded-full mr-2 border-2 ${
                  selectedAccount === "demo"
                    ? "border-[rgb(204,2,77)] bg-[rgb(204,2,77)]"
                    : "border-[#2a2a2a] bg-transparent"
                }`}
              />
              <div className="text-sm font-medium text-[rgb(204,2,77)]">
                Conta Demo
              </div>
            </div>
            {/* INTEGRAÇÃO DB: Substituir por saldo demo do usuário do banco de dados */}
            <div className="text-xl font-bold mb-1">
              {isBalanceVisible ? formatCurrency(demoBalance) : "••••••"}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-[#999]">
                Treine com saldo fictício
              </div>
              <button
                className="bg-[rgb(204,2,77)] text-white text-xs py-1.5 px-3 rounded transition-colors duration-200 hover:bg-[rgb(180,2,70)]"
                onClick={(e) => {
                  e.stopPropagation();
                  // INTEGRAÇÃO DB: Substituir por chamada à API para recarregar a conta demo
                  handleReloadDemoAccount();
                }}
              >
                Recarregar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
