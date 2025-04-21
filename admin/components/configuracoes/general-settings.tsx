"use client";
import { useState, useRef, useEffect } from "react";
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
import { Toast } from "@/components/ui/toast";
import { Upload, Settings } from "lucide-react";

export function GeneralSettings() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    siteName: "",
    logoUrl: "",
    minWithdrawal: "",
    minDeposit: "",
    taxDeposit: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Carrega dados iniciais via GET
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/config/update");
        const data = await res.json();
        if (data.success) {
          setFormData({
            siteName: data.data.nomeSite,
            logoUrl: data.data.logoUrl || "",
            minWithdrawal: data.data.valorMinimoSaque
              .toString()
              .replace(".", ","),
            minDeposit: data.data.valorMinimoDeposito
              .toString()
              .replace(".", ","),
            taxDeposit: data.data.taxa.toString().replace(".", ","),
          });
        } else {
        }
      } catch (error) {}
    })();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const url = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, logoUrl: url }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = new FormData();
    payload.append("nomeSite", formData.siteName);
    payload.append("valorMinimoSaque", formData.minWithdrawal);
    payload.append("valorMinimoDeposito", formData.minDeposit);
    payload.append("taxa", formData.taxDeposit);
    if (logoFile) payload.append("logoUrl", logoFile);

    try {
      const res = await fetch("/api/config/update", {
        method: "POST",
        body: payload,
      });
      const result = await res.json();
      if (result.success) {
        // Atualiza estado com dados retornados
        setFormData({
          siteName: result.data.nomeSite,
          logoUrl: result.data.logoUrl || formData.logoUrl,
          minWithdrawal: result.data.valorMinimoSaque
            .toString()
            .replace(".", ","),
          minDeposit: result.data.valorMinimoDeposito
            .toString()
            .replace(".", ","),
          taxDeposit: result.data.taxa.toString().replace(".", ","),
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-border/30 shadow-card-dark transition-all hover:-translate-y-1 card-glow gradient-border">
        <CardHeader className="bg-gradient-to-r from-info/10 to-transparent border-b border-border/30">
          <CardTitle className="text-xl font-semibold flex items-center gap-2 text-glow">
            <Settings className="h-5 w-5 text-info icon-glow" />
            Configurações Gerais
          </CardTitle>
          <CardDescription>
            Configure as informações básicas da plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <Label htmlFor="siteName">Nome do Site</Label>
            <Input
              id="siteName"
              name="siteName"
              value={formData.siteName}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUpload">Logotipo do Site</Label>
            <div className="flex items-center gap-4">
              {formData.logoUrl ? (
                <div className="relative h-20 w-20 rounded-md border border-border/30 overflow-hidden bg-muted/20">
                  <img
                    src={formData.logoUrl}
                    alt="Logo"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed border-border/30 bg-muted/10 hover:bg-muted/20 transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-border/30 bg-card/50 hover:bg-muted/20"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Selecionar Imagem
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Recomendado: PNG, JPG ou SVG com fundo transparente. Máximo
                  1MB.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="minWithdrawal">Valor Mínimo de Saque (R$)</Label>
              <Input
                id="minWithdrawal"
                name="minWithdrawal"
                value={formData.minWithdrawal}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minDeposit">Valor Mínimo de Depósito (R$)</Label>
              <Input
                id="minDeposit"
                name="minDeposit"
                value={formData.minDeposit}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minDeposit">Taxa de Saque (R$)</Label>
              <Input
                id="taxDeposit"
                name="taxDeposit"
                value={formData.taxDeposit}
                onChange={handleChange}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="space-x-4 pt-3">
          <Button type="submit">Salvar Configurações</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
