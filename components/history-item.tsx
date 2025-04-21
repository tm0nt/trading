"use client";

import { useState } from "react";
import { ChevronDown, TrendingUp, TrendingDown } from "lucide-react";
import OperationDetailsModal from "./operation-details-modal";
import type { OperationResult } from "@/store/account-store";

interface HistoryItemProps {
  operation: OperationResult;
}

export default function HistoryItem({ operation }: HistoryItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Format currency to Brazilian Real
  const formatCurrency = (value: number) => {
    return value
      .toLocaleString("pt-BR", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      .replace("US$", "$");
  };

  // Determinar se o resultado foi positivo ou negativo
  const isPositiveResult = operation.result === "win";

  // Formatar o valor com sinal
  const formattedValue = isPositiveResult
    ? `+${formatCurrency(operation.profit || operation.value * 0.9)}`
    : `-${formatCurrency(operation.value)}`;

  return (
    <>
      <div className="flex items-center justify-between py-2 px-1 border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
        <div className="flex items-center">
          <button className="mr-2 text-[#999]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="flex flex-col">
            <span className="font-medium">{operation.asset}</span>
            <span className="text-xs text-[#999]">
              {operation.entryTime.split(" ")[1]} / {operation.timeframe}
            </span>
          </div>
        </div>

        <div className="flex items-center">
          {/* Ícone de candlestick */}
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center mr-1 ${
              operation.type === "buy"
                ? "bg-[rgba(1,219,151,0.2)]"
                : "bg-[rgba(204,2,77,0.2)]"
            }`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={
                operation.type === "buy"
                  ? "text-[rgb(1,219,151)]"
                  : "text-[rgb(204,2,77)]"
              }
            >
              <rect
                x="9"
                y="7"
                width="6"
                height="10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <line
                x1="12"
                y1="4"
                x2="12"
                y2="7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="12"
                y1="17"
                x2="12"
                y2="20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Ícone de seta */}
          {operation.type === "buy" ? (
            <TrendingUp size={16} className="text-[rgb(1,219,151)] mr-2" />
          ) : (
            <TrendingDown size={16} className="text-[rgb(204,2,77)] mr-2" />
          )}

          {/* Valor */}
          <span
            className={`font-medium mr-2 ${isPositiveResult ? "text-[rgb(1,219,151)]" : "text-[rgb(204,2,77)]"}`}
          >
            {formattedValue}
          </span>

          {/* Botão para abrir modal */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1 hover:bg-[#2a2a2a] rounded transition-colors"
          >
            <ChevronDown size={16} className="text-[#999]" />
          </button>
        </div>
      </div>

      <OperationDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        operation={operation}
      />
    </>
  );
}
