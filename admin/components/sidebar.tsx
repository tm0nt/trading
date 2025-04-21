"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useToast } from "@/components/ui/use-toast";

// Chave para armazenar a sessão no localStorage
const SESSION_STORAGE_KEY = "admin_session";

const menuItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: BarChart3,
  },
  {
    title: "Clientes",
    href: "/clientes",
    icon: Users,
  },
  {
    title: "Solicitações de Saque",
    href: "/saques",
    icon: CreditCard,
  },
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Verificar se o usuário está autenticado
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const session = localStorage.getItem(SESSION_STORAGE_KEY);
        if (!session) {
          // Se não houver sessão, redirecionar para a página de login
          router.push("/login");
        }
      }
    };

    checkAuth();
  }, [router]);

  // Fechar o menu quando o caminho mudar (navegação)
  useEffect(() => {
    setShowMobileMenu(false);
  }, [pathname]);

  // Manipulador para fechar o menu quando clicar fora dele
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const mobileMenu = document.getElementById("mobile-menu");

      if (
        showMobileMenu &&
        mobileMenu &&
        !mobileMenu.contains(target) &&
        !target.closest("[data-mobile-toggle]")
      ) {
        setShowMobileMenu(false);
      }
    };

    if (showMobileMenu) {
      document.addEventListener("mousedown", handleOutsideClick);
      // Impedir rolagem do body quando o menu estiver aberto
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.body.style.overflow = "";
    };
  }, [showMobileMenu]);

  // Função para fazer logout
  const handleLogout = () => {
    // Remover a sessão do localStorage
    localStorage.removeItem(SESSION_STORAGE_KEY);

    // Mostrar toast de confirmação
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
      className: "bg-info/20 text-info-foreground border-info/20",
    });

    // Redirecionar para a página de login
    setTimeout(() => {
      router.push("/login");
    }, 500);
  };

  return (
    <>
      {/* Cabeçalho móvel sempre visível em telas pequenas */}
      <div className="md:hidden flex items-center h-16 px-4 border-b border-border/30 bg-card shadow-md fixed top-0 left-0 right-0 z-40">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="mr-2"
          data-mobile-toggle="true"
        >
          {showMobileMenu ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
          <span className="sr-only">
            {showMobileMenu ? "Fechar menu" : "Abrir menu"}
          </span>
        </Button>
        <h1 className="font-bold text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Admin Painel
        </h1>
      </div>

      {/* Espaçador para compensar o cabeçalho fixo em dispositivos móveis */}
      <div className="md:hidden h-16"></div>

      {/* Menu móvel - só aparece quando showMobileMenu é true */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            id="mobile-menu"
            className="absolute inset-0 bg-card/95 backdrop-blur-sm flex flex-col h-full w-full"
          >
            <div className="flex items-center h-16 px-4 border-b border-border/30">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileMenu(false)}
                className="mr-2"
                data-mobile-toggle="true"
              >
                <X className="h-6 w-6" />
                <span className="sr-only">Fechar menu</span>
              </Button>
              <h1 className="font-bold text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Admin Painel
              </h1>
            </div>
            <div className="flex-1 overflow-auto py-6 px-6">
              <nav className="flex flex-col gap-3">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMobileMenu(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
                      pathname === item.href
                        ? "bg-primary/20 text-primary shadow-md border border-primary/20"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5",
                        pathname === item.href
                          ? "text-primary icon-glow"
                          : "text-muted-foreground",
                      )}
                    />
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="border-t border-border/30 p-6">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 hover:bg-muted/50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar para desktop - sempre visível em telas médias e grandes */}
      <Sidebar className="hidden md:flex border-r border-border/30">
        <SidebarHeader className="border-b border-border/30 p-6">
          <h1 className="font-bold text-xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Admin Painel
          </h1>
        </SidebarHeader>
        <SidebarContent className="px-3 py-4">
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href} className="my-1">
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.title}
                  className={
                    pathname === item.href
                      ? "bg-primary/20 border border-primary/20"
                      : ""
                  }
                >
                  <Link
                    href={item.href}
                    className="transition-all duration-200"
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5",
                        pathname === item.href ? "text-primary icon-glow" : "",
                      )}
                    />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t border-border/30 p-6">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 hover:bg-muted/50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
