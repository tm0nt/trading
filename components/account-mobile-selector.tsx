"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface AccountMobileSelectorProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function AccountMobileSelector({
  activeSection,
  onSectionChange,
}: AccountMobileSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: "visao-geral", label: "Visão geral" },
    { id: "historico", label: "Histórico" },
    { id: "depositar", label: "Depositar" },
    { id: "sacar", label: "Sacar" },
    { id: "seguranca", label: "Segurança" },
  ];

  const activeItem =
    menuItems.find((item) => item.id === activeSection) || menuItems[0];

  const handleSelect = (id: string) => {
    onSectionChange(id);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <button
        className="w-full flex items-center justify-between p-3 bg-[#1a1a1a] rounded-md border border-[#2a2a2a]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{activeItem.label}</span>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md overflow-hidden z-10">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`w-full text-left p-3 hover:bg-[#222] transition-colors ${
                item.id === activeSection
                  ? "bg-[#222] text-[rgb(1,219,151)]"
                  : ""
              }`}
              onClick={() => handleSelect(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
