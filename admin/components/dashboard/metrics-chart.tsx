"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Registrar os componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export function MetricsChart() {
  const [chartData, setChartData] = useState<any>(null);
  const [distributionData, setDistributionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const res = await fetch("/api/charts/transactions?period=mensal");
        const { formattedData, formattedDistribution } = await res.json();

        const labels = formattedData.map((item: any) => item.date);
        const deposits = formattedData.map((item: any) => item.totalDeposits);
        const withdrawals = formattedData.map(
          (item: any) => item.totalWithdrawals,
        );

        // Aqui, Lucro = depósitos - saques
        const profit = formattedData.map(
          (item: any) => item.totalDeposits - item.totalWithdrawals,
        );

        const chartData = {
          labels,
          datasets: [
            {
              label: "Depósitos",
              data: deposits,
              backgroundColor: "rgba(59, 130, 246, 0.8)",
              borderColor: "rgba(59, 130, 246, 1)",
              borderWidth: 1,
              borderRadius: 4,
            },
            {
              label: "Saques",
              data: withdrawals,
              backgroundColor: "rgba(249, 115, 22, 0.8)",
              borderColor: "rgba(249, 115, 22, 1)",
              borderWidth: 1,
              borderRadius: 4,
            },
            {
              label: "Lucro",
              data: profit,
              backgroundColor: "rgba(16, 185, 129, 0.8)",
              borderColor: "rgba(16, 185, 129, 1)",
              borderWidth: 1,
              borderRadius: 4,
            },
          ],
        };

        setChartData(chartData);
        setDistributionData(formattedDistribution);
      } catch (error) {
        console.error("Erro ao buscar dados do gráfico:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "rgba(255, 255, 255, 0.8)",
          font: { size: 12 },
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.9)",
        titleColor: "rgba(255, 255, 255, 1)",
        bodyColor: "rgba(255, 255, 255, 0.8)",
        borderColor: "rgba(59, 130, 246, 0.5)",
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        callbacks: {
          label: (context: any) =>
            `${context.dataset.label}: R$ ${context.raw.toLocaleString("pt-BR")}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: { color: "rgba(255, 255, 255, 0.6)" },
      },
      y: {
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: {
          color: "rgba(255, 255, 255, 0.6)",
          callback: (value: any) => `R$ ${(value / 1000).toFixed(0)}k`,
        },
      },
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
  };

  return (
    <Card className="col-span-full border-border/30 shadow-card-dark transition-all hover:-translate-y-1 card-glow">
      <CardHeader className="pb-2 border-b border-border/20">
        <CardTitle className="text-xl font-semibold text-glow">
          Desempenho Anual
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[350px] w-full">
          {!loading && chartData ? (
            <Bar data={chartData} options={options} />
          ) : (
            <div className="flex items-center justify-center h-full rounded-md bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 animate-pulse-gentle">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">
                  Carregando dados...
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
