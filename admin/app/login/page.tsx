import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login | Painel Administrativo",
  description: "Acesse o painel administrativo",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background/80 to-background p-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
