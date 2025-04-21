import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
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
    const payload = await request.json();

    const requiredFields = [
      "balance",
      "data",
      "ativo",
      "tempo",
      "previsao",
      "vela",
      "abertura",
      "valor",
      "status",
      "resultado",
      "balance",
      "receita"
    ];

    for (const field of requiredFields) {
      if (!(field in payload)) {
        return NextResponse.json(
          { error: `Campo obrigatório ausente: ${field}` },
          { status: 400 }
        );
      }
    }

    const { balance, valor } = payload;

    if (balance !== "demo" && balance !== "real") {
      return NextResponse.json(
        { error: "Tipo de saldo inválido" },
        { status: 400 }
      );
    }

    // Buscar saldo atual do usuário
    const userBalance = await prisma.balance.findUnique({
      where: { userId },
    });

    if (!userBalance) {
      return NextResponse.json(
        { error: "Saldo não encontrado para o usuário" },
        { status: 404 }
      );
    }

    // Verificar saldo disponível
    const saldoAtual = balance === "demo" ? userBalance.saldoDemo : userBalance.saldoReal;

    if (saldoAtual < valor) {
      return NextResponse.json(
        { error: "Saldo insuficiente para realizar a operação" },
        { status: 400 }
      );
    }

    // Descontar valor do saldo
    const novoSaldo = saldoAtual - valor;

    await prisma.balance.update({
      where: { userId },
      data:
        balance === "demo"
          ? { saldoDemo: novoSaldo }
          : { saldoReal: novoSaldo },
    });

    // Criar operação
    const operation = await prisma.tradeOperation.create({
      data: {
        userId,
        data: new Date(payload.data),
        ativo: payload.ativo,
        tempo: payload.tempo,
        previsao: payload.previsao,
        vela: payload.vela,
        abertura: payload.abertura,
        fechamento: payload.fechamento ?? null,
        valor: payload.valor,
        estornado: false,
        executado: true,
        status: payload.status,
        receita: payload.receita,
        resultado: payload.resultado,
      },
    });

    // Retornar apenas o "id" da operação criada
    return NextResponse.json({
      id: operation.id,
    });

  } catch (error) {
    console.error("Erro ao registrar operação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
