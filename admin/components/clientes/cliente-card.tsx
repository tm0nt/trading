"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Mail,
  Calendar,
  DollarSign,
  MoreHorizontal,
  Edit,
  Trash2,
  Wallet,
} from "lucide-react";

interface ClienteCardProps {
  cliente: any;
  onEdit: (cliente: any) => void;
  onDelete: (id: string) => void;
}

export function ClienteCard({ cliente, onEdit, onDelete }: ClienteCardProps) {
  return (
    <Card className="overflow-hidden border-border/30 shadow-card-dark transition-all hover:-translate-y-1 card-glow">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-primary/10 to-transparent p-4 border-b border-border/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-full">
              <User className="h-5 w-5 text-primary icon-glow" />
            </div>
            <div>
              <h3 className="font-medium text-base">{cliente.nome}</h3>
              <div className="flex items-center text-xs text-muted-foreground">
                <Mail className="h-3 w-3 mr-1" />
                {cliente.email}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted/20">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 bg-card border-border/30"
            >
              <DropdownMenuItem
                onClick={() => onEdit(cliente)}
                className="cursor-pointer hover:bg-primary/10"
              >
                <Edit className="mr-2 h-4 w-4 text-primary" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(cliente.id)}
                className="cursor-pointer text-destructive hover:bg-destructive/10 focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center">
                <DollarSign className="h-3 w-3 mr-1" /> Total Depositado
              </p>
              <p className="text-sm font-medium">{cliente.totalDepositado}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center">
                <DollarSign className="h-3 w-3 mr-1" /> Total Sacado
              </p>
              <p className="text-sm font-medium">{cliente.totalSacado}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/20">
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center">
                <Wallet className="h-3 w-3 mr-1" /> Saldo Real
              </p>
              <p className="text-sm font-medium text-primary">
                {cliente.saldoReal}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center">
                <Wallet className="h-3 w-3 mr-1" /> Saldo Demo
              </p>
              <p className="text-sm font-medium text-info">
                {cliente.saldoDemo}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center">
              <Calendar className="h-3 w-3 mr-1" /> Data de Cadastro
            </p>
            <p className="text-sm font-medium">{cliente.dataCadastro}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
