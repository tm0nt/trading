/**
 * Card principal para os formulários de autenticação
 *
 * Fornece um container consistente para os formulários de login e registro,
 * com estilo visual alinhado à plataforma principal.
 *
 * @param title - Título do card
 * @param subtitle - Subtítulo descritivo
 * @param children - Conteúdo do card (formulários)
 */

import type React from "react";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="relative bg-gradient-to-b from-[#151515]/90 to-[#121212]/90 backdrop-blur-md border border-[#2a2a2a]/80 rounded-2xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-300 hover:shadow-[0_15px_50px_-12px_rgba(1,219,151,0.15)]">
      {/* Borda superior com gradiente */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[rgb(1,219,151)]/30 to-transparent"></div>

      {/* Cabeçalho do card */}
      <div className="p-8 border-b border-[#2a2a2a]/50">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-[#e0e0e0]">
          {title}
        </h1>
        <p className="text-sm text-[#999] mt-2">{subtitle}</p>
      </div>

      {/* Corpo do card */}
      <div className="p-8">{children}</div>
    </div>
  );
}
