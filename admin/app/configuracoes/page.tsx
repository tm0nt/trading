import type { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentGatewaySettings } from "@/components/configuracoes/payment-gateway";
import { GeneralSettings } from "@/components/configuracoes/general-settings";

export const metadata: Metadata = {
  title: "Configurações | Painel Administrativo",
  description: "Configurações do sistema",
};

export default function ConfiguracoesPage() {
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 pt-6 bg-gradient-to-b from-background to-background/70">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text">
            Configurações
          </h2>
          <p className="text-muted-foreground mt-1">
            Personalize as configurações da plataforma
          </p>
        </div>
      </div>

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="bg-muted/30 p-1 border border-border/30">
          <TabsTrigger
            value="geral"
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            Configurações Gerais
          </TabsTrigger>
          <TabsTrigger
            value="pagamento"
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            Gateway de Pagamento
          </TabsTrigger>
        </TabsList>
        <TabsContent value="geral" className="space-y-4 mt-4">
          <GeneralSettings />
        </TabsContent>
        <TabsContent value="pagamento" className="space-y-4 mt-4">
          <PaymentGatewaySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
