import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookie = await cookies();
    const sessionCookie = cookie.get("session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    let session;
    try {
      session = JSON.parse(decodeURIComponent(sessionCookie.value));
    } catch (error) {
      return NextResponse.json({ error: "Sessão inválida" }, { status: 400 });
    }

    const userId = session.userId;

    // Buscar os dados do usuário e o saldo
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        balance: true,
      },
    });

    if (!user || !user.balance) {
      return NextResponse.json(
        { error: "Usuário ou saldo não encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      userId: user.id,
      avatarUrl: user.avatarUrl,
      email: user.email,
      name: user.nome,
      cpf: user.cpf,
      nationality: user.nacionalidade,
      documentType: user.documentoTipo,
      documentNumber: user.documentoNumero,
      phone: user.telefone,
      birthdate: user.dataNascimento,
      createdAt: user.createdAt,
      demoBalance: Number(user.balance.saldoDemo),
      realBalance: Number(user.balance.saldoReal),
    });
  } catch (error) {
    console.error("Erro ao processar a requisição:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
