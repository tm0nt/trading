"use client";
import { User, History, Wallet, CreditCard, Shield } from "lucide-react";

interface AccountSidebarProps {
  activeSection: string;
  onSectionChange?: (section: string) => void;
}

export default function AccountSidebar({
  activeSection,
  onSectionChange,
}: AccountSidebarProps) {
  const menuItems = [
    { id: "visao-geral", label: "Visão geral", icon: User },
    { id: "historico", label: "Histórico", icon: History },
    { id: "depositar", label: "Depositar", icon: Wallet },
    { id: "sacar", label: "Sacar", icon: CreditCard },
    { id: "seguranca", label: "Segurança", icon: Shield },
  ];

  return (
    <div className="bg-[#121212] border border-[#2a2a2a] rounded-lg h-full overflow-hidden">
      <div className="p-4 border-b border-[#2a2a2a]">
        <h2 className="text-lg font-semibold">Minha conta</h2>
      </div>
      <div className="py-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`w-full flex items-center px-4 py-3 hover:bg-[#1a1a1a] transition-colors ${
              activeSection === item.id
                ? "bg-[#1a1a1a] border-l-2 border-[rgb(1,219,151)]"
                : "border-l-2 border-transparent"
            }`}
            onClick={() => onSectionChange && onSectionChange(item.id)}
          >
            <item.icon
              size={18}
              className={`mr-3 ${activeSection === item.id ? "text-[rgb(1,219,151)]" : "text-[#999]"}`}
            />
            <span
              className={
                activeSection === item.id ? "text-white" : "text-[#999]"
              }
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
