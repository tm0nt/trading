import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: Request) {
  const client = await pool.connect();

  try {
    // Buscar todos os registros de saque, ordenando pelo mais recente primeiro
    const result = await client.query(
      'SELECT * FROM "Withdrawal" ORDER BY "dataPedido" DESC',
    );

    // Retornar os saques em formato JSON
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar saques:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar saques" },
      { status: 500 },
    );
  } finally {
    // Liberar o cliente de volta para o pool
    client.release();
  }
}
