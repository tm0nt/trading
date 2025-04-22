import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
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

    // Obtém o parâmetro 'id' da query string (id é UUID)
    const url = new URL(request.url);
    const id = url.searchParams.get('id'); // Pega o valor do parâmetro 'id'

    if (!id) {
      return NextResponse.json({ error: "ID da operação não fornecido" }, { status: 400 });
    }

    const { tipo, resultado, fechamento } = await request.json();

    if (!["demo", "real"].includes(tipo)) {
      return NextResponse.json({ error: "Tipo de saldo inválido" }, { status: 400 });
    }

    if (!["perda", "ganho"].includes(resultado)) {
      return NextResponse.json({ error: "Resultado inválido" }, { status: 400 });
    }

    // Buscar saldo atual
    const balance = await prisma.balance.findUnique({
      where: { userId },
    });

    if (!balance) {
      return NextResponse.json({ error: "Saldo não encontrado" }, { status: 404 });
    }

    if (resultado === "perda") {
      // Se for perda, não fazemos alteração no saldo
      return NextResponse.json({
        message: "Sem alteração no saldo devido à perda",
        saldoAtualizado: {
          tipo,
          saldo: tipo === "demo" ? balance.saldoDemo : balance.saldoReal,
        },
      });
    }

    // Se for ganho, buscamos a operação e atualizamos o saldo
    const tradeOperation = await prisma.tradeOperation.findUnique({
      where: { id }, // Aqui usamos o ID da operação como UUID
    });

    if (!tradeOperation) {
      return NextResponse.json({ error: "Operação não encontrada" }, { status: 404 });
    }

    // Pega o valor da operação diretamente da tabela tradeOperation
    const valorReceita = tradeOperation.valor + tradeOperation.receita;

    // Atualizar saldo com o valor + receita
    let novoSaldo;
    if (tipo === "demo") {
      novoSaldo = balance.saldoDemo + valorReceita;

      await prisma.balance.update({
        where: { userId },
        data: { saldoDemo: novoSaldo },
      });
    } else {
      novoSaldo = balance.saldoReal + valorReceita;

      await prisma.balance.update({
        where: { userId },
        data: { saldoReal: novoSaldo },
      });
    }

    // Atualizar a operação com o valor de fechamento e resultado
    await prisma.tradeOperation.update({
      where: { id },
      data: {
        fechamento, // Atualiza o valor de fechamento
        resultado,  // Atualiza o resultado ("ganho" ou "perda")
      },
    });

    return NextResponse.json({
      message: "Saldo atualizado com sucesso",
      saldoAtualizado: {
        tipo,
        saldo: novoSaldo,
      },
    });
    
  } catch (error) {
    console.error("Erro ao atualizar saldo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
