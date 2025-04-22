"use client";

import { useEffect, useState } from "react";

interface LoadingScreenProps {
  message?: string;
  isLoading: boolean; // Adicione esta prop
  onComplete?: () => void;
}

export default function LoadingScreen({
  message = "Gerando pagamento...",
  isLoading, // Recebe o estado de loading
  onComplete,
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading && progress >= 100) {
      // Só chama onComplete quando o loading externo terminar E a animação estiver completa
      onComplete?.();
    }
  }, [isLoading, progress, onComplete]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        // Aumenta progresso apenas se ainda estiver carregando
        const newProgress = isLoading 
          ? Math.min(prev + 2, 99) // Não chega a 100% enquanto isLoading for true
          : Math.min(prev + 5, 100); // Completa rapidamente quando loading termina

        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <div className="bg-[#121212] border border-[#2a2a2a] rounded-lg p-6 animate-in fade-in duration-300">
      <div className="flex flex-col items-center justify-center py-8">
        {/* Spinner animado */}
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-[#2a2a2a] rounded-full"></div>
          <div
            className="absolute top-0 left-0 w-full h-full border-4 border-t-[rgb(1,219,151)] rounded-full animate-spin"
            style={{ animationDuration: "1s" }}
          ></div>
        </div>

        <h3 className="text-lg font-semibold mb-2 text-center">{message}</h3>
        <p className="text-sm text-[#999] mb-4 text-center">
          Por favor, aguarde enquanto processamos sua solicitação
        </p>

        {/* Barra de progresso */}
        <div className="w-full max-w-md h-2 bg-[#2a2a2a] rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-[rgb(1,219,151)] transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="text-xs text-[#999]">{Math.round(progress)}%</div>
      </div>
    </div>
  );
}