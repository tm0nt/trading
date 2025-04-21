import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookie = await cookies();
    const sessionCookie = cookie.get("session");

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const session = JSON.parse(decodeURIComponent(sessionCookie.value));
    const userId = session.userId;

    const body = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        nome: body.nome,
        cpf: body.cpf,
        telefone: body.telefone,
        dataNascimento: body.dataNascimento
          ? new Date(body.dataNascimento)
          : undefined,
        documentoTipo: body.documentoTipo,
        documentoNumero: body.documentoNumero,
        nacionalidade: body.nacionalidade,
        ddi: body.ddi,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Erro ao atualizar dados:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
