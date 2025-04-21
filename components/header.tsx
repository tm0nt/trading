"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Wallet, User, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProfileDropdown from "./profile-dropdown";
import AccountDropdown from "./account-dropdown";
import TradingPairDropdown from "./trading-pair-dropdown";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useAccountStore } from "@/store/account-store";
import EbinexLogoImg from "./ebinex-logo-img";

interface HeaderProps {
  selectedTradingPair?: string;
  onSelectTradingPair?: (pair: string) => void;
  showTradingPair?: boolean;
}

export default function Header({
  selectedTradingPair = "XRP/USDT",
  onSelectTradingPair,
  showTradingPair = false,
}: HeaderProps) {
  const pathname = usePathname();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isTradingPairDropdownOpen, setIsTradingPairDropdownOpen] =
    useState(false);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const tradingPairTriggerRef = useRef<HTMLDivElement>(null);
  const accountTriggerRef = useRef<HTMLDivElement>(null);
  const profileTriggerRef = useRef<HTMLDivElement>(null);

  const [tradingPairTriggerRect, setTradingPairTriggerRect] =
    useState<DOMRect | null>(null);
  const [accountTriggerRect, setAccountTriggerRect] = useState<DOMRect | null>(
    null,
  );
  const [profileTriggerRect, setProfileTriggerRect] = useState<DOMRect | null>(
    null,
  );

  const {
    demoBalance,
    realBalance,
    selectedAccount,
    setSelectedAccount,
    syncBalances,
    profilePicture,
  } = useAccountStore();

  useEffect(() => {
    syncBalances();
    const savedBalanceVisibility = localStorage.getItem("balanceVisibility");
    if (savedBalanceVisibility !== null) {
      setIsBalanceVisible(savedBalanceVisibility === "true");
    }
  }, [syncBalances]);

  const formatCurrency = (value: number) => {
    if (isNaN(value)) {
      return "R$ 0,00";
    }
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const toggleProfileDropdown = () => {
    if (profileTriggerRef.current) {
      setProfileTriggerRect(profileTriggerRef.current.getBoundingClientRect());
    }
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
    if (isAccountDropdownOpen) setIsAccountDropdownOpen(false);
    if (isTradingPairDropdownOpen) setIsTradingPairDropdownOpen(false);
  };

  const toggleAccountDropdown = () => {
    if (accountTriggerRef.current) {
      setAccountTriggerRect(accountTriggerRef.current.getBoundingClientRect());
    }
    setIsAccountDropdownOpen(!isAccountDropdownOpen);
    if (isProfileDropdownOpen) setIsProfileDropdownOpen(false);
    if (isTradingPairDropdownOpen) setIsTradingPairDropdownOpen(false);
  };

  const toggleTradingPairDropdown = () => {
    if (tradingPairTriggerRef.current) {
      setTradingPairTriggerRect(
        tradingPairTriggerRef.current.getBoundingClientRect(),
      );
    }
    setIsTradingPairDropdownOpen(!isTradingPairDropdownOpen);
    if (isProfileDropdownOpen) setIsProfileDropdownOpen(false);
    if (isAccountDropdownOpen) setIsAccountDropdownOpen(false);
  };

  const closeProfileDropdown = () => {
    setIsProfileDropdownOpen(false);
  };

  const closeAccountDropdown = () => {
    setIsAccountDropdownOpen(false);
  };

  const closeTradingPairDropdown = () => {
    setIsTradingPairDropdownOpen(false);
  };

  const toggleBalanceVisibility = () => {
    const newVisibility = !isBalanceVisible;
    setIsBalanceVisible(newVisibility);
    localStorage.setItem("balanceVisibility", newVisibility.toString());
  };

  const handleSelectAccount = (type: "demo" | "real") => {
    setSelectedAccount(type);
    closeAccountDropdown();
  };

  const handleSelectTradingPair = (pair: string) => {
    if (onSelectTradingPair) {
      onSelectTradingPair(pair);
    }
    closeTradingPairDropdown();
  };

  const getBalance = () => {
    return selectedAccount === "demo" ? demoBalance : realBalance;
  };

  const getAccountColor = () => {
    return selectedAccount === "demo"
      ? "text-[rgb(204,2,77)]"
      : "text-[rgb(1,219,151)]";
  };

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

    const color = colors[selectedTradingPair] || "#3b82f6";
    const symbol = selectedTradingPair.split("/")[0];

    return (
      <div
        className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px]"
        style={{ backgroundColor: color }}
      >
        {symbol.charAt(0)}
      </div>
    );
  };

  // Verifica se está na rota /account
  const isAccountPage = pathname === "/account";

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-[#121212] border-b border-[#2a2a2a] relative theme-transition">
      {/* Left side - logo and trading pair */}
      <div className="flex items-center">
        {/* Logo */}
        <div className="mr-4">
          <EbinexLogoImg width={32} height={32} />
        </div>

        {/* Back arrow (mobile only when in account page) */}
        {isMobile && isAccountPage && (
          <Link href="/" className="mr-3 flex items-center">
            <ArrowLeft size={18} className="text-gray-300" />
          </Link>
        )}

        {/* Trading pair (desktop) or Traderoom (desktop) */}
        {(
          <>
            {showTradingPair ? (
              <div className="relative mr-4">
                <div
                  ref={tradingPairTriggerRef}
                  className="flex items-center bg-[#1e2c38] border border-[#2a2a2a] rounded px-3 py-1.5 cursor-pointer hover:bg-[#1a2530] transition-colors"
                  onClick={toggleTradingPairDropdown}
                >
                  <div className="flex items-center text-xs">
                    <span className="text-[rgb(1,219,151)] mr-1">
                      {renderTradingPairLogo()}
                    </span>
                    <span className="font-semibold">{selectedTradingPair}</span>
                    <ChevronDown size={16} className="ml-1 text-[#666]" />
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/trading"
                className="flex items-center bg-[#1e2c38] border border-[#2a2a2a] rounded px-3 py-1.5 hover:bg-[#1a2530] transition-colors mr-4"
              >
                <div className="flex items-center text-xs">
                  <ArrowLeft size={14} className="mr-1" />
                  <span className="font-semibold">Traderoom</span>
                </div>
              </Link>
            )}
          </>
        )}
      </div>

      {/* Right side - balance and profile */}
      <div className="flex items-center">
        {/* Balance (visible on mobile only when not in account page) */}
        {(!isMobile || !isAccountPage) && (
          <div
            ref={accountTriggerRef}
            className="text-right mr-3 cursor-pointer"
            onClick={toggleAccountDropdown}
          >
            <div className={`text-xs flex items-center ${getAccountColor()}`}>
              {selectedAccount === "demo" ? "Conta Demo" : "Conta Real"}{" "}
              <ChevronDown size={14} className="ml-1" />
            </div>
            <div className="font-semibold">
              {isBalanceVisible ? formatCurrency(getBalance()) : "••••••"}
            </div>
          </div>
        )}

        {/* Deposit button (mobile only when not in account page) */}
        {!isAccountPage && (
        <Link
        href="/account?section=depositar"
        className="bg-[rgb(8,134,90)] hover:bg-[rgb(7,115,77)] text-white py-2 px-3 rounded flex items-center mr-3 transition-colors duration-200 wallet-button"
      >
        <Wallet size={20} strokeWidth={1.5} className="text-white" style={{ color: "white" }} />
        {!isMobile && <span className="ml-2 font-medium text-white">Depositar</span>}
      </Link>
        )}

        {/* Profile picture */}
        <div
          ref={profileTriggerRef}
          className="w-8 h-8 rounded-full bg-black flex items-center justify-center cursor-pointer hover:shadow-glow transition-shadow duration-300 overflow-hidden"
          onClick={toggleProfileDropdown}
        >
          {profilePicture ? (
            <img
              src={profilePicture}
              alt="Foto de perfil"
              className="w-full h-full object-cover"
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
      </div>

      {/* Trading pair row (mobile only when showTradingPair=true) */}
      {showTradingPair && isMobile && (
        <div className="absolute top-full left-0 right-0 bg-[#121212] border-t border-[#2a2a2a] px-4 py-2">
          <div className="relative">
            <div
              ref={tradingPairTriggerRef}
              className="flex items-center bg-[#1e2c38] border border-[#2a2a2a] rounded px-3 py-1.5 cursor-pointer hover:bg-[#1a2530] transition-colors"
              onClick={toggleTradingPairDropdown}
            >
              <div className="flex items-center text-xs">
                <span className="text-[rgb(1,219,151)] mr-1">
                  {renderTradingPairLogo()}
                </span>
                <span className="font-semibold">{selectedTradingPair}</span>
                <ChevronDown size={16} className="ml-1 text-[#666]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dropdowns */}
      <ProfileDropdown
        isOpen={isProfileDropdownOpen}
        onClose={closeProfileDropdown}
        isMobile={isMobile}
        triggerRect={profileTriggerRect}
      />
      <AccountDropdown
        isOpen={isAccountDropdownOpen}
        onClose={closeAccountDropdown}
        onToggleBalanceVisibility={toggleBalanceVisibility}
        isBalanceVisible={isBalanceVisible}
        onSelectAccount={handleSelectAccount}
        selectedAccount={selectedAccount}
        triggerRect={accountTriggerRect}
      />
      {showTradingPair && (
        <TradingPairDropdown
          isOpen={isTradingPairDropdownOpen}
          onClose={closeTradingPairDropdown}
          onSelectPair={handleSelectTradingPair}
          selectedPair={selectedTradingPair}
          triggerRect={tradingPairTriggerRect}
        />
      )}
    </header>
  );
}