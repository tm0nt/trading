"use client";

/**
 * Cabeçalho para as páginas de autenticação
 *
 * Exibe o logo da plataforma e o título da seção de autenticação.
 * Mantém a consistência visual com o restante da plataforma.
 */

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function AuthHeader() {
  const [logoUrl, setLogoUrl] = useState<string>("");

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // Fazendo requisição para a API
        const response = await fetch("/api/config/general");
        const data = await response.json();

        // Definindo a logoUrl no estado
        setLogoUrl(data.logoUrl || "");
      } catch (error) {
        console.error("Erro ao carregar a logo:", error);
      }
    };

    fetchConfig();
  }, []);
  return (
    <motion.div
      className="flex justify-center mb-10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex flex-col items-center">
        {/* Logo animado da plataforma */}
        <div className="relative mb-2">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="absolute inset-0 rounded-full bg-gradient-to-r from-[rgba(1,219,151,0.2)] to-transparent blur-md"
          />
          {logoUrl && (
            <img src={logoUrl} alt="Logo" className="mx-auto w-40 h-auto" />
          )}
        </div>
        <div className="text-xs text-[#999] mt-1">
          Plataforma de Trading Profissional
        </div>
      </div>
    </motion.div>
  );
}
