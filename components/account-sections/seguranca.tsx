"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";

export default function SegurancaSection() {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const toast = useToast();

  const validarFormulario = () => {
    const novosErros: { [key: string]: string } = {};

    if (!senhaAtual) novosErros.senhaAtual = "Digite sua senha atual";
    if (!novaSenha || novaSenha.length < 6)
      novosErros.novaSenha = "A nova senha deve ter pelo menos 6 caracteres";
    if (novaSenha !== confirmarSenha)
      novosErros.confirmarSenha = "As senhas não coincidem";

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: senhaAtual,
          newPassword: novaSenha,
          confirmNewPassword: confirmarSenha,
        }),
      });

      if (!res.ok) throw new Error("Erro ao alterar a senha");

      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      setErrors({});

      toast.open({
        variant: "success",
        title: "Senha alterada com sucesso!",
        duration: 5000,
      });
    } catch (error: unknown) {
      // Verificar se o erro é uma instância de Error
      if (error instanceof Error) {
        toast.open({
          variant: "error",
          title: error.message, // Aqui, você pode acessar a mensagem do erro
          duration: 5000,
        });
      } else {
        // Caso o erro não seja uma instância de Error, apenas logue ou trate de forma genérica
        toast.open({
          variant: "error",
          title: "Erro desconhecido",
          duration: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#1a1a1a] rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-6">Segurança</h3>

      <div className="bg-[#121212] border border-[#2a2a2a] rounded-lg p-4">
        <h4 className="font-medium mb-4">Alterar senha</h4>

        <div className="mb-4">
          <label className="block text-sm text-[#999] mb-1">Senha atual</label>
          <input
            type="password"
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md p-2.5 text-white"
            placeholder="Digite sua senha atual"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
          />
          {errors.senhaAtual && (
            <p className="text-sm text-red-500 mt-1">{errors.senhaAtual}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm text-[#999] mb-1">Nova senha</label>
          <input
            type="password"
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md p-2.5 text-white"
            placeholder="Digite sua nova senha"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
          />
          {errors.novaSenha && (
            <p className="text-sm text-red-500 mt-1">{errors.novaSenha}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm text-[#999] mb-1">
            Confirmar nova senha
          </label>
          <input
            type="password"
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md p-2.5 text-white"
            placeholder="Confirme sua nova senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
          />
          {errors.confirmarSenha && (
            <p className="text-sm text-red-500 mt-1">{errors.confirmarSenha}</p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className={`w-full bg-[rgb(1,219,151)] hover:bg-[rgb(0,199,131)] text-white py-2 rounded-md transition-colors ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isLoading ? "Salvando..." : "Alterar senha"}
        </button>
      </div>
    </div>
  );
}
