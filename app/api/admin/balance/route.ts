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

    // Consultas SQL
    const queries = {
      mesAtual: {
        text: `
          SELECT 
            (SELECT COALESCE(SUM(valor), 0) FROM deposit 
            WHERE data_criacao >= $1 AND status = 'concluido') AS "totalDepositado",
            (SELECT COALESCE(SUM(valor), 0) FROM withdrawal 
            WHERE data_pagamento >= $1 AND status = 'concluido') AS "totalSaquePagos",
            (SELECT COUNT(*) FROM users 
            WHERE created_at >= $1) AS "clientesCadastrados",
            (SELECT COUNT(*) FROM withdrawal 
            WHERE data_pedido >= $1 AND status = 'pendente') AS "SaquesPendentes"
        `,
        values: [mesAtualInicio],
      },
      mesPassado: {
        text: `
          SELECT 
            (SELECT COALESCE(SUM(valor), 0) FROM deposit 
            WHERE data_criacao BETWEEN $1 AND $2 AND status = 'concluido') AS "totalDepositado",
            (SELECT COALESCE(SUM(valor), 0) FROM withdrawal 
            WHERE data_pagamento BETWEEN $1 AND $2 AND status = 'concluido') AS "totalSaquePagos",
            (SELECT COUNT(*) FROM users 
            WHERE created_at BETWEEN $1 AND $2) AS "clientesCadastrados",
            (SELECT COUNT(*) FROM withdrawal 
            WHERE data_pedido BETWEEN $1 AND $2 AND status = 'pendente') AS "SaquesPendentes"
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
      mesAtual: resultMesAtual.rows[0],
      mesPassado: resultMesPassado.rows[0],
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
