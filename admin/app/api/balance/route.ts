import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const client = await pool.connect();

    // Definir períodos
    const hoje = new Date();
    const mesAtualInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const mesPassadoInicio = new Date(
      hoje.getFullYear(),
      hoje.getMonth() - 1,
      1,
    );
    const mesPassadoFim = new Date(hoje.getFullYear(), hoje.getMonth(), 0);

    // Consultas SQL atualizadas para usar os nomes exatos dos modelos
    const queries = {
      mesAtual: {
        text: `
          SELECT 
            (SELECT COALESCE(SUM("valor"), 0) FROM "Deposit" 
             WHERE "dataCriacao" >= $1 AND "status" = 'concluido') AS "totalDepositado",
            
            (SELECT COALESCE(SUM("valor"), 0) FROM "Withdrawal" 
             WHERE "dataPagamento" >= $1 AND "status" = 'concluido') AS "totalSaquePagos",
            
            (SELECT COUNT(*) FROM "User" 
             WHERE "createdAt" >= $1) AS "clientesCadastrados",
            
            (SELECT COUNT(*) FROM "Withdrawal" 
             WHERE "dataPedido" >= $1 AND "status" = 'pendente') AS "SaquesPendentes"
        `,
        values: [mesAtualInicio],
      },
      mesPassado: {
        text: `
          SELECT 
            (SELECT COALESCE(SUM("valor"), 0) FROM "Deposit" 
             WHERE "dataCriacao" BETWEEN $1 AND $2 AND "status" = 'concluido') AS "totalDepositado",
            
            (SELECT COALESCE(SUM("valor"), 0) FROM "Withdrawal" 
             WHERE "dataPagamento" BETWEEN $1 AND $2 AND "status" = 'concluido') AS "totalSaquePagos",
            
            (SELECT COUNT(*) FROM "User" 
             WHERE "createdAt" BETWEEN $1 AND $2) AS "clientesCadastrados",
            
            (SELECT COUNT(*) FROM "Withdrawal" 
             WHERE "dataPedido" BETWEEN $1 AND $2 AND "status" = 'pendente') AS "SaquesPendentes"
        `,
        values: [mesPassadoInicio, mesPassadoFim],
      },
    };

    // Executar consultas em paralelo
    const [resultMesAtual, resultMesPassado] = await Promise.all([
      client.query(queries.mesAtual),
      client.query(queries.mesPassado),
    ]);

    client.release();

    // Formatar resposta
    const response = {
      mesAtual: {
        totalDepositado: Number(resultMesAtual.rows[0].totalDepositado) || 0,
        totalSaquePagos: Number(resultMesAtual.rows[0].totalSaquePagos) || 0,
        clientesCadastrados:
          Number(resultMesAtual.rows[0].clientesCadastrados) || 0,
        SaquesPendentes: Number(resultMesAtual.rows[0].SaquesPendentes) || 0,
      },
      mesPassado: {
        totalDepositado: Number(resultMesPassado.rows[0].totalDepositado) || 0,
        totalSaquePagos: Number(resultMesPassado.rows[0].totalSaquePagos) || 0,
        clientesCadastrados:
          Number(resultMesPassado.rows[0].clientesCadastrados) || 0,
        SaquesPendentes: Number(resultMesPassado.rows[0].SaquesPendentes) || 0,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar estatísticas" },
      { status: 500 },
    );
  }
}
