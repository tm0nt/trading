import type { Metadata } from "next";
import { SaqueTable } from "@/components/saques/saque-table";

export const metadata: Metadata = {
  title: "Solicitações de Saque | Painel Administrativo",
  description: "Gerenciamento de solicitações de saque",
};

export default function SaquesPage() {
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 pt-6 bg-gradient-to-b from-background to-background/70">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text">
            Solicitações de Saque
          </h2>
          <p className="text-muted-foreground mt-1">
            Gerencie as solicitações de saque dos clientes
          </p>
        </div>
      </div>
      <SaqueTable />
    </div>
  );
}
