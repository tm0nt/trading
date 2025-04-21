"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardMetrics } from "@/components/dashboard/metrics";
import { DashboardCharts } from "@/components/dashboard/charts";
import { MetricsChart } from "@/components/dashboard/metrics-chart";

// Chave para armazenar a sessão no localStorage
const SESSION_STORAGE_KEY = "admin_session";

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Verificar se o usuário está autenticado
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const session = localStorage.getItem(SESSION_STORAGE_KEY);
        if (!session) {
          // Se não houver sessão, redirecionar para a página de login
          router.push("/login");
        } else {
          // Definir autenticação como verdadeira
          setIsAuthenticated(true);
        }
      }
    };

    // Garantir que a verificação ocorra apenas no cliente
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      // Simular carregamento da página
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }, [isAuthenticated]);

  return (
    <div className="flex-1 space-y-8 p-6 md:p-8 pt-6 bg-[#101010] bg-pattern">
      <div className="flex items-center justify-between">
        <div className="stagger-item stagger-delay-1">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Bem-vindo ao seu painel de controle
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-[120px] rounded-lg border border-border/30 bg-[#141414] animate-pulse shimmer"
            />
          ))}
        </div>
      ) : (
        <DashboardMetrics />
      )}

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4 h-[350px] rounded-lg border border-border/30 bg-[#141414] animate-pulse shimmer" />
          <div className="col-span-3 h-[350px] rounded-lg border border-border/30 bg-[#141414] animate-pulse shimmer" />
        </div>
      ) : (
        <DashboardCharts />
      )}

      {isLoading ? (
        <div className="h-[350px] rounded-lg border border-border/30 bg-[#141414] animate-pulse shimmer" />
      ) : (
        <MetricsChart />
      )}
    </div>
  );
}
