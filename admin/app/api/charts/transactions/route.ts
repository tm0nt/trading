import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { subDays, subMonths } from "date-fns";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "diario";

  try {
    const client = await pool.connect();

    let query = "";
    let params: any[] = [];
    const today = new Date();

    console.log("Período selecionado:", period);

    // Query para totais de depósitos e saques por período
    if (period === "diario") {
      const startDate = subDays(today, 14);
      query = `
        SELECT 
          dates.date,
          COALESCE(SUM(d.valor), 0) as "totalDeposits",
          COALESCE(SUM(w.valor), 0) as "totalWithdrawals"
        FROM 
          (SELECT generate_series($1::date, $2::date, '1 day'::interval) as date) dates
        LEFT JOIN "Deposit" d ON DATE_TRUNC('day', d."dataCriacao") = dates.date AND d.status = 'concluido'
        LEFT JOIN "Withdrawal" w ON DATE_TRUNC('day', w."dataPagamento") = dates.date AND w.status = 'concluido'
        GROUP BY dates.date
        ORDER BY dates.date
      `;
      params = [startDate, today];
    } else if (period === "semanal") {
      const startDate = subDays(today, 8 * 7);
      query = `
        SELECT 
          dates.date,
          COALESCE(SUM(d.valor), 0) as "totalDeposits",
          COALESCE(SUM(w.valor), 0) as "totalWithdrawals"
        FROM 
          (SELECT generate_series($1::date, $2::date, '1 week'::interval) as date) dates
        LEFT JOIN "Deposit" d ON DATE_TRUNC('week', d."dataCriacao") = dates.date AND d.status = 'concluido'
        LEFT JOIN "Withdrawal" w ON DATE_TRUNC('week', w."dataPagamento") = dates.date AND w.status = 'concluido'
        GROUP BY dates.date
        ORDER BY dates.date
      `;
      params = [startDate, today];
    } else {
      const startDate = subMonths(today, 12);
      query = `
        SELECT 
          dates.date,
          COALESCE(SUM(d.valor), 0) as "totalDeposits",
          COALESCE(SUM(w.valor), 0) as "totalWithdrawals"
        FROM 
          (SELECT generate_series($1::date, $2::date, '1 month'::interval) as date) dates
        LEFT JOIN "Deposit" d ON DATE_TRUNC('month', d."dataCriacao") = dates.date AND d.status = 'concluido'
        LEFT JOIN "Withdrawal" w ON DATE_TRUNC('month', w."dataPagamento") = dates.date AND w.status = 'concluido'
        GROUP BY dates.date
        ORDER BY dates.date
      `;
      params = [startDate, today];
    }

    // Executa a consulta para depósitos e saques
    console.log("Executando consulta de totais de depósitos e saques...");
    const result = await client.query(query, params);
    console.log("Resultado de totais de depósitos e saques:", result.rows);

    // Query para distribuição de clientes baseada em depósitos
    const distributionQuery = `
      SELECT
        CASE
          WHEN total_deposit BETWEEN 0 AND 1000 THEN 'R$0 - R$1.000'
          WHEN total_deposit BETWEEN 1001 AND 5000 THEN 'R$1.001 - R$5.000'
          WHEN total_deposit BETWEEN 5001 AND 10000 THEN 'R$5.001 - R$10.000'
          WHEN total_deposit BETWEEN 10001 AND 20000 THEN 'R$10.001 - R$20.000'
          ELSE 'Acima de R$20.000'
        END AS faixa,
        COUNT(*) AS quantidade
      FROM (
        -- Total de depósitos por cliente
        SELECT "userId", SUM(d.valor) AS total_deposit
        FROM "Deposit" d
        WHERE d.status = 'concluido'  -- Considerando apenas depósitos concluídos
        GROUP BY "userId"
      ) AS deposit_totals
      GROUP BY faixa
      ORDER BY faixa;
    `;
    console.log("Executando consulta de distribuição de clientes...");
    const distributionResult = await client.query(distributionQuery);
    console.log(
      "Resultado de distribuição de clientes:",
      distributionResult.rows,
    );

    client.release();

    // Formatar datas de acordo com o período para totais de depósitos/saques
    const formattedData = result.rows.map((row: any) => ({
      date: format(
        new Date(row.date),
        period === "diario"
          ? "dd/MM"
          : period === "semanal"
            ? "'Sem' w"
            : "MMM",
        { locale: ptBR },
      ),
      totalDeposits: Number(row.totalDeposits),
      totalWithdrawals: Number(row.totalWithdrawals),
    }));
    console.log(
      "Dados formatados de totais de depósitos e saques:",
      formattedData,
    );

    // Formatar a distribuição de clientes por faixa de depósitos
    const formattedDistribution = distributionResult.rows.map((row: any) => ({
      faixa: row.faixa,
      quantidade: row.quantidade,
    }));
    console.log(
      "Dados formatados de distribuição de clientes:",
      formattedDistribution,
    );

    return NextResponse.json({ formattedData, formattedDistribution });
  } catch (error) {
    console.error("Erro ao buscar dados de transações:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados de transações" },
      { status: 500 },
    );
  }
}
