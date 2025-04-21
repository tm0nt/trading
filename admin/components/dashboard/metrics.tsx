"use client";

import { ArrowUpIcon, UsersIcon, Clock, DollarSign } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedCard } from "@/components/ui/animated-card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { useState, useEffect } from "react";

interface BalanceData {
  mesAtual: {
    totalDepositado: number;
    totalSaquePagos: number;
    clientesCadastrados: number;
    SaquesPendentes: number;
  };
  mesPassado: {
    totalDepositado: number;
    totalSaquePagos: number;
    clientesCadastrados: number;
    SaquesPendentes: number;
  };
}

export function DashboardMetrics() {
  const [metrics, setMetrics] = useState<BalanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/balance");
        if (!response.ok) {
          throw new Error("Erro ao carregar dados");
        }
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Calcular variação percentual
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  if (error) {
    return (
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <AnimatedCard className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </AnimatedCard>
      </div>
    );
  }

  if (!metrics && isLoading) {
    return (
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <AnimatedCard key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 w-24 bg-muted/20 rounded"></div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-7 w-32 bg-muted/20 rounded"></div>
              <div className="mt-2 h-3 w-40 bg-muted/20 rounded"></div>
            </CardContent>
          </AnimatedCard>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  // Calcular todas as variações percentuais
  const depositPercentage = calculatePercentageChange(
    metrics.mesAtual.totalDepositado,
    metrics.mesPassado.totalDepositado,
  );
  const withdrawalPercentage = calculatePercentageChange(
    metrics.mesAtual.totalSaquePagos,
    metrics.mesPassado.totalSaquePagos,
  );
  const clientsPercentage = calculatePercentageChange(
    metrics.mesAtual.clientesCadastrados,
    metrics.mesPassado.clientesCadastrados,
  );
  const pendingPercentage = calculatePercentageChange(
    metrics.mesAtual.SaquesPendentes,
    metrics.mesPassado.SaquesPendentes,
  );

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      <AnimatedCard
        className={`stagger-item stagger-delay-1 overflow-hidden border-border/30 shadow-card-dark transition-all hover:-translate-y-1 dark-glow`}
        glowEffect={true}
        tiltEffect={true}
        intensity="subtle"
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-br from-primary/10 to-transparent">
          <CardTitle className="text-sm font-medium">
            Total de Depósitos
          </CardTitle>
          <div className="rounded-full bg-primary/10 p-2 text-primary icon-glow">
            <DollarSign className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold text-glow">
            <AnimatedCounter
              value={metrics.mesAtual.totalDepositado}
              formatValue={formatCurrency}
            />
          </div>
          <div
            className={`mt-1 flex items-center text-xs ${depositPercentage >= 0 ? "text-success" : "text-destructive"}`}
          >
            {depositPercentage >= 0 ? (
              <ArrowUpIcon className="mr-1 h-3 w-3" />
            ) : (
              <ArrowUpIcon className="mr-1 h-3 w-3 rotate-180" />
            )}
            <span>
              {Math.abs(depositPercentage).toFixed(1)}% em relação ao mês
              anterior
            </span>
          </div>
        </CardContent>
      </AnimatedCard>

      <AnimatedCard
        className={`stagger-item stagger-delay-2 overflow-hidden border-border/30 shadow-card-dark transition-all hover:-translate-y-1 dark-glow`}
        glowEffect={true}
        tiltEffect={true}
        intensity="subtle"
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-br from-info/10 to-transparent">
          <CardTitle className="text-sm font-medium">Total de Saques</CardTitle>
          <div className="rounded-full bg-info/10 p-2 text-info icon-glow">
            <ArrowUpIcon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold text-glow">
            <AnimatedCounter
              value={metrics.mesAtual.totalSaquePagos}
              formatValue={formatCurrency}
            />
          </div>
          <div
            className={`mt-1 flex items-center text-xs ${withdrawalPercentage >= 0 ? "text-info" : "text-destructive"}`}
          >
            {withdrawalPercentage >= 0 ? (
              <ArrowUpIcon className="mr-1 h-3 w-3" />
            ) : (
              <ArrowUpIcon className="mr-1 h-3 w-3 rotate-180" />
            )}
            <span>
              {Math.abs(withdrawalPercentage).toFixed(1)}% em relação ao mês
              anterior
            </span>
          </div>
        </CardContent>
      </AnimatedCard>

      <AnimatedCard
        className={`stagger-item stagger-delay-3 overflow-hidden border-border/30 shadow-card-dark transition-all hover:-translate-y-1 dark-glow`}
        glowEffect={true}
        tiltEffect={true}
        intensity="subtle"
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-br from-success/10 to-transparent">
          <CardTitle className="text-sm font-medium">
            Clientes Cadastrados
          </CardTitle>
          <div className="rounded-full bg-success/10 p-2 text-success icon-glow">
            <UsersIcon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold text-glow">
            <AnimatedCounter value={metrics.mesAtual.clientesCadastrados} />
          </div>
          <div
            className={`mt-1 flex items-center text-xs ${clientsPercentage >= 0 ? "text-success" : "text-destructive"}`}
          >
            {clientsPercentage >= 0 ? (
              <ArrowUpIcon className="mr-1 h-3 w-3" />
            ) : (
              <ArrowUpIcon className="mr-1 h-3 w-3 rotate-180" />
            )}
            <span>
              {Math.abs(clientsPercentage).toFixed(1)}% em relação ao mês
              anterior
            </span>
          </div>
        </CardContent>
      </AnimatedCard>

      <AnimatedCard
        className={`stagger-item stagger-delay-4 overflow-hidden border-border/30 shadow-card-dark transition-all hover:-translate-y-1 dark-glow`}
        glowEffect={true}
        tiltEffect={true}
        intensity="subtle"
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-br from-warning/10 to-transparent">
          <CardTitle className="text-sm font-medium">
            Saques Pendentes
          </CardTitle>
          <div className="rounded-full bg-warning/10 p-2 text-warning icon-glow">
            <Clock className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold text-glow">
            <AnimatedCounter value={metrics.mesAtual.SaquesPendentes} />
          </div>
          <div
            className={`mt-1 flex items-center text-xs ${pendingPercentage >= 0 ? "text-warning" : "text-success"}`}
          >
            {pendingPercentage >= 0 ? (
              <ArrowUpIcon className="mr-1 h-3 w-3" />
            ) : (
              <ArrowUpIcon className="mr-1 h-3 w-3 rotate-180" />
            )}
            <span>
              {Math.abs(pendingPercentage).toFixed(1)}% em relação ao mês
              anterior
            </span>
          </div>
        </CardContent>
      </AnimatedCard>
    </div>
  );
}
