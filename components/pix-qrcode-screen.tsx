"use client";

import { useState } from "react";
import { Copy, Check, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface PixQRCodeScreenProps {
  amount: string;
  onBack: () => void;
}

export default function PixQRCodeScreen({
  amount,
  onBack,
}: PixQRCodeScreenProps) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  // Código PIX de exemplo (normalmente seria gerado pelo backend)
  const pixCode =
    "00020126580014BR.GOV.BCB.PIX0136a629532e-7693-4846-b028-f142082d7b0752040000530398654041.005802BR5925NOME DO RECEBEDOR EXEMPLO6009SAO PAULO62070503***63041D14";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pixCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      toast.open({
        variant: "success",
        title: "Código copiado!",
        description: "O código PIX foi copiado para a área de transferência.",
        duration: 3000,
      });
    });
  };

  return (
    <div className="bg-[#121212] border border-[#2a2a2a] rounded-lg p-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-[#999] hover:text-white transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>Voltar</span>
        </button>
        <div className="text-sm text-[#999]">Depósito via PIX</div>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Escaneie o QR Code</h3>
        <p className="text-sm text-[#999] mb-4">
          Escaneie o QR Code abaixo com o aplicativo do seu banco ou copie o
          código PIX
        </p>
        <div className="text-[rgb(1,219,151)] text-xl font-bold mb-4">
          {amount}
        </div>
      </div>

      {/* QR Code */}
      <div className="flex justify-center mb-6">
        <div className="bg-white p-4 rounded-lg w-64 h-64 flex items-center justify-center">
          <svg
            viewBox="0 0 200 200"
            width="200"
            height="200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* QR Code simplificado para exemplo */}
            <rect width="200" height="200" fill="white" />
            <g fill="black">
              <rect x="20" y="20" width="40" height="40" />
              <rect x="140" y="20" width="40" height="40" />
              <rect x="20" y="140" width="40" height="40" />
              <rect x="70" y="20" width="10" height="10" />
              <rect x="90" y="20" width="10" height="10" />
              <rect x="120" y="20" width="10" height="10" />
              <rect x="20" y="70" width="10" height="10" />
              <rect x="20" y="90" width="10" height="10" />
              <rect x="20" y="120" width="10" height="10" />
              <rect x="70" y="70" width="60" height="60" />
              <rect x="140" y="70" width="10" height="10" />
              <rect x="140" y="90" width="10" height="10" />
              <rect x="140" y="120" width="10" height="10" />
              <rect x="70" y="140" width="10" height="10" />
              <rect x="90" y="140" width="10" height="10" />
              <rect x="120" y="140" width="10" height="10" />
              <rect x="170" y="140" width="10" height="10" />
              <rect x="170" y="70" width="10" height="10" />
              <rect x="170" y="90" width="10" height="10" />
              <rect x="170" y="120" width="10" height="10" />
            </g>
          </svg>
        </div>
      </div>

      {/* Código PIX */}
      <div className="mb-6">
        <label className="block text-sm text-[#999] mb-2">
          Código PIX Copia e Cola
        </label>
        <div className="relative">
          <input
            type="text"
            value={pixCode}
            readOnly
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md p-3 pr-10 text-white text-sm font-mono overflow-hidden text-ellipsis"
          />
        </div>
      </div>

      {/* Botão de copiar */}
      <button
        onClick={handleCopyCode}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-md transition-colors ${
          copied
            ? "bg-[rgba(1,219,151,0.2)] text-[rgb(1,219,151)] border border-[rgb(1,219,151)]"
            : "bg-[rgb(1,219,151)] hover:bg-[rgb(0,199,131)] text-white"
        }`}
      >
        {copied ? (
          <>
            <Check size={18} />
            <span>Código copiado!</span>
          </>
        ) : (
          <>
            <Copy size={18} />
            <span>Copiar código PIX</span>
          </>
        )}
      </button>

      <div className="mt-6 text-center text-xs text-[#999]">
        <p>
          O pagamento será confirmado automaticamente em até 5 minutos após a
          transferência.
        </p>
        <p className="mt-2">Este QR Code é válido por 30 minutos.</p>
      </div>
    </div>
  );
}
