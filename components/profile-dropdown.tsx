"use client";

import type React from "react";
import { useRef, useEffect, useState } from "react";
import {
  User,
  History,
  Wallet,
  CreditCard,
  LogOut,
  ChevronRight,
  Shield,
  Sun,
  Moon,
  Copy,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/theme-context";
import { useAccountStore } from "@/store/account-store";
import { accountService } from "@/lib/services/account-service";

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
  triggerRect?: DOMRect | null;
}

export default function ProfileDropdown({
  isOpen,
  onClose,
  isMobile = false,
  triggerRect,
}: ProfileDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

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

  // Defina um estado para saber se está no lado do cliente
  const [isClient, setIsClient] = useState(false);
  const { realBalance, user, name, profilePicture } = useAccountStore();

  useEffect(() => {
    // Verifique se está no lado do cliente
    setIsClient(typeof window !== "undefined");
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

  // Função para copiar o ID para a área de transferência
  const copyIdToClipboard = (user: string) => {
    navigator.clipboard.writeText(user).then(() => {
      alert("ID copiado para a área de transferência!");
    });
  };

  // Função para navegar para uma seção específica
  const navigateToSection = (section: string) => {
    router.push(`/account?section=${section}`);
    onClose();
  };

  // Calcular posição do dropdown com base no elemento que foi clicado
  const getDropdownStyle = () => {
    if (!triggerRect) return {};

    // Em desktop, posicionar abaixo do elemento clicado
    return {
      position: "absolute",
      top: `${triggerRect.bottom + window.scrollY}px`,
      right: `${window.innerWidth - triggerRect.right - window.scrollX}px`,
    } as React.CSSProperties;
  };

  // Apenas renderize a lógica de window quando no cliente
  if (!isClient) return null;

  return (
    <div
      className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-200 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        ref={dropdownRef}
        className={`z-50 bg-gradient-to-b from-[#151515] to-[#121212] border border-[#2a2a2a] rounded-lg shadow-xl overflow-hidden transition-all duration-300 ease-out theme-transition ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        style={{
          // Em mobile, posição fixa
          ...(isClient && window.innerWidth < 768
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
                width: "18rem",
              }),
        }}
      >
        {/* No header do dropdown, onde mostra as informações do usuário */}
        <div className="p-4 border-b border-[#2a2a2a] bg-[#151515] theme-transition">
          <div className="flex items-center space-x-3 mb-3">
            {/* Avatar do usuário */}
            <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center profile-avatar">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "";
                    target.className = "hidden";
                  }}
                />
              ) : (
                <User size={18} className="text-white" strokeWidth={1.5} />
              )}
            </div>
            <div>
              <div className="text-base font-semibold capitalize">
                {name?.split(" ").slice(0, 2).join(" ")}
              </div>
              <div className="flex items-center mt-1">
                <div className="text-xs text-[#999]">ID: {user}</div>
                <button
                  onClick={user ? () => copyIdToClipboard(user) : undefined}
                  className="ml-2 p-1 hover:bg-[#2a2a2a] rounded-full transition-colors duration-200"
                >
                  <Copy size={12} className="text-[#999]" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-lg p-3 flex justify-between items-center theme-transition">
            <div>
              <div className="text-xs text-[#999]">Saldo disponível</div>
              {/* INTEGRAÇÃO DB: Substituir por saldo real do usuário do banco de dados */}
              <div className="text-lg font-bold text-[rgb(1,219,151)]">
                {formatCurrency(realBalance)}
              </div>
            </div>
            <div className="bg-[rgb(8,134,90)] p-1.5 rounded-full">
              <Wallet
                size={18}
                className="text-white"
                strokeWidth={1.5}
                style={{ color: "white" }}
              />
            </div>
          </div>
        </div>

        {/* Corpo do dropdown com as opções */}
        <div className="p-3">
          <div className="space-y-2">
            {/* Opção Minha Conta */}
            <button
              className="w-full flex items-center justify-between p-3 rounded-lg bg-[#1a1a1a] hover:bg-[#222] transition-colors duration-200 group border border-transparent hover:border-[#2a2a2a] theme-transition menu-button"
              onClick={() => navigateToSection("visao-geral")}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center mr-3 group-hover:bg-[rgb(1,219,151)]/10 transition-colors duration-200 theme-transition dropdown-icon">
                  <User
                    className="text-[rgb(1,219,151)] group-hover:scale-110 transition-transform duration-200"
                    size={18}
                    strokeWidth={1.5}
                  />
                </div>
                <span className="text-sm font-medium">Minha conta</span>
              </div>
              <ChevronRight
                size={16}
                className="text-[#666] group-hover:text-[#999] transition-colors duration-200"
              />
            </button>

            {/* Opção Histórico */}
            <button
              className="w-full flex items-center justify-between p-3 rounded-lg bg-[#1a1a1a] hover:bg-[#222] transition-colors duration-200 group border border-transparent hover:border-[#2a2a2a] theme-transition"
              onClick={() => navigateToSection("historico")}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center mr-3 group-hover:bg-[rgb(1,219,151)]/10 transition-colors duration-200 theme-transition dropdown-icon">
                  <History
                    className="text-[rgb(1,219,151)] group-hover:scale-110 transition-transform duration-200"
                    size={18}
                    strokeWidth={1.5}
                  />
                </div>
                <span className="text-sm font-medium">Histórico</span>
              </div>
              <ChevronRight
                size={16}
                className="text-[#666] group-hover:text-[#999] transition-colors duration-200"
              />
            </button>

            {/* Opção Depositar */}
            <button
              className="w-full flex items-center justify-between p-3 rounded-lg bg-[#1a1a1a] hover:bg-[#222] transition-colors duration-200 group border border-transparent hover:border-[#2a2a2a] theme-transition"
              onClick={() => navigateToSection("depositar")}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center mr-3 group-hover:bg-[rgb(1,219,151)]/10 transition-colors duration-200 theme-transition dropdown-icon">
                  <Wallet
                    className="text-[rgb(1,219,151)] group-hover:scale-110 transition-transform duration-200"
                    size={18}
                    strokeWidth={1.5}
                  />
                </div>
                <span className="text-sm font-medium">Depositar</span>
              </div>
              <ChevronRight
                size={16}
                className="text-[#666] group-hover:text-[#999] transition-colors duration-200"
              />
            </button>

            {/* Opção Sacar */}
            <button
              className="w-full flex items-center justify-between p-3 rounded-lg bg-[#1a1a1a] hover:bg-[#222] transition-colors duration-200 group border border-transparent hover:border-[#2a2a2a] theme-transition"
              onClick={() => navigateToSection("sacar")}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center mr-3 group-hover:bg-[rgb(1,219,151)]/10 transition-colors duration-200 theme-transition dropdown-icon">
                  <CreditCard
                    className="text-[rgb(1,219,151)] group-hover:scale-110 transition-transform duration-200"
                    size={18}
                    strokeWidth={1.5}
                  />
                </div>
                <span className="text-sm font-medium">Sacar</span>
              </div>
              <ChevronRight
                size={16}
                className="text-[#666] group-hover:text-[#999] transition-colors duration-200"
              />
            </button>

            {/* Opção Segurança */}
            <button
              className="w-full flex items-center justify-between p-3 rounded-lg bg-[#1a1a1a] hover:bg-[#222] transition-colors duration-200 group border border-transparent hover:border-[#2a2a2a] theme-transition"
              onClick={() => navigateToSection("seguranca")}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center mr-3 group-hover:bg-[rgb(1,219,151)]/10 transition-colors duration-200 theme-transition dropdown-icon">
                  <Shield
                    className="text-[rgb(1,219,151)] group-hover:scale-110 transition-transform duration-200"
                    size={18}
                    strokeWidth={1.5}
                  />
                </div>
                <span className="text-sm font-medium">Segurança</span>
              </div>
              <ChevronRight
                size={16}
                className="text-[#666] group-hover:text-[#999] transition-colors duration-200"
              />
            </button>

            {/* Theme Toggle Button */}
            <button
              className="w-full flex items-center justify-between p-3 rounded-lg bg-[#1a1a1a] hover:bg-[#222] transition-colors duration-200 group border border-transparent hover:border-[#2a2a2a] theme-transition"
              onClick={toggleTheme}
            >
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    theme === "dark" ? "bg-[rgba(255,170,0,0.1)]" : "bg-black"
                  }`}
                  style={{
                    backgroundColor:
                      theme === "dark" ? "rgba(255,170,0,0.1)" : "black",
                  }}
                >
                  {theme === "dark" ? (
                    <Sun
                      className="text-[#ffaa00] group-hover:scale-110 transition-transform duration-200"
                      size={18}
                      strokeWidth={1.5}
                      style={{
                        color:
                          (theme as "light" | "dark") === "light"
                            ? "#ffffff"
                            : "#ffaa00",
                      }}
                    />
                  ) : (
                    <Moon
                      className="text-white group-hover:scale-110 transition-transform duration-200"
                      size={18}
                      strokeWidth={1.5}
                      style={{ color: "white" }}
                    />
                  )}
                </div>
                <span className="text-sm font-medium">
                  {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
                </span>
              </div>
              <div
                className={`relative w-10 h-5 rounded-full ${theme === "dark" ? "bg-[#333]" : "bg-[#ccc]"}`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300 ${
                    theme === "dark"
                      ? "left-0.5 bg-white"
                      : "left-5.5 bg-[rgb(1,219,151)]"
                  }`}
                ></div>
              </div>
            </button>
          </div>

          {/* No botão de Sair */}
          <div className="mt-4 pt-3 border-t border-[#2a2a2a]">
            <button
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[#1a1a1a] transition-colors duration-200 group theme-transition"
              onClick={async () => {
                try {
                  // 1. Faz a requisição para a API de logout
                  const response = await fetch("/api/auth/logout", {
                    method: "POST",
                    credentials: "include", // Importante para enviar os cookies
                  });

                  // 2. Redireciona para a página de auth após logout bem-sucedido
                  if (response.ok) {
                    window.location.href = "/auth";
                  } else {
                    console.error("Falha no logout:", await response.text());
                    window.location.href = "/auth"; // Redireciona mesmo em caso de erro
                  }
                } catch (error) {
                  console.error("Erro durante logout:", error);
                  window.location.href = "/auth"; // Redireciona em caso de erro na requisição
                }
              }}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-[rgb(204,2,77)]/10 flex items-center justify-center mr-3">
                  <LogOut
                    className="text-[rgb(204,2,77)] group-hover:scale-110 transition-transform duration-200"
                    size={18}
                    strokeWidth={1.5}
                  />
                </div>
                <span className="text-sm font-medium text-[rgb(204,2,77)]">
                  Sair
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
