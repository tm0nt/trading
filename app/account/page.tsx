"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/header";
import AccountSidebar from "@/components/account-sidebar";
import AccountMobileSelector from "@/components/account-mobile-selector";
import VisaoGeralSection from "@/components/account-sections/visao-geral";
import HistoricoSection from "@/components/account-sections/historico";
import DepositarSection from "@/components/account-sections/depositar";
import SacarSection from "@/components/account-sections/sacar";
import SegurancaSection from "@/components/account-sections/seguranca";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ToastContainer } from "@/components/ui/toast";

export default function AccountPage() {
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get("section");
  const [activeSection, setActiveSection] = useState("visao-geral");
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Atualizar a seção ativa com base no parâmetro da URL
  useEffect(() => {
    if (sectionParam) {
      setActiveSection(sectionParam);
    }
  }, [sectionParam]);

  const renderSection = () => {
    switch (activeSection) {
      case "visao-geral":
        return <VisaoGeralSection />;
      case "historico":
        return <HistoricoSection />;
      case "depositar":
        return <DepositarSection />;
      case "sacar":
        return <SacarSection />;
      case "seguranca":
        return <SegurancaSection />;
      default:
        return <VisaoGeralSection />;
    }
  };

  // Função para atualizar a URL quando a seção mudar
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    // Atualizar a URL sem recarregar a página
    const url = new URL(window.location.href);
    url.searchParams.set("section", section);
    window.history.pushState({}, "", url);
  };

  return (
    <ToastContainer>
      <main className="flex flex-col min-h-screen bg-[#0a0a0a] text-white theme-transition">
        <Header showTradingPair={false} />

        <div className="flex-1 flex p-4 md:p-6 gap-6">
          {/* Sidebar em desktop com margens */}
          {!isMobile && (
            <div className="w-64 flex-shrink-0">
              <AccountSidebar
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
              />
            </div>
          )}

          <div className="flex-1">
            {/* Seletor em mobile */}
            {isMobile && (
              <div className="mb-4">
                <AccountMobileSelector
                  activeSection={activeSection}
                  onSectionChange={handleSectionChange}
                />
              </div>
            )}

            {renderSection()}
          </div>
        </div>
      </main>
    </ToastContainer>
  );
}
