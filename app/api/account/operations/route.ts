import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Obter o cookie da sessão
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

    // Buscar as operações do usuário no banco de dados
    const operations = await prisma.tradeOperation.findMany({
      where: { userId },
      orderBy: {
        data: "desc", // Ordena as operações pela data, do mais recente para o mais antigo
      },
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    // Se não encontrar nenhuma operação
    if (!operations || operations.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma operação encontrada" },
        { status: 404 },
      );
    }

    // Retorna as operações
    return NextResponse.json({
      operations: operations.map((op) => ({
        id: op.id,
        ativo: op.ativo,
        tempo: op.tempo,
        previsao: op.previsao,
        vela: op.vela,
        abertura: op.abertura,
        fechamento: op.fechamento,
        valor: op.valor,
        status: op.status,
        resultado: op.resultado,
        data: op.data.toISOString(), // Formato ISO para facilitar o uso no frontend
      })),
    });
  } catch (error) {
    console.error("Erro ao processar a requisição:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
