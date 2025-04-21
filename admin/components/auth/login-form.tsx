"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";

// Credenciais fixas para autenticação
const VALID_EMAIL = "admin@admin.com";
const VALID_PASSWORD = "ptkzin2";

// Chave para armazenar a sessão no localStorage
const SESSION_STORAGE_KEY = "admin_session";

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  // Verificar se já existe uma sessão ativa ao carregar o componente
  useEffect(() => {
    const checkExistingSession = () => {
      if (typeof window !== "undefined") {
        const session = localStorage.getItem(SESSION_STORAGE_KEY);
        if (session) {
          try {
            const sessionData = JSON.parse(session);
            // Verificar se a sessão ainda é válida
            if (sessionData && sessionData.isLoggedIn) {
              // Redirecionar para o dashboard
              router.push("/");
            }
          } catch (error) {
            // Se houver erro ao analisar o JSON, limpar a sessão
            localStorage.removeItem(SESSION_STORAGE_KEY);
          }
        }
      }
    };

    checkExistingSession();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpar erro quando o usuário começa a digitar
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      rememberMe: checked,
    }));
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: "", password: "" };

    // Validar email
    if (!formData.email) {
      newErrors.email = "O email é obrigatório";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
      valid = false;
    }

    // Validar senha
    if (!formData.password) {
      newErrors.password = "A senha é obrigatória";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulação de delay para parecer uma chamada de API real
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verificar se as credenciais são válidas
      if (
        formData.email === VALID_EMAIL &&
        formData.password === VALID_PASSWORD
      ) {
        // Criar objeto de sessão
        const sessionData = {
          isLoggedIn: true,
          email: formData.email,
          rememberMe: formData.rememberMe,
          timestamp: new Date().toISOString(),
        };

        // Salvar sessão no localStorage
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));

        toast({
          title: "Login realizado com sucesso",
          description: "Você será redirecionado para o painel",
          className: "bg-success/20 text-success-foreground border-success/20",
        });

        // Redirecionar para o dashboard após login bem-sucedido
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } else {
        toast({
          title: "Falha no login",
          description: "Email ou senha incorretos",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no servidor",
        description: "Ocorreu um erro ao processar sua solicitação",
        variant: "destructive",
      });
      console.error("Erro de login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 bg-gradient-to-br from-background to-muted/50">
      <Card className="border-border/30 shadow-card-dark transition-all card-glow w-full max-w-md">
        <CardHeader className="space-y-1 bg-gradient-to-r from-primary/10 to-transparent border-b border-border/30 pb-6">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary icon-glow" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-glow">
            Painel Administrativo
          </CardTitle>
          <CardDescription className="text-center">
            Entre com suas credenciais para acessar o painel
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@admin.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`border-border/30 bg-card/50 focus-visible:ring-primary/50 ${
                    errors.email ? "border-destructive" : ""
                  }`}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-medium flex items-center gap-1">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={`border-border/30 bg-card/50 focus-visible:ring-primary/50 ${
                    errors.password ? "border-destructive" : ""
                  }`}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Ocultar senha" : "Mostrar senha"}
                  </span>
                </Button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive mt-1">{errors.password}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="border-t border-border/30 bg-muted/10 py-4">
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 transition-colors flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Entrar
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
