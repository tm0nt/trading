"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import ProfileDropdown from "./profile-dropdown";
import { useMediaQuery } from "@/hooks/use-media-query";
import EbinexLogo from "./ebinex-logo";

// Definindo as novas cores
const GREEN_COLOR = "rgb(8, 134, 90)";
const RED_COLOR = "rgb(204, 2, 77)";
const DEFAULT_GREEN = "rgb(1, 219, 151)";

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Format currency to Brazilian Real
  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-[#121212] border-b border-[#2a2a2a] relative">
      <div className="flex items-center">
        <div className="mr-4">
          <EbinexLogo width={32} height={32} showText={false} />
        </div>

        <div className="relative">
          <div className="flex items-center bg-[#1e2c38] border border-[#2a2a2a] rounded px-3 py-1.5 cursor-pointer">
            <div className="flex items-center text-xs">
              <span className="text-[rgb(1,219,151)] mr-1">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 4L4 8L12 12L20 8L12 4Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 16L12 20L20 16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 12L12 16L20 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="font-semibold">XRP/USDT</span>
              <ChevronDown size={16} className="ml-1 text-[#666]" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center">
        {/* Conta Demo */}
        <div className="text-right mr-3">
          <div className="text-[rgb(204,2,77)] text-xs flex items-center">
            Conta Demo <ChevronDown size={14} />
          </div>
          <div className="font-semibold">{formatCurrency(9985.2)}</div>
        </div>

        {/* Botão de depósito com ícone de carteira mais moderno */}
        <button className="bg-[rgb(8,134,90)] text-white py-2 px-3 rounded flex items-center mr-3">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 7.5V6.5C21 5.4 20.1 4.5 19 4.5H5C3.9 4.5 3 5.4 3 6.5V17.5C3 18.6 3.9 19.5 5 19.5H19C20.1 19.5 21 18.6 21 17.5V16.5"
              fill="currentColor"
            />
            <path
              d="M18 13.5C18.8284 13.5 19.5 12.8284 19.5 12C19.5 11.1716 18.8284 10.5 18 10.5C17.1716 10.5 16.5 11.1716 16.5 12C16.5 12.8284 17.1716 13.5 18 13.5Z"
              fill="white"
            />
            <path
              d="M22 9.5H16C15.4 9.5 15 9.9 15 10.5V13.5C15 14.1 15.4 14.5 16 14.5H22C22.6 14.5 23 14.1 23 13.5V10.5C23 9.9 22.6 9.5 22 9.5Z"
              fill="currentColor"
            />
          </svg>
          {!isMobile && <span className="ml-2 font-medium">Depositar</span>}
        </button>

        {/* Perfil */}
        <div
          className="w-8 h-8 rounded-full bg-white flex items-center justify-center cursor-pointer"
          onClick={toggleDropdown}
        >
          {/* Círculo de perfil único */}
        </div>
      </div>

      <ProfileDropdown
        isOpen={isDropdownOpen}
        onClose={closeDropdown}
        isMobile={isMobile}
      />
    </header>
  );
}
