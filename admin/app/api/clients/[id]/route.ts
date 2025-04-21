import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const client = await pool.connect();

  try {
    // Verificar se o usuário existe
    const userCheck = await client.query(
      'SELECT id FROM "User" WHERE id = $1',
      [params.id],
    );

    if (userCheck.rowCount === 0) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 },
      );
    }

    // Iniciar transação
    await client.query("BEGIN");

    // Primeiro deletar os registros relacionados nas tabelas filhas
    await client.query('DELETE FROM "Deposit" WHERE "userId" = $1', [
      params.id,
    ]);

    await client.query('DELETE FROM "Withdrawal" WHERE "userId" = $1', [
      params.id,
    ]);

    await client.query('DELETE FROM "Balance" WHERE "userId" = $1', [
      params.id,
    ]);

    // Finalmente deletar o usuário
    await client.query('DELETE FROM "User" WHERE id = $1', [params.id]);

    // Confirmar transação
    await client.query("COMMIT");

    return NextResponse.json(
      { message: "Usuário deletado com sucesso" },
      { status: 200 },
    );
  } catch (error) {
    // Reverter transação em caso de erro
    await client.query("ROLLBACK");
    console.error("Erro ao deletar usuário:", error);

    return NextResponse.json(
      { error: "Erro interno ao deletar usuário" },
      { status: 500 },
    );
  } finally {
    // Liberar o cliente de volta para o pool
    client.release();
  }
}
