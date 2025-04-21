import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookie = await cookies();
  // Deletando o cookie da sessão de forma assíncrona
  cookie.delete("session");

  // Resposta de sucesso
  return NextResponse.json({ message: "Logout bem-sucedido" });
}
