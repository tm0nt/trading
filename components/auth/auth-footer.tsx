"use client";

/**
 * Rodapé para as páginas de autenticação
 *
 * Exibe informações adicionais, como credenciais de demonstração
 * e links para termos de uso e política de privacidade.
 */

import { motion } from "framer-motion";

export default function AuthFooter() {
  return (
    <motion.div
      className="mt-8 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      {/* Links para termos e políticas */}
      <div className="text-xs text-[#999]">
        <a
          href="#"
          className="text-[rgb(1,219,151)] hover:text-[rgb(0,199,131)] transition-colors duration-300 hover:underline"
        >
          Termos de Uso
        </a>
        {" · "}
        <a
          href="#"
          className="text-[rgb(1,219,151)] hover:text-[rgb(0,199,131)] transition-colors duration-300 hover:underline"
        >
          Política de Privacidade
        </a>
        {" · "}
        <a
          href="#"
          className="text-[rgb(1,219,151)] hover:text-[rgb(0,199,131)] transition-colors duration-300 hover:underline"
        >
          Suporte
        </a>
      </div>

      {/* Ano atual */}
      <div className="mt-2 text-xs text-[#666]">
        © {new Date().getFullYear()} Ebinex. Todos os direitos reservados.
      </div>
    </motion.div>
  );
}
