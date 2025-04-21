// app/api/account/withdraw/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // 1. Autenticação
    const cookie = await cookies();
    const sessionCookie = cookie.get("session");

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const session = JSON.parse(decodeURIComponent(sessionCookie.value));
    const userId = session.userId;

    // 2. Validar dados da requisição
    const { valor, tipoChave, chave } = await request.json();

    if (!valor || !tipoChave || !chave) {
      return NextResponse.json(
        { error: "Dados incompletos. Preencha todos os campos." },
        { status: 400 },
      );
    }

    // 3. Obter configurações do sistema
    const config = await prisma.config.findUnique({
      where: { id: 1 },
      select: {
        valorMinimoSaque: true,
        taxa: true, // Usando o campo correto do seu schema
      },
    });

    const valorMinimoSaque = config?.valorMinimoSaque ?? 50.0;
    const taxaFixa = config?.taxa ?? 5.0; // Usando o campo taxa do schema

    // 4. Verificar valor mínimo de saque
    if (valor < valorMinimoSaque) {
      return NextResponse.json(
        {
          error: `Valor mínimo para saque é ${valorMinimoSaque.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
        },
        { status: 400 },
      );
    }

    // 5. Verificar saldo real disponível
    const balance = await prisma.balance.findUnique({
      where: { userId },
      select: { saldoReal: true },
    });

    if (!balance) {
      return NextResponse.json(
        { error: "Saldo não encontrado" },
        { status: 400 },
      );
    }

    // Calculando valor total (valor solicitado + taxa fixa)
    const valorTotal = valor + taxaFixa;

    if (balance.saldoReal < valorTotal) {
      return NextResponse.json(
        {
          error: "Saldo insuficiente",
          detail: `Seu saldo real é ${balance.saldoReal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} e o valor solicitado com taxa fixa de ${taxaFixa.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} é ${valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
        },
        { status: 400 },
      );
    }

    // 6. Criar registro de saque
    const withdrawal = await prisma.$transaction(async (prisma) => {
      // Atualizar saldo (decrementar valor total)
      await prisma.balance.update({
        where: { userId },
        data: { saldoReal: { decrement: valorTotal } },
      });

      // Criar registro de saque
      return await prisma.withdrawal.create({
        data: {
          userId,
          valor,
          taxa: taxaFixa, // Armazenando a taxa fixa
          tipoChave,
          chave,
          status: "pendente",
          dataPedido: new Date(),
        },
      });
    });

    // 7. Retornar resposta de sucesso
    return NextResponse.json({
      success: true,
      message: "Saque solicitado com sucesso",
      withdrawal: {
        ...withdrawal,
        valorLiquido: withdrawal.valor, // Valor líquido é igual ao valor solicitado
        dataPedido: withdrawal.dataPedido.toISOString(),
      },
      newBalance: balance.saldoReal - valorTotal,
      taxaAplicada: taxaFixa.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    });
  } catch (error) {
    console.error("Erro ao processar saque:", error);
    return NextResponse.json(
      {
        error: "Erro ao processar saque",
        detail: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}
