/**
 * Página principal de autenticação
 *
 * Esta página serve como container para os componentes de login e registro,
 * gerenciando o estado de alternância entre eles com animações fluidas.
 *
 * @author Seu Nome
 * @version 1.0.0
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthHeader from "@/components/auth/auth-header";
import AuthCard from "@/components/auth/auth-card";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import AuthFooter from "@/components/auth/auth-footer";
import { ToastContainer } from "@/components/ui/toast";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthPage() {
  // Estado para controlar qual formulário está ativo (login ou registro)
  const [isLogin, setIsLogin] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Efeito para animação inicial
  useEffect(() => {
    setMounted(true);
  }, []);

  // Função para alternar entre os formulários de login e registro
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <ToastContainer>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#101010] to-[#0f0f0f] flex flex-col items-center justify-center p-4 theme-transition relative overflow-hidden">
        {/* Elementos decorativos de fundo */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Círculos decorativos com gradientes sutis */}
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-[rgba(1,219,151,0.03)] to-transparent blur-3xl"></div>
          <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tl from-[rgba(1,219,151,0.02)] to-transparent blur-3xl"></div>

          {/* Linhas decorativas */}
          <div className="absolute top-[20%] left-[10%] w-[80%] h-[1px] bg-gradient-to-r from-transparent via-[rgba(1,219,151,0.1)] to-transparent"></div>
          <div className="absolute bottom-[25%] left-[5%] w-[90%] h-[1px] bg-gradient-to-r from-transparent via-[rgba(1,219,151,0.05)] to-transparent"></div>
        </div>

        <motion.div
          className="w-full max-w-md relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Cabeçalho com logo */}
          <AuthHeader />

          {/* Card principal de autenticação */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "register"}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <AuthCard
                title={isLogin ? "Entrar" : "Criar conta"}
                subtitle={
                  isLogin
                    ? "Acesse sua conta para continuar"
                    : "Preencha os dados para criar sua conta"
                }
              >
                {/* Renderiza o formulário apropriado com base no estado */}
                {isLogin ? (
                  <LoginForm onToggleMode={toggleAuthMode} />
                ) : (
                  <RegisterForm onToggleMode={toggleAuthMode} />
                )}
              </AuthCard>
            </motion.div>
          </AnimatePresence>

          {/* Rodapé com informações adicionais */}
          <AuthFooter />
        </motion.div>
      </div>
    </ToastContainer>
  );
}
