/**
 * Formulário de registro
 *
 * Componente responsável pelo formulário de registro, incluindo
 * validação de campos, submissão e feedback visual.
 *
 * @param onToggleMode - Função para alternar para o modo de login
 */

"use client";

import type React from "react";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import FormInput from "@/components/auth/form-input";
import PasswordInput from "@/components/auth/password-input";
import AuthToggle from "@/components/auth/auth-toggle";
import { registerUser } from "@/lib/auth/auth-service";
import { motion } from "framer-motion";

interface RegisterFormProps {
  onToggleMode: () => void;
}

export default function RegisterForm({ onToggleMode }: RegisterFormProps) {
  // Estados do formulário
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados de validação
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [passwordValid, setPasswordValid] = useState<boolean | null>(null);
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);
  const [nameValid, setNameValid] = useState<boolean | null>(null);

  const toast = useToast();

  // Funções de validação
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  const validateName = (name: string) => {
    return name.trim().length > 0; // Valida se o nome não está vazio
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  // Manipuladores de mudança de campo com validação
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value) {
      setEmailValid(validateEmail(value));
    } else {
      setEmailValid(null);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    setNameValid(validateName(value)); // Validando nome
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (value) {
      setPasswordValid(validatePassword(value));
      if (confirmPassword) {
        setPasswordsMatch(value === confirmPassword);
      }
    } else {
      setPasswordValid(null);
      setPasswordsMatch(null);
    }
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (value) {
      setPasswordsMatch(password === value);
    } else {
      setPasswordsMatch(null);
    }
  };

  // Manipulador de submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação de todos os campos
    if (!validateEmail(email)) {
      toast.open({
        variant: "error",
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        duration: 3000,
      });
      return;
    }

    if (!validatePassword(password)) {
      toast.open({
        variant: "error",
        title: "Senha fraca",
        description: "A senha deve ter pelo menos 8 caracteres.",
        duration: 3000,
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.open({
        variant: "error",
        title: "Senhas não coincidem",
        description: "As senhas digitadas não são iguais.",
        duration: 3000,
      });
      return;
    }

    if (!acceptTerms) {
      toast.open({
        variant: "error",
        title: "Termos não aceitos",
        description:
          "Você precisa aceitar os termos e condições para continuar.",
        duration: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      // Simulação de chamada à API
      await registerUser(name, email, password);

      toast.open({
        variant: "success",
        title: "Registro bem-sucedido",
        description: "Sua conta foi criada com sucesso!",
        duration: 3000,
      });

      // Alternar para o formulário de login após registro bem-sucedido
      onToggleMode();
    } catch (error) {
      toast.open({
        variant: "error",
        title: "Erro ao registrar",
        description: "Não foi possível criar sua conta. Tente novamente.",
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
      {/* Campo de nome */}
      <motion.div>
        <FormInput
          id="name"
          label="Nome completo"
          type="text"
          value={name}
          onChange={handleNameChange}
          placeholder="Digite seu nome completo"
          icon="user"
          isValid={nameValid} // Aplicando a validação no ícone
          errorMessage="Por favor, insira seu nome completo"
          required
        />
      </motion.div>

      {/* Campo de email */}
      <motion.div variants={itemVariants}>
        <FormInput
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="Digite seu email"
          icon="mail"
          isValid={emailValid}
          errorMessage="Por favor, insira um email válido"
          required
        />
      </motion.div>

      {/* Campo de senha */}
      <motion.div variants={itemVariants}>
        <PasswordInput
          id="password"
          label="Senha"
          value={password}
          onChange={handlePasswordChange}
          placeholder="Digite sua senha"
          isValid={passwordValid}
          errorMessage="A senha deve ter pelo menos 8 caracteres"
          required
        />
      </motion.div>

      {/* Campo de confirmação de senha */}
      <motion.div variants={itemVariants}>
        <PasswordInput
          id="confirmPassword"
          label="Confirmar senha"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          placeholder="Confirme sua senha"
          isValid={passwordsMatch}
          errorMessage="As senhas não coincidem"
          required
        />
      </motion.div>

      {/* Checkbox de aceitação de termos */}
      <motion.div variants={itemVariants} className="mb-8">
        <label className="flex items-start group cursor-pointer">
          <div className="relative flex items-center mt-1 mr-2">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="peer sr-only"
            />
            <div className="w-5 h-5 border-2 border-[#2a2a2a] rounded transition-colors duration-300 peer-checked:border-[rgb(1,219,151)] peer-checked:bg-[rgb(1,219,151)]/10 group-hover:border-[#3a3a3a] peer-checked:group-hover:border-[rgb(1,219,151)]"></div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity duration-300">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="rgb(1,219,151)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <span className="text-xs text-[#999] group-hover:text-white transition-colors duration-300">
            Eu li e concordo com os{" "}
            <a
              href="#"
              className="text-[rgb(1,219,151)] hover:text-[rgb(0,199,131)] transition-colors duration-300 hover:underline"
            >
              Termos de Uso
            </a>{" "}
            e{" "}
            <a
              href="#"
              className="text-[rgb(1,219,151)] hover:text-[rgb(0,199,131)] transition-colors duration-300 hover:underline"
            >
              Política de Privacidade
            </a>
          </span>
        </label>
      </motion.div>

      {/* Botão de submissão */}
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
              <span className="mr-2 font-medium">Criar conta</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </motion.div>

      {/* Alternância para o formulário de login */}
      <motion.div variants={itemVariants}>
        <AuthToggle
          message="Já tem uma conta?"
          linkText="Entrar"
          onToggle={onToggleMode}
        />
      </motion.div>
    </motion.form>
  );
}
