"use client";

import { useState, useEffect } from "react";
import {
  ArrowUpDown,
  Search,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Mail,
  Calendar,
  DollarSign,
  Tag,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

export function SaqueTable() {
  const [saques, setSaques] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortColumn, setSortColumn] = useState<keyof any>("dataSolicitacao");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isApproveAllDialogOpen, setIsApproveAllDialogOpen] = useState(false);
  const [selectedSaqueId, setSelectedSaqueId] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendente":
        return (
          <Badge
            variant="outline"
            className="bg-warning-muted text-warning border-warning/20 font-medium"
          >
            Pendente
          </Badge>
        );
      case "aprovado":
        return (
          <Badge
            variant="outline"
            className="bg-success-muted text-success border-success/20 font-medium"
          >
            Aprovado
          </Badge>
        );
      case "cancelado":
        return (
          <Badge
            variant="outline"
            className="bg-destructive/10 text-destructive border-destructive/20 font-medium"
          >
            Cancelado
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  useEffect(() => {
    async function loadSaques() {
      try {
        const res = await fetch("/api/withdraws");
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const data = await res.json();
        const formatted = data.map((w: any) => ({
          id: w.id,
          valor: `R$ ${w.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
          valorNumerico: w.valor,
          tipoPix: w.tipoChave,
          email: w.chave,
          dataSolicitacao: new Date(w.dataPedido).toLocaleDateString("pt-BR"),
          dataTimestamp: new Date(w.dataPedido).getTime(),
          status: w.status,
        }));
        setSaques(formatted);
      } catch (error) {
        console.error("Erro ao carregar saques", error);
        toast({
          title: "Erro ao carregar saques",
          description: (error as Error).message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    loadSaques();
  }, [toast]);

  if (loading) {
    return (
      <div className="p-4 text-center">Carregando solicitações de saque…</div>
    );
  }

  // Filtragem de saques
  const filteredSaques = saques.filter((saque) => {
    const matchesSearch =
      saque.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      saque.valor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      saque.tipoPix.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "todos" || statusFilter === saque.status;
    return matchesSearch && matchesStatus;
  });

  // Ordenação de saques
  const sortedSaques = [...filteredSaques].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    if (sortDirection === "asc") return aValue > bValue ? 1 : -1;
    return aValue < bValue ? 1 : -1;
  });

  // Paginação
  const totalPages = Math.ceil(sortedSaques.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSaques = sortedSaques.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Renderização mobile
  const renderMobileCards = () => {
    if (paginatedSaques.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
          <Search className="h-8 w-8 mb-2 opacity-50" />
          <p>Nenhuma solicitação de saque encontrada.</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 gap-4">
        {paginatedSaques.map((saque) => (
          <Card
            key={saque.id}
            className="overflow-hidden border-border/30 shadow-card-dark transition-all hover:-translate-y-1 card-glow"
          >
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-primary/10 to-transparent p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 p-2 rounded-full">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-base">{saque.valor}</h3>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Mail className="h-3 w-3 mr-1" />
                      {saque.email}
                    </div>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    saque.status === "pendente"
                      ? "bg-warning-muted text-warning"
                      : saque.status === "aprovado"
                        ? "bg-success-muted text-success"
                        : "bg-destructive/10 text-destructive"
                  }
                >
                  {saque.status.charAt(0).toUpperCase() + saque.status.slice(1)}
                </Badge>
              </div>

              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center">
                      <Tag className="h-3 w-3 mr-1" /> Tipo de Chave Pix
                    </p>
                    <p className="text-sm font-medium">{saque.tipoPix}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" /> Data da Solicitação
                    </p>
                    <p className="text-sm font-medium">
                      {saque.dataSolicitacao}
                    </p>
                  </div>
                </div>
                {saque.status === "pendente" && (
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <Button
                      className="flex-1 h-9 gap-1 text-success border-success/20 bg-success-muted hover:text-success hover:bg-success-muted hover:border-success/30"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSaqueId(saque.id);
                        setIsApproveDialogOpen(true);
                      }}
                    >
                      <CheckCircle className="h-4 w-4" /> Aprovar
                    </Button>
                    <Button
                      className="flex-1 h-9 gap-1 text-destructive border-destructive/20 bg-destructive/10 hover:text-destructive hover:bg-destructive/20 hover:border-destructive/30"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSaqueId(saque.id);
                        setIsRejectDialogOpen(true);
                      }}
                    >
                      <XCircle className="h-4 w-4" /> Rejeitar
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Contagem pendentes
  const pendingSaquesCount = filteredSaques.filter(
    (s) => s.status === "pendente",
  ).length;

  const confirmApproveAll = () => {
    toast({
      title: "Todos os saques aprovados",
      description: `${pendingSaquesCount} solicitações aprovadas.`,
    });
    setIsApproveAllDialogOpen(false);
  };

  // JSX Table Desktop + controles + dialogs
  return (
    <div className="space-y-4">
      {/* Search & filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar saques..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          {pendingSaquesCount > 0 && (
            <Button
              className="flex-1 h-9 gap-1 text-success border-success/20 bg-success-muted hover:text-success hover:bg-success-muted hover:border-success/30"
              variant="outline"
              size="sm"
              onClick={() => setIsApproveAllDialogOpen(true)}
            >
              <CheckCircle className="h-4 w-4" /> Aprovar Tudo{" "}
              <Badge variant="secondary">{pendingSaquesCount}</Badge>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />{" "}
                {statusFilter === "todos" ? "Todos" : statusFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuRadioGroup
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <DropdownMenuRadioItem value="todos">
                  Todos
                </DropdownMenuRadioItem>
                <DropdownMenuSeparator />
                <DropdownMenuRadioItem value="pendente">
                  Pendentes
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="aprovado">
                  Aprovados
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="cancelado">
                  Cancelados
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(val) => {
              setItemsPerPage(+val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Mobile */}
      <div className="md:hidden">{renderMobileCards()}</div>
      {/* Desktop */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                onClick={() => {
                  setSortColumn("valor");
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                }}
              >
                Valor
              </TableHead>
              <TableHead>Tipo Pix</TableHead>
              <TableHead
                onClick={() => {
                  setSortColumn("email");
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                }}
              >
                Email
              </TableHead>
              <TableHead
                onClick={() => {
                  setSortColumn("dataSolicitacao");
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                }}
              >
                Data
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSaques.map((saque) => (
              <TableRow key={saque.id}>
                <TableCell>{saque.valor}</TableCell>
                <TableCell>{saque.tipoPix}</TableCell>
                <TableCell>{saque.email}</TableCell>
                <TableCell>{saque.dataSolicitacao}</TableCell>
                <TableCell>{getStatusBadge(saque.status)}</TableCell>
                <TableCell>
                  {saque.status === "pendente" ? (
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 h-9 gap-1 text-success border-success/20 bg-success-muted hover:text-success hover:bg-success-muted hover:border-success/30"
                        size="sm"
                        onClick={() => {
                          setSelectedSaqueId(saque.id);
                          setIsApproveDialogOpen(true);
                        }}
                      >
                        Aprovar
                      </Button>
                      <Button
                        className="flex-1 h-9 gap-1 text-destructive border-destructive/20 bg-destructive/10 hover:text-destructive hover:bg-destructive/20 hover:border-destructive/30"
                        size="sm"
                        onClick={() => {
                          setSelectedSaqueId(saque.id);
                          setIsRejectDialogOpen(true);
                        }}
                      >
                        Rejeitar
                      </Button>
                    </div>
                  ) : (
                    saque.status
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginação melhorada */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground order-2 sm:order-1">
          Mostrando {sortedSaques.length > 0 ? startIndex + 1 : 0} a{" "}
          {Math.min(sortedSaques.length, startIndex + itemsPerPage)} de{" "}
          {sortedSaques.length} solicitações
        </div>
        <div className="flex items-center space-x-2 order-1 sm:order-2">
          <div className="hidden sm:flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="h-8 w-8 border-border/30 bg-card/50"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 border-border/30 bg-card/50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Lógica para mostrar páginas ao redor da página atual
              let pageToShow;
              if (totalPages <= 5) {
                pageToShow = i + 1;
              } else if (currentPage <= 3) {
                pageToShow = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageToShow = totalPages - 4 + i;
              } else {
                pageToShow = currentPage - 2 + i;
              }

              return (
                <Button
                  key={i}
                  variant={currentPage === pageToShow ? "default" : "outline"}
                  size="icon"
                  onClick={() => setCurrentPage(pageToShow)}
                  className={`h-8 w-8 ${
                    currentPage === pageToShow
                      ? "bg-primary text-primary-foreground"
                      : "border-border/30 bg-card/50"
                  }`}
                >
                  {pageToShow}
                </Button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="h-8 w-8 border-border/30 bg-card/50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="h-8 w-8 border-border/30 bg-card/50"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Controles de paginação para mobile */}
          <div className="flex sm:hidden items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 px-2 border-border/30 bg-card/50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="h-8 px-2 border-border/30 bg-card/50"
            >
              Próximo
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog
        open={isApproveDialogOpen}
        onOpenChange={setIsApproveDialogOpen}
      >
        <AlertDialogContent className="border border-border/30 shadow-lg bg-card gradient-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar aprovação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja aprovar esta solicitação de saque? Esta
              ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/30 bg-card/50 hover:bg-muted/20">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction className="bg-success text-success-foreground hover:bg-success/90">
              Aprovar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
      >
        <AlertDialogContent className="border border-border/30 shadow-lg bg-card gradient-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar rejeição</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja rejeitar esta solicitação de saque? Esta
              ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/30 bg-card/50 hover:bg-muted/20">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Rejeitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={isApproveAllDialogOpen}
        onOpenChange={setIsApproveAllDialogOpen}
      >
        <AlertDialogContent className="border border-border/30 shadow-lg bg-card gradient-border">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Aprovar todos os saques pendentes
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja aprovar todas as {pendingSaquesCount}{" "}
              solicitações de saque pendentes? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/30 bg-card/50 hover:bg-muted/20">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmApproveAll}
              className="bg-success text-success-foreground hover:bg-success/90"
            >
              Aprovar Todos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
