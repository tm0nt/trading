"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

// Chave para armazenar a sessão no localStorage
const SESSION_STORAGE_KEY = "admin_session";

// Páginas que não precisam de autenticação
const publicPages = ["/login", "/recuperar-senha"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // Verificar se estamos em uma página pública
      if (publicPages.includes(pathname)) {
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      // Verificar se existe uma sessão no localStorage
      const session = localStorage.getItem(SESSION_STORAGE_KEY);

      if (!session) {
        // Se não houver sessão e não estamos em uma página pública, redirecionar para login
        toast({
          title: "Acesso restrito",
          description: "Faça login para acessar esta página",
          variant: "destructive",
        });
        router.push("/login");
        return;
      }

      try {
        const sessionData = JSON.parse(session);
        if (sessionData && sessionData.isLoggedIn) {
          setIsAuthenticated(true);
        } else {
          router.push("/login");
        }
      } catch (error) {
        // Se houver erro ao analisar o JSON, limpar a sessão e redirecionar
        localStorage.removeItem(SESSION_STORAGE_KEY);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router, toast]);

  // Mostrar nada enquanto verifica a autenticação
  if (isLoading) {
    return null;
  }

  // Se estamos em uma página pública ou o usuário está autenticado, mostrar o conteúdo
  if (publicPages.includes(pathname) || isAuthenticated) {
    return <>{children}</>;
  }

  // Caso contrário, não mostrar nada (já redirecionamos para login)
  return null;
}
