"use client";

import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import {
  MoreHorizontal,
  ArrowUpDown,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Calendar,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClienteModal } from "@/components/clientes/cliente-modal";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/components/ui/use-toast";
import { ClienteCard } from "@/components/clientes/cliente-card";

type FilterType = "recentes" | "saldo" | "depositado" | "sacado" | "none";

interface Cliente {
  id: string;
  nome: string;
  email: string;
  cpf: string | null;
  telefone: string | null;
  documentoNumero: string | null;
  documentoTipo: string | null;
  dataNascimento: string | null;
  dataCadastro: string;
  saldoReal: number;
  saldoDemo: number;
  saldoDisponivel: number;
  saldoDisponivelValue?: number;
  totalDepositado: number;
  totalDepositadoValue?: number;
  totalDepositadoFormatado: string;
  totalSacado: number;
  totalSacadoValue?: number;
  totalSacadoFormatado: string;
  saldoRealFormatado: string;
  saldoDemoFormatado: string;
  saldoDisponivelFormatado: string;
}

export function ClienteTable() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortColumn, setSortColumn] = useState("nome");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("none");
  const [clientesData, setClientesData] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar dados da API
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/clients");

        if (!response.ok) {
          throw new Error("Erro ao carregar clientes");
        }

        const data = await response.json();

        // Formatar os dados recebidos da API
        const clientesFormatados = data.map((cliente: any) => ({
          ...cliente,
          dataCadastro: formatDate(cliente.dataCadastro), // Função para formatar a data
          dataCadastroValue: new Date(cliente.dataCadastro).getTime(),
          saldoDisponivelValue: cliente.saldoDisponivel,
          totalDepositadoValue: cliente.totalDepositado,
          totalSacadoValue: cliente.totalSacado,
        }));

        setClientesData(clientesFormatados);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os clientes",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, []);
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
  // Filtragem de clientes
  const filteredClientes = clientesData.filter(
    (cliente) =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Aplicar filtros especiais
  const applySpecialFilter = (clients: Cliente[]) => {
    switch (activeFilter) {
      case "recentes":
        return [...clients].sort(
          (a, b) => (b.dataCadastroValue || 0) - (a.dataCadastroValue || 0),
        );
      case "saldo":
        return [...clients].sort(
          (a, b) =>
            (b.saldoDisponivelValue || 0) - (a.saldoDisponivelValue || 0),
        );
      case "depositado":
        return [...clients].sort(
          (a, b) =>
            (b.totalDepositadoValue || 0) - (a.totalDepositadoValue || 0),
        );
      case "sacado":
        return [...clients].sort(
          (a, b) => (b.totalSacadoValue || 0) - (a.totalSacadoValue || 0),
        );
      default:
        return clients;
    }
  };

  // Ordenação de clientes
  const sortedClientes =
    activeFilter !== "none"
      ? applySpecialFilter(filteredClientes)
      : [...filteredClientes].sort((a, b) => {
          const aValue = a[sortColumn as keyof typeof a];
          const bValue = b[sortColumn as keyof typeof b];

          if (sortDirection === "asc") {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });

  // Paginação
  const totalPages = Math.ceil(sortedClientes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClientes = sortedClientes.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Manipuladores de eventos
  const handleSort = (column: string) => {
    setActiveFilter("none");
    setSortColumn(column);
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setClienteToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/clients/${clienteToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir cliente");
      }

      setClientesData((prev) =>
        prev.filter((cliente) => cliente.id !== clienteToDelete),
      );

      toast({
        title: "Cliente excluído",
        description: "O cliente foi excluído com sucesso.",
        className: "bg-success/20 text-success-foreground border-success/20",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o cliente",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setClienteToDelete(null);
    }
  };

  const handleSaveCliente = (updatedCliente: Cliente) => {
    setClientesData((prev) =>
      prev.map((cliente) =>
        cliente.id === updatedCliente.id
          ? {
              ...updatedCliente,
              dataCadastroValue: new Date(
                updatedCliente.dataCadastro,
              ).getTime(),
            }
          : cliente,
      ),
    );
  };

  // Renderização de cards para dispositivos móveis
  const renderMobileCards = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 gap-4">
          {[...Array(itemsPerPage)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-lg bg-muted/20 animate-pulse"
            ></div>
          ))}
        </div>
      );
    }

    if (paginatedClientes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
          <Search className="h-8 w-8 mb-2 opacity-50" />
          <p>Nenhum cliente encontrado.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4">
        {paginatedClientes.map((cliente) => (
          <ClienteCard
            key={cliente.id}
            cliente={cliente}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    );
  };

  // Obter o texto do filtro ativo
  const getActiveFilterText = () => {
    switch (activeFilter) {
      case "recentes":
        return "Cadastros Recentes";
      case "saldo":
        return "Maior Saldo";
      case "depositado":
        return "Maior Depositado";
      case "sacado":
        return "Maior Sacado";
      default:
        return "Filtrar Por";
    }
  };

  // Obter o ícone do filtro ativo
  const getActiveFilterIcon = () => {
    switch (activeFilter) {
      case "recentes":
        return <Calendar className="h-4 w-4" />;
      case "saldo":
        return <Wallet className="h-4 w-4" />;
      case "depositado":
        return <ArrowUpCircle className="h-4 w-4" />;
      case "sacado":
        return <ArrowDownCircle className="h-4 w-4" />;
      default:
        return <Filter className="h-4 w-4" />;
    }
  };

  if (loading && clientesData.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between gap-4">
          <div className="h-10 w-72 bg-muted/20 rounded-md animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-10 w-32 bg-muted/20 rounded-md animate-pulse"></div>
            <div className="h-10 w-16 bg-muted/20 rounded-md animate-pulse"></div>
          </div>
        </div>
        <div className="h-[500px] bg-muted/20 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 fade-in">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            className="pl-9 border-border/30 bg-card/50 focus-visible:ring-primary/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1 border-border/30 bg-card/50"
              >
                {getActiveFilterIcon()}
                {getActiveFilterText()}
                {activeFilter !== "none" && (
                  <Badge
                    variant="secondary"
                    className="ml-1 rounded-sm px-1 font-normal"
                  >
                    1
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[220px] bg-card border-border/30"
            >
              <DropdownMenuRadioGroup
                value={activeFilter}
                onValueChange={(value) =>
                  handleFilterChange(value as FilterType)
                }
              >
                <DropdownMenuRadioItem
                  value="none"
                  className="hover:bg-muted/20"
                >
                  <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                  Sem Filtro
                </DropdownMenuRadioItem>
                <DropdownMenuSeparator />
                <DropdownMenuRadioItem
                  value="recentes"
                  className="hover:bg-muted/20"
                >
                  <Calendar className="mr-2 h-4 w-4 text-primary" />
                  Cadastros Recentes
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="saldo"
                  className="hover:bg-muted/20"
                >
                  <Wallet className="mr-2 h-4 w-4 text-success" />
                  Maior Saldo
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="depositado"
                  className="hover:bg-muted/20"
                >
                  <ArrowUpCircle className="mr-2 h-4 w-4 text-info" />
                  Maior Depositado
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="sacado"
                  className="hover:bg-muted/20"
                >
                  <ArrowDownCircle className="mr-2 h-4 w-4 text-warning" />
                  Maior Sacado
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number.parseInt(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-16 border-border/30 bg-card/50 focus-visible:ring-primary/50">
              <SelectValue placeholder={itemsPerPage.toString()} />
            </SelectTrigger>
            <SelectContent className="bg-card border-border/30">
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Visualização para dispositivos móveis (cards) */}
      <div className="md:hidden">{renderMobileCards()}</div>

      {/* Visualização para desktop (tabela) */}
      <div className="hidden md:block rounded-lg border border-border/30 shadow-card-dark overflow-hidden bg-card gradient-border">
        <Table className="table-zebra">
          <TableHeader className="bg-muted/20">
            <TableRow className="hover:bg-transparent border-b border-border/30">
              <TableHead className="w-[200px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("nome")}
                  className="flex items-center gap-1 font-medium hover:text-primary"
                >
                  Nome
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("email")}
                  className="flex items-center gap-1 font-medium hover:text-primary"
                >
                  Email
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("totalDepositado")}
                  className="flex items-center gap-1 font-medium hover:text-primary"
                >
                  Total Depositado
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("totalSacado")}
                  className="flex items-center gap-1 font-medium hover:text-primary"
                >
                  Total Sacado
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("dataCadastro")}
                  className="flex items-center gap-1 font-medium hover:text-primary"
                >
                  Data de Cadastro
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </TableHead>
              <TableHead className="w-[100px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedClientes.length > 0 ? (
              paginatedClientes.map((cliente) => (
                <TableRow
                  key={cliente.id}
                  className="hover:bg-muted/10 transition-colors"
                >
                  <TableCell className="font-medium">{cliente.nome}</TableCell>
                  <TableCell>{cliente.email}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {cliente.totalDepositadoFormatado}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {cliente.totalSacadoFormatado}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {cliente.dataCadastro}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {cliente.cpf || "Não informado"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-card border-border/30"
                      >
                        <DropdownMenuItem
                          onClick={() => handleEdit(cliente)}
                          className="cursor-pointer hover:bg-muted/20"
                        >
                          <Edit className="mr-2 h-4 w-4 text-primary" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(cliente.id)}
                          className="cursor-pointer hover:bg-muted/20"
                        >
                          <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Search className="h-8 w-8 mb-2 opacity-50" />
                    Nenhum cliente encontrado.
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação melhorada */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground order-2 sm:order-1">
          Mostrando {sortedClientes.length > 0 ? startIndex + 1 : 0} a{" "}
          {Math.min(sortedClientes.length, startIndex + itemsPerPage)} de{" "}
          {sortedClientes.length} clientes
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

      <ClienteModal
        cliente={selectedCliente}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCliente(null);
        }}
        onSave={handleSaveCliente}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="border border-border/30 shadow-lg bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cliente? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/30 bg-card/50 hover:bg-muted/20">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
