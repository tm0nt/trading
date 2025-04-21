"use client";

import { useEffect, useRef } from "react";
import {
  X,
  TrendingUp,
  TrendingDown,
  Clock,
  BarChart2,
  DollarSign,
  Hash,
} from "lucide-react";
import type { OperationResult } from "@/store/account-store";

interface OperationDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  operation: OperationResult;
}

export default function OperationDetailsModal({
  isOpen,
  onClose,
  operation,
}: OperationDetailsProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Fechar o modal ao clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevenir scroll do body quando o modal estiver aberto
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  // Fechar o modal ao pressionar ESC
  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Formatar o par de trading para exibição
  const formattedAsset = operation.asset.replace(
    /([A-Z]+)([A-Z][a-z]+)/g,
    "$1/$2",
  );

  // Formatar valor para exibição
  const formatCurrency = (value: number) => {
    return value
      .toLocaleString("pt-BR", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
      })
      .replace("US$", "$");
  };

  // Determinar se o resultado foi positivo ou negativo
  const isWin = operation.result === "win";

  // Calcular o valor do resultado
  const resultValue = isWin
    ? operation.profit || operation.value * 0.9
    : operation.value;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div
        ref={modalRef}
        className="bg-gradient-to-b from-[#151515] to-[#0c0c0c] border border-[#2a2a2a] rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        {/* Header com gradiente sutil */}
        <div className="relative bg-gradient-to-r from-[#121212] to-[#0a0a0a] p-5 border-b border-[#2a2a2a]">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#2a2a2a] to-transparent opacity-50"></div>

          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium tracking-wide">
              Detalhes da Operação
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#2a2a2a] transition-all duration-200 text-[#999] hover:text-white"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Card principal com tipo de operação */}
          <div
            className={`relative overflow-hidden rounded-xl p-5 ${
              operation.type === "buy"
                ? "bg-gradient-to-br from-[#081f16] to-[#051510] border border-[rgba(1,219,151,0.2)]"
                : "bg-gradient-to-br from-[#1f0812] to-[#150510] border border-[rgba(204,2,77,0.2)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[#999] text-sm mb-1">Par comercial</span>
                <span className="text-xl font-medium tracking-wide">
                  {formattedAsset}
                </span>
              </div>

              <div
                className={`flex flex-col items-end ${
                  operation.type === "buy"
                    ? "text-[rgb(1,219,151)]"
                    : "text-[rgb(204,2,77)]"
                }`}
              >
                <div className="flex items-center mb-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center mr-2 ${
                      operation.type === "buy"
                        ? "bg-[rgba(1,219,151,0.15)]"
                        : "bg-[rgba(204,2,77,0.15)]"
                    }`}
                  >
                    {operation.type === "buy" ? (
                      <TrendingUp size={16} />
                    ) : (
                      <TrendingDown size={16} />
                    )}
                  </div>
                  <span className="font-medium tracking-wide">
                    {operation.type === "buy" ? "Compra" : "Venda"}
                  </span>
                </div>
                <span className="text-lg font-bold">
                  {formatCurrency(operation.value)}
                </span>
              </div>
            </div>

            {/* Elemento decorativo */}
            <div
              className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-10 ${
                operation.type === "buy"
                  ? "bg-[rgb(1,219,151)]"
                  : "bg-[rgb(204,2,77)]"
              }`}
            ></div>
          </div>

          {/* Resultado da operação */}
          <div className="bg-[#121212] p-4 rounded-xl border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors duration-200">
            <div className="flex items-center mb-2 text-[#999]">
              <DollarSign size={14} className="mr-2" />
              <span className="text-xs">Resultado</span>
            </div>
            <div
              className={`font-medium ${isWin ? "text-[rgb(1,219,151)]" : "text-[rgb(204,2,77)]"}`}
            >
              {isWin ? "Ganho" : "Perda"}: {isWin ? "+" : "-"}
              {formatCurrency(resultValue)}
            </div>
          </div>

          {/* Seção de tempo */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-[#999] uppercase tracking-wider px-1">
              Tempo
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#121212] p-4 rounded-xl border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors duration-200">
                <div className="flex items-center mb-2 text-[#999]">
                  <Clock size={14} className="mr-2" />
                  <span className="text-xs">Entrada</span>
                </div>
                <div className="font-medium">
                  {operation.entryTime.split(" ")[1]}
                </div>
              </div>

              <div className="bg-[#121212] p-4 rounded-xl border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors duration-200">
                <div className="flex items-center mb-2 text-[#999]">
                  <Clock size={14} className="mr-2" />
                  <span className="text-xs">Expiração</span>
                </div>
                <div className="font-medium">
                  {operation.expiryTime.split(" ")[1]}
                </div>
              </div>
            </div>

            <div className="bg-[#121212] p-4 rounded-xl border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors duration-200">
              <div className="flex items-center mb-2 text-[#999]">
                <BarChart2 size={14} className="mr-2" />
                <span className="text-xs">Timeframe</span>
              </div>
              <div className="font-medium">{operation.timeframe}</div>
            </div>
          </div>

          {/* Seção de preços */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-[#999] uppercase tracking-wider px-1">
              Preços
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#121212] p-4 rounded-xl border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors duration-200">
                <div className="flex items-center mb-2 text-[#999]">
                  <DollarSign size={14} className="mr-2" />
                  <span className="text-xs">Abertura</span>
                </div>
                <div className="font-medium">{operation.openPrice}</div>
              </div>

              <div className="bg-[#121212] p-4 rounded-xl border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors duration-200">
                <div className="flex items-center mb-2 text-[#999]">
                  <DollarSign size={14} className="mr-2" />
                  <span className="text-xs">Fechamento</span>
                </div>
                <div className="font-medium">{operation.closePrice}</div>
              </div>
            </div>
          </div>

          {/* ID da operação */}
          <div className="mt-4 pt-4 border-t border-[#1a1a1a]">
            <div className="flex items-center text-[#666] text-xs">
              <Hash size={12} className="mr-1" />
              <span className="font-mono">{operation.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
