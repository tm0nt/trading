"use client";

import { useEffect, useState, useRef } from "react";
import { Copy, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAccountStore } from "@/store/account-store";
import { useToast } from "@/components/ui/toast";

function validaCPF(cpf: string): boolean {
  const strCPF = cpf.replace(/[^\d]/g, "");

  if (strCPF.length !== 11) return false;

  if (/^(\d)\1+$/.test(strCPF)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(strCPF.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(strCPF.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(strCPF.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;

  return resto === parseInt(strCPF.charAt(10));
}

const formatCPF = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const formatPhone = (value: string) =>
  value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .substring(0, 15);

const unmask = (value: string) => value.replace(/\D/g, "");

export default function VisaoGeralSection() {
  const {
    realBalance,
    user,
    createdAt,
    name,
    cpf,
    documentNumber,
    birthdate,
    phone,
    nationality,
    documentType,
    profilePicture,
    updateUserInfo,
  } = useAccountStore();

  const formattedDate = createdAt
    ? !isNaN(Date.parse(createdAt))
      ? format(new Date(createdAt), "MMM, yyyy", { locale: ptBR })
      : ""
    : "";
  const capitalizedDate = formattedDate
    ? formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)
    : "";

  const [activeTab, setActiveTab] = useState("visao-geral");
  const router = useRouter();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Inputs
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [cpfInput, setCpfInput] = useState("");
  const [documento, setDocumento] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [nacionalidade, setNacionalidade] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("RG");
  const [ddi, setDdi] = useState("+55 (Brasil)");

  const [errors, setErrors] = useState({
    nome: "",
    cpf: "",
    telefone: "",
    documento: "",
  });

  useEffect(() => {
    setNomeCompleto(name ?? "");
    setCpfInput(formatCPF(cpf ?? ""));
    setDocumento(documentNumber ?? "");
    setNascimento(
      birthdate ? new Date(birthdate).toISOString().split("T")[0] : "",
    );
    setTelefone(formatPhone(phone ?? ""));
    setNacionalidade(nationality ?? "");
    setTipoDocumento(documentType ?? "RG");
    setDdi("+55 (Brasil)");
  }, [name, cpf, documentNumber, birthdate, phone, nationality, documentType]);

  const copyIdToClipboard = (user: string) => {
    navigator.clipboard.writeText(user);
    toast.open({
      variant: "success",
      title: "ID copiado com sucesso!",
      duration: 5000,
    });
  };

  const formatCurrency = (value: number) => {
    if (isNaN(value)) return "R$ 0,00";
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const navigateToHistorico = () => {
    router.push("/account?section=historico");
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.open({
        variant: "error",
        title: "Formato inválido",
        description: "Por favor, selecione uma imagem (JPEG, PNG)",
        duration: 5000,
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.open({
        variant: "error",
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 5MB",
        duration: 5000,
      });
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/account/picture", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Erro ao atualizar foto");

      updateUserInfo({ profilePicture: data.url });

      toast.open({
        variant: "success",
        title: "Sucesso!",
        description: "Foto de perfil atualizada com sucesso",
        duration: 5000,
      });
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.open({
        variant: "error",
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Falha ao enviar imagem",
        duration: 5000,
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async () => {
    const nomeValido = nomeCompleto.trim().split(" ").length >= 2;
    const cpfValido = validaCPF(unmask(cpfInput));
    const telefoneValido = unmask(telefone).length >= 10;
    const documentoValido = documento.length >= 5;

    setErrors({
      nome: nomeValido ? "" : "Digite seu nome completo (mínimo dois nomes).",
      cpf: cpfValido ? "" : "CPF inválido.",
      telefone: telefoneValido ? "" : "Telefone inválido.",
      documento: documentoValido ? "" : "Documento muito curto.",
    });

    if (!nomeValido || !cpfValido || !telefoneValido || !documentoValido)
      return;

    try {
      const res = await fetch("/api/account/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nomeCompleto.trim(),
          cpf: unmask(cpfInput),
          documentoNumero: documento.trim(),
          dataNascimento: nascimento,
          telefone: unmask(telefone),
          nacionalidade,
          documentoTipo: tipoDocumento,
          ddi,
        }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar dados");

      updateUserInfo({
        name: nomeCompleto.trim(),
        cpf: unmask(cpfInput),
        documentNumber: documento.trim(),
        birthdate: nascimento,
        phone: unmask(telefone),
        nationality,
        documentType: tipoDocumento,
      });

      toast.open({
        variant: "success",
        title: "Dados atualizados com sucesso!",
        duration: 5000,
      });
    } catch (error) {
      toast.open({
        variant: "error",
        title: "Aconteceu algum erro, tente novamente!",
        duration: 5000,
      });
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
              {profilePicture ? (
                <img
                  src={`${profilePicture}?t=${Date.now()}`}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "";
                    target.className = "hidden";
                  }}
                />
              ) : (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <button
              className="absolute bottom-0 right-0 bg-[rgb(1,219,151)] rounded-full p-1.5"
              onClick={handleUploadClick}
              disabled={isUploading}
            >
              {isUploading ? (
                <span className="loading-spinner" />
              ) : (
                <Camera size={14} className="text-white" />
              )}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <div className="mt-4 text-center">
            <div className="text-sm text-[#999]">
              Membro Desde: {capitalizedDate}
            </div>
            <div className="flex items-center justify-center mt-1">
              <div className="text-sm text-[#999]">Meu ID: {user}</div>
              <button
                className="ml-2 p-1 hover:bg-[#2a2a2a] rounded-full"
                onClick={user ? () => copyIdToClipboard(user) : undefined}
              >
                <Copy size={12} className="text-[#999]" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-[#1a1a1a] rounded-lg p-4 mb-4">
            <div className="flex items-center mb-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="mr-2"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="white"
                  strokeWidth="2"
                />
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" />
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" />
              </svg>
              <div className="text-sm">Meu saldo</div>
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(realBalance)}
            </div>
          </div>

          <div className="flex mb-6">
            <button
              className={`py-2 px-4 rounded-full ${activeTab === "visao-geral" ? "bg-[rgb(1,219,151)] text-white" : "bg-transparent text-[#999]"}`}
              onClick={() => setActiveTab("visao-geral")}
            >
              Visão geral
            </button>
            <button
              className={`py-2 px-4 rounded-full ${activeTab === "historico" ? "bg-[rgb(1,219,151)] text-white" : "bg-transparent text-[#999]"}`}
              onClick={navigateToHistorico}
            >
              Histórico
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-6">Dados Pessoais</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-[#999] mb-1">
              Seu nome completo *
            </label>
            <input
              type="text"
              className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md p-2.5 text-white"
              placeholder="Digite seu nome completo"
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value)}
            />
            {errors.nome && (
              <p className="text-red-500 text-xs mt-1">{errors.nome}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-[#999] mb-1">Email</label>
            <input
              type="email"
              className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md p-2.5 text-white"
              value="tassio.leite14@gmail.com"
              readOnly
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-[#999] mb-1">
              Nacionalidade
            </label>
            <select
              className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md p-2.5 text-white"
              value={nacionalidade}
              onChange={(e) => setNacionalidade(e.target.value)}
            >
              <option>Selecione</option>
              <option>Brasil</option>
              <option>Portugal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-[#999] mb-1">CPF *</label>
            <input
              type="text"
              className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md p-2.5 text-white"
              placeholder="Digite seu CPF"
              value={cpfInput}
              onChange={(e) => setCpfInput(formatCPF(e.target.value))}
            />
            {errors.cpf && (
              <p className="text-red-500 text-xs mt-1">{errors.cpf}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-[#999] mb-1">
              Tipo de documento
            </label>
            <select
              className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md p-2.5 text-white"
              value={tipoDocumento}
              onChange={(e) => setTipoDocumento(e.target.value)}
            >
              <option>RG</option>
              <option>CNH</option>
              <option>Passaporte</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-[#999] mb-1">
              Nº documento *
            </label>
            <input
              type="text"
              className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md p-2.5 text-white"
              placeholder="Digite o número do documento"
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
            />
            {errors.documento && (
              <p className="text-red-500 text-xs mt-1">{errors.documento}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm text-[#999] mb-1">DDI</label>
            <select
              className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md p-2.5 text-white"
              value={ddi}
              onChange={(e) => setDdi(e.target.value)}
            >
              <option>+55 (Brasil)</option>
              <option>+351 (Portugal)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-[#999] mb-1">Telefone *</label>
            <input
              type="tel"
              className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md p-2.5 text-white"
              placeholder="Digite seu telefone"
              value={telefone}
              onChange={(e) => setTelefone(formatPhone(e.target.value))}
            />
            {errors.telefone && (
              <p className="text-red-500 text-xs mt-1">{errors.telefone}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm text-[#999] mb-1">
              Data de nascimento *
            </label>
            <input
              type="date"
              className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md p-2.5 text-white"
              value={nascimento}
              onChange={(e) => setNascimento(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-[rgb(1,219,151)] hover:bg-[rgb(0,199,131)] text-white py-3 rounded-md transition-colors"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}
