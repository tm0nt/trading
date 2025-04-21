"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Home, LogIn, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  // Efeito para redirecionar após o contador chegar a zero
  useEffect(() => {
    if (countdown <= 0) {
      router.push("/login");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background/80 to-background p-4">
        <div className="w-full max-w-md">
          <Card className="border-border/30 shadow-card-dark transition-all card-glow">
            <CardHeader className="space-y-1 bg-gradient-to-r from-destructive/10 to-transparent border-b border-border/30 pb-6">
              <div className="flex justify-center mb-2">
                <div className="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-destructive icon-glow" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center text-glow">
                Erro inesperado
              </CardTitle>
              <CardDescription className="text-center">
                Ocorreu um erro inesperado ao processar sua solicitação.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Você será redirecionado para a página de login em{" "}
                  <span className="font-bold text-destructive">
                    {countdown}
                  </span>{" "}
                  segundos...
                </p>
                <div className="relative w-full h-2 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-destructive/70 rounded-full transition-all duration-1000"
                    style={{ width: `${(countdown / 10) * 100}%` }}
                  />
                </div>
              </div>
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm">
                <p className="font-medium text-destructive mb-1">
                  Detalhes do erro:
                </p>
                <p className="text-muted-foreground break-words">
                  {error.message || "Erro desconhecido"}
                </p>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/30 bg-muted/10 py-4 flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="w-full sm:w-auto border-border/30 bg-card/50 hover:bg-muted/20 flex items-center gap-2"
                onClick={() => reset()}
              >
                <RefreshCw className="h-4 w-4" />
                Tentar novamente
              </Button>
              <Button
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 transition-colors flex items-center gap-2"
                onClick={() => router.push("/")}
              >
                <Home className="h-4 w-4" />
                Ir para Dashboard
              </Button>
              <Button
                className="w-full sm:w-auto bg-destructive hover:bg-destructive/90 transition-colors flex items-center gap-2"
                onClick={() => router.push("/login")}
              >
                <LogIn className="h-4 w-4" />
                Ir para Login
              </Button>
            </CardFooter>
          </Card>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Se o problema persistir, entre em contato com o administrador do
              sistema para obter assistência.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
