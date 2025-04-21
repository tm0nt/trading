import type { Metadata } from "next";
import { ClienteTable } from "@/components/clientes/cliente-table";

export const metadata: Metadata = {
  title: "Clientes | Painel Administrativo",
  description: "Gerenciamento de clientes",
};

export default function ClientesPage() {
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 pt-6 bg-gradient-to-b from-background to-background/70">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text">
            Clientes
          </h2>
          <p className="text-muted-foreground mt-1">
            Gerencie os clientes cadastrados na plataforma
          </p>
        </div>
      </div>
      <ClienteTable />
    </div>
  );
}
