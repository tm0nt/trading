"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  User,
  Wallet,
  DollarSign,
  CreditCard,
  Calendar,
  Mail,
  Phone,
  MapPin,
  FileText,
  ArrowUpCircle,
  ArrowDownCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ClienteModalProps {
  cliente: any;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (cliente: any) => void;
}

export function ClienteModal({
  cliente,
  isOpen,
  onClose,
  onSave,
}: ClienteModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dados-pessoais");
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cpfCnpj: "",
    telefone: "",
    dataNascimento: "",
    endereco: "",
    dataCadastro: "",
    saldoDisponivel: "",
    saldoReal: "",
    saldoDemo: "",
    totalDepositado: "",
    totalSacado: "",
  });
  const [mounted, setMounted] = useState(false);

  // Montar o componente apenas no cliente
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Atualizar os dados do formulário quando o cliente mudar
  useEffect(() => {
    if (cliente) {
      setFormData({
        nome: cliente.nome || "",
        email: cliente.email || "",
        cpfCnpj: cliente.cpfCnpj || "",
        telefone: cliente.telefone || "",
        dataNascimento: cliente.dataNascimento || "",
        endereco: cliente.endereco || "",
        dataCadastro: cliente.dataCadastro || "",
        saldoDisponivel: cliente.saldoDisponivel || "",
        saldoReal: cliente.saldoReal || "",
        saldoDemo: cliente.saldoDemo || "",
        totalDepositado: cliente.totalDepositado || "",
        totalSacado: cliente.totalSacado || "",
      });
    }
  }, [cliente]);

  // Controlar o scroll do body quando o modal estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Se houver uma função onSave, chame-a com os dados atualizados
    if (onSave && cliente) {
      const updatedCliente = { ...cliente, ...formData };
      onSave(updatedCliente);
    }

    toast({
      title: "Cliente atualizado",
      description: "As informações do cliente foram atualizadas com sucesso.",
      className: "bg-success/20 text-success-foreground border-success/20",
    });

    onClose();
  };

  // Se não estiver montado ou não estiver aberto ou não tiver cliente, não renderize nada
  if (!mounted || !isOpen || !cliente) return null;

  // Usar createPortal para renderizar o modal fora da hierarquia do DOM
  return createPortal(
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed left-[50%] top-[50%] z-50 w-full max-w-[650px] translate-x-[-50%] translate-y-[-50%] rounded-lg border border-border/30 bg-card shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-transparent px-6 py-4 rounded-t-lg border-b border-border/30 flex justify-between items-center">
          <div>
            <h2
              id="modal-title"
              className="text-xl font-semibold flex items-center gap-2"
            >
              <User className="h-5 w-5 text-primary" />
              Detalhes do Cliente
            </h2>
            <p className="text-sm text-muted-foreground">
              Visualize e edite as informações do cliente.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-muted/20"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-8rem)] overflow-y-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
            <TabsList className="grid grid-cols-2 mb-4 bg-muted/30 p-1 border border-border/30">
              <TabsTrigger
                value="dados-pessoais"
                className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-sm"
              >
                <User className="h-4 w-4" />
                Dados Pessoais
              </TabsTrigger>
              <TabsTrigger
                value="dados-financeiros"
                className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-sm"
              >
                <Wallet className="h-4 w-4" />
                Dados Financeiros
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit}>
              <TabsContent value="dados-pessoais" className="space-y-4 mt-2">
                <div className="p-4 rounded-lg border border-border/30 bg-muted/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{cliente.nome}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {cliente.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label
                        htmlFor="nome"
                        className="font-medium flex items-center gap-1"
                      >
                        <User className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                        Nome Completo
                      </Label>
                      <Input
                        id="nome"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        className="border-border/30 bg-card/50 focus-visible:ring-primary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="font-medium flex items-center gap-1"
                      >
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="border-border/30 bg-card/50 focus-visible:ring-primary/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                    <div className="space-y-2">
                      <Label
                        htmlFor="cpfCnpj"
                        className="font-medium flex items-center gap-1"
                      >
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                        CPF/CNPJ
                      </Label>
                      <Input
                        id="cpfCnpj"
                        name="cpfCnpj"
                        value={formData.cpfCnpj}
                        onChange={handleChange}
                        className="border-border/30 bg-card/50 focus-visible:ring-primary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="telefone"
                        className="font-medium flex items-center gap-1"
                      >
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                        Telefone
                      </Label>
                      <Input
                        id="telefone"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleChange}
                        className="border-border/30 bg-card/50 focus-visible:ring-primary/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                    <div className="space-y-2">
                      <Label
                        htmlFor="dataNascimento"
                        className="font-medium flex items-center gap-1"
                      >
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                        Data de Nascimento
                      </Label>
                      <Input
                        id="dataNascimento"
                        name="dataNascimento"
                        value={formData.dataNascimento}
                        onChange={handleChange}
                        className="border-border/30 bg-card/50 focus-visible:ring-primary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="dataCadastro"
                        className="font-medium flex items-center gap-1"
                      >
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                        Data de Cadastro
                      </Label>
                      <Input
                        id="dataCadastro"
                        name="dataCadastro"
                        value={formData.dataCadastro}
                        onChange={handleChange}
                        disabled
                        className="bg-muted/20 cursor-not-allowed border-border/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mt-5">
                    <Label
                      htmlFor="endereco"
                      className="font-medium flex items-center gap-1"
                    >
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                      Endereço Completo
                    </Label>
                    <Input
                      id="endereco"
                      name="endereco"
                      value={formData.endereco}
                      onChange={handleChange}
                      className="border-border/30 bg-card/50 focus-visible:ring-primary/50"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="dados-financeiros" className="space-y-4 mt-2">
                {/* Resumo financeiro */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-border/30 bg-gradient-to-br from-success/5 to-transparent">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowUpCircle className="h-5 w-5 text-success" />
                      <h3 className="text-sm font-medium">Total Depositado</h3>
                    </div>
                    <p className="text-2xl font-bold text-success">
                      {formData.totalDepositado}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border border-border/30 bg-gradient-to-br from-warning/5 to-transparent">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowDownCircle className="h-5 w-5 text-warning" />
                      <h3 className="text-sm font-medium">Total Sacado</h3>
                    </div>
                    <p className="text-2xl font-bold text-warning">
                      {formData.totalSacado}
                    </p>
                  </div>
                </div>

                {/* Campos editáveis */}
                <div className="p-4 rounded-lg border border-primary/30 bg-primary/5 shadow-[0_0_15px_rgba(79,70,229,0.15)]">
                  <h3 className="text-sm font-medium mb-4 flex items-center gap-2 text-primary">
                    <CreditCard className="h-4 w-4 text-primary" />
                    Saldos Editáveis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label
                        htmlFor="saldoReal"
                        className="font-medium flex items-center gap-1"
                      >
                        <Wallet className="h-3.5 w-3.5 text-primary" /> Saldo
                        Real
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="saldoReal"
                          name="saldoReal"
                          value={formData.saldoReal}
                          onChange={handleChange}
                          className="pl-9 border-primary/30 bg-card/50 focus-visible:ring-primary/50"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Saldo real disponível para saque pelo cliente.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="saldoDemo"
                        className="font-medium flex items-center gap-1"
                      >
                        <Wallet className="h-3.5 w-3.5 text-primary" /> Saldo
                        Demo
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="saldoDemo"
                          name="saldoDemo"
                          value={formData.saldoDemo}
                          onChange={handleChange}
                          className="pl-9 border-primary/30 bg-card/50 focus-visible:ring-primary/50"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Saldo para demonstração e testes na plataforma.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Saldo disponível (somente leitura) */}
                <div className="p-4 rounded-lg border border-border/30 bg-muted/10">
                  <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    Saldo Disponível (Somente Leitura)
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="saldoDisponivel" className="font-medium">
                      Saldo Disponível
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="saldoDisponivel"
                        name="saldoDisponivel"
                        value={formData.saldoDisponivel}
                        disabled
                        className="pl-9 bg-muted/20 cursor-not-allowed border-border/30"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Saldo calculado automaticamente (Total Depositado - Total
                      Sacado).
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Footer */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 mt-6 pt-4 border-t border-border/30">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="border-border/30 bg-card/50 hover:bg-muted/20"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className={cn(
                    "bg-primary hover:bg-primary/90 text-primary-foreground",
                    "transition-all duration-200 hover:shadow-[0_0_15px_rgba(79,70,229,0.3)]",
                  )}
                >
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </Tabs>
        </div>
      </div>
    </>,
    document.body,
  );
}
