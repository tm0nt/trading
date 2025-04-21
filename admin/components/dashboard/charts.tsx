"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export function DashboardCharts() {
  const [activeTab, setActiveTab] = useState("diario");
  const [chartData, setChartData] = useState<any>(null);
  const [pieChartData, setPieChartData] = useState<any>(null);

  // Gráfico de linha: fetch dinâmico conforme tab ativa
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const res = await fetch(`/api/charts/transactions?period=${activeTab}`);
        const data = await res.json();

        if (data.error) {
          console.error(data.error);
          return;
        }

        // Preparando os dados para o gráfico de linha
        const dates = data.formattedData.map((item: any) => item.date);
        const totalDeposits = data.formattedData.map(
          (item: any) => item.totalDeposits,
        );
        const totalWithdrawals = data.formattedData.map(
          (item: any) => item.totalWithdrawals,
        );

        setChartData({
          labels: dates,
          datasets: [
            {
              label: "Total de Depósitos",
              data: totalDeposits,
              borderColor: "rgb(59, 130, 246)",
              backgroundColor: "rgba(59, 130, 246, 0.2)",
              fill: true,
            },
            {
              label: "Total de Saques",
              data: totalWithdrawals,
              borderColor: "rgb(255, 99, 132)",
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              fill: true,
            },
          ],
        });
      } catch (err) {
        console.error("Erro ao buscar dados de desempenho:", err);
      }
    };

    fetchChartData();
  }, [activeTab]);

  // Gráfico de pizza: fetch dinâmico conforme tab ativa
  useEffect(() => {
    const fetchPieData = async () => {
      try {
        const res = await fetch(`/api/charts/transactions?period=${activeTab}`);
        const data = await res.json();

        if (data.error) {
          console.error(data.error);
          return;
        }

        // Preparando os dados para o gráfico de pizza
        const labels = data.formattedDistribution.map(
          (item: any) => item.faixa,
        );
        const quantities = data.formattedDistribution.map(
          (item: any) => item.quantidade,
        );

        setPieChartData({
          labels: labels,
          datasets: [
            {
              label: "Distribuição de Clientes",
              data: quantities,
              backgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56",
                "#FF9F40",
                "#4BC0C0",
              ],
            },
          ],
        });
      } catch (err) {
        console.error("Erro ao buscar distribuição de clientes:", err);
      }
    };

    fetchPieData();
  }, [activeTab]); // Agora, depende de 'activeTab' para garantir que os dados sejam atualizados com o período

  const lineOptions = {
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
        titleColor: "#fff",
        bodyColor: "rgba(255, 255, 255, 0.8)",
        borderColor: "rgba(59, 130, 246, 0.5)",
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
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
          callback: (value: any) => `R$ ${value.toLocaleString("pt-BR")}`,
        },
      },
    },
    interaction: { mode: "index" as const, intersect: false },
    elements: { line: { borderWidth: 3 } },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: "rgba(255, 255, 255, 0.8)",
          font: { size: 12 },
          boxWidth: 12,
          padding: 15,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.9)",
        titleColor: "#fff",
        bodyColor: "rgba(255, 255, 255, 0.8)",
        borderColor: "rgba(59, 130, 246, 0.5)",
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        callbacks: {
          label: (context: any) => {
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0,
            );
            const percentage = Math.round((context.raw / total) * 100);
            return `${context.label}: ${context.raw} clientes (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4 border-border/30 shadow-card-dark transition-all hover:-translate-y-1 card-glow">
        <CardHeader className="pb-2 border-b border-border/20">
          <CardTitle className="text-xl font-semibold text-glow">
            Visão Geral Financeira
          </CardTitle>
          <CardDescription>
            Comparativo entre depósitos e saques
          </CardDescription>
          <Tabs
            defaultValue="diario"
            className="w-full mt-2"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-3 bg-muted/50">
              <TabsTrigger value="diario">Diário</TabsTrigger>
              <TabsTrigger value="semanal">Semanal</TabsTrigger>
              <TabsTrigger value="mensal">Mensal</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="pl-2 pt-4">
          <div className="h-[300px] w-full">
            {chartData ? (
              <Line data={chartData} options={lineOptions} />
            ) : (
              <div className="flex items-center justify-center h-full rounded-md bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 animate-pulse-gentle">
                <p className="text-muted-foreground">Carregando dados...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Card className="col-span-3 border-border/30 shadow-card-dark transition-all hover:-translate-y-1 card-glow">
        <CardHeader className="pb-2 border-b border-border/20">
          <CardTitle className="text-xl font-semibold text-glow">
            Distribuição de Clientes
          </CardTitle>
          <CardDescription>Distribuição por valor depositado</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[300px] w-full">
            {pieChartData?.length ? ( // Verificando se há dados
              <Pie data={pieChartData} options={pieOptions} />
            ) : (
              <div className="flex items-center justify-center h-full rounded-md bg-gradient-to-br from-info/5 to-transparent border border-info/10 animate-pulse-gentle">
                <p className="text-muted-foreground">Sem dados disponíveis</p>{" "}
                {/* Exibe a mensagem quando não houver dados */}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
