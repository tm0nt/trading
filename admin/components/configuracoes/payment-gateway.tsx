"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Lock } from "lucide-react";

export function PaymentGatewaySettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    endPointGateway: "",
    tokenPublicoGateway: "",
    tokenPrivadoGateway: "",
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/config/update");
        const data = await res.json();
        if (data.success) {
          setFormData({
            endPointGateway: data.data.endPointGateway || "",
            tokenPublicoGateway: data.data.tokenPublicoGateway || "",
            tokenPrivadoGateway: data.data.tokenPrivadoGateway || "",
          });
        }
      } catch (error) {
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar as configurações do gateway.",
          className:
            "bg-destructive/20 text-destructive-foreground border-destructive/20",
        });
      }
    };

    fetchConfig();
  }, [toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/config/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const result = await res.json();

      if (result.success) {
        toast({
          title: "Configurações salvas",
          description:
            "As configurações do gateway de pagamento foram atualizadas com sucesso.",
          className: "bg-success/20 text-success-foreground border-success/20",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar as configurações.",
        className:
          "bg-destructive/20 text-destructive-foreground border-destructive/20",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-border/30 shadow-card-dark transition-all hover:-translate-y-1 card-glow gradient-border">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b border-border/30">
          <CardTitle className="text-xl font-semibold flex items-center gap-2 text-glow">
            <Lock className="h-5 w-5 text-primary icon-glow" />
            Gateway de Pagamento
          </CardTitle>
          <CardDescription>
            Configure as credenciais do gateway de pagamento utilizado pela
            plataforma.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <Label htmlFor="endPointGateway">Endpoint da API</Label>
            <Input
              id="endPointGateway"
              name="endPointGateway"
              value={formData.endPointGateway}
              onChange={handleChange}
              placeholder="https://api.gateway.com/v1"
              className="border-border/30 bg-card/50 focus-visible:ring-primary/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tokenPublicoGateway">Token Público</Label>
            <Input
              id="tokenPublicoGateway"
              name="tokenPublicoGateway"
              value={formData.tokenPublicoGateway}
              onChange={handleChange}
              placeholder="pk_test_..."
              className="border-border/30 bg-card/50 focus-visible:ring-primary/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tokenPrivadoGateway">Token Privado</Label>
            <Input
              id="tokenPrivadoGateway"
              name="tokenPrivadoGateway"
              type="password"
              value={formData.tokenPrivadoGateway}
              onChange={handleChange}
              placeholder="sk_test_..."
              className="border-border/30 bg-card/50 focus-visible:ring-primary/50"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Nunca compartilhe seu token privado. Ele dá acesso completo à sua
              conta.
            </p>
          </div>
        </CardContent>

        <CardFooter className="border-t border-border/30 bg-muted/10 py-4">
          <Button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary/90 transition-colors"
          >
            {loading ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
