"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import AuthToggle from "@/components/auth/auth-toggle";
import { loginUser } from "@/lib/auth/auth-service";
import { motion } from "framer-motion";
import { prisma } from "@/lib/prisma";

interface LoginFormProps {
  onToggleMode: () => void;
}

export default function LoginForm({ onToggleMode }: LoginFormProps) {
  // Estados do formulário
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const toast = useToast();

  // Função para validar o formato do email
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Manipulador para submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!validateEmail(email)) {
      toast.open({
        variant: "error",
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        duration: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      // Chamada à API de login
      const data = await loginUser(email, password);

      toast.open({
        variant: "success",
        title: "Login bem-sucedido",
        description: "Redirecionando para a plataforma...",
        duration: 3000,
      });

      // Redirecionar após login bem-sucedido
      setTimeout(() => {
        router.push("/trading");
      }, 1000);
    } catch (error) {
      toast.open({
        variant: "error",
        title: "Erro ao fazer login",
        description: "Credenciais inválidas. Tente novamente.",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Variantes de animação para os elementos do formulário
  const formVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      variants={formVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Campo de email */}
      <motion.div variants={itemVariants} className="mb-6">
        <label htmlFor="email" className="block text-sm text-[#999] mb-2">
          Email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="2"
                y="4"
                width="20"
                height="16"
                rx="2"
                stroke="#666666"
                strokeWidth="2"
              />
              <path
                d="M22 7L12 14L2 7"
                stroke="#666666"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[rgb(1,219,151)]"
            placeholder="Digite seu email"
            required
          />
        </div>
      </motion.div>

      {/* Campo de senha */}
      <motion.div variants={itemVariants} className="mb-6">
        <label htmlFor="password" className="block text-sm text-[#999] mb-2">
          Senha
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="3"
                y="11"
                width="18"
                height="11"
                rx="2"
                stroke="#666666"
                strokeWidth="2"
              />
              <path
                d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11"
                stroke="#666666"
                strokeWidth="2"
              />
            </svg>
          </div>

          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl py-3 pl-10 pr-10 text-white focus:outline-none focus:border-[rgb(1,219,151)]"
            placeholder="Digite sua senha"
            required
          />

          <button
            type="button"
            className="absolute inset-y-0 right-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 2L22 22"
                  stroke="#666666"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.71277 6.7226C3.66479 8.79527 2 12 2 12C2 12 5.63636 19 12 19C14.0503 19 15.8174 18.2734 17.2711 17.2884M11 5.05822C11.3254 5.02013 11.6588 5 12 5C18.3636 5 22 12 22 12C22 12 21.3082 13.3317 20 14.8335"
                  stroke="#666666"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 14.2362C13.4692 14.7112 12.7684 15.0001 12 15.0001C10.3431 15.0001 9 13.657 9 12.0001C9 11.1764 9.33193 10.4303 9.86932 9.88818"
                  stroke="#666666"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 5C18.3636 5 22 12 22 12C22 12 18.3636 19 12 19C5.63636 19 2 12 2 12C2 12 5.63636 5 12 5Z"
                  stroke="#666666"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  stroke="#666666"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex justify-end mb-8">
        <a
          href="#"
          className="text-xs text-[rgb(1,219,151)] hover:text-[rgb(0,199,131)] transition-colors duration-300 hover:underline"
        >
          Esqueceu sua senha?
        </a>
      </motion.div>

      <motion.div variants={itemVariants}>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[rgb(1,219,151)] to-[rgb(0,199,131)] hover:from-[rgb(0,199,131)] hover:to-[rgb(0,179,111)] text-white py-3 rounded-xl transition-all duration-300 flex items-center justify-center shadow-[0_5px_15px_rgba(1,219,151,0.2)] hover:shadow-[0_8px_25px_rgba(1,219,151,0.3)] transform hover:-translate-y-1"
          disabled={loading}
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span className="mr-2 font-medium">Entrar</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <AuthToggle
          message="Não tem uma conta?"
          linkText="Criar conta"
          onToggle={onToggleMode}
        />
      </motion.div>
    </motion.form>
  );
}
