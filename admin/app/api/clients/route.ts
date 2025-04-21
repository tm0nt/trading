import { NextResponse } from "next/server";
import pool from "../../../lib/db";

// Tipos para os dados retornados
type UserRow = {
  id: string;
  nome: string;
  email: string;
  cpf: string | null;
  telefone: string | null;
  documentoNumero: string | null;
  documentoTipo: string | null;
  dataNascimento: string | null;
  dataCadastro: string;
  saldoReal: number | null;
  saldoDemo: number | null;
};

type DepositRow = {
  id: string;
  valor: number;
  tipo: string;
  status: string;
  dataCriacao: string;
  dataPagamento: string | null;
};

type WithdrawalRow = {
  id: string;
  valor: number;
  taxa: number;
  tipoChave: string;
  chave: string;
  status: string;
  dataPedido: string;
  dataPagamento: string | null;
};

export async function GET() {
  try {
    // Buscar todos os usuários com informações relevantes
    const { rows: users } = await pool.query<UserRow>(`
      SELECT 
        u.id, u.nome, u.email, u.cpf, u.telefone, u."documentoNumero", u."documentoTipo",
        u."dataNascimento", u."createdAt" as "dataCadastro", 
        b."saldoReal", b."saldoDemo"
      FROM "User" u
      LEFT JOIN "Balance" b ON u.id = b."userId"
      ORDER BY u."createdAt" DESC
    `);

    const formattedUsers = await Promise.all(
      users.map(async (user: UserRow) => {
        // Buscar depósitos do usuário
        const { rows: deposits } = await pool.query<DepositRow>(
          `
        SELECT id, valor, tipo, status, "dataCriacao", "dataPagamento" 
        FROM "Deposit" 
        WHERE "userId" = $1
        ORDER BY "dataCriacao" DESC
      `,
          [user.id],
        );

        // Buscar saques do usuário
        const { rows: withdrawals } = await pool.query<WithdrawalRow>(
          `
        SELECT id, valor, taxa, "tipoChave", chave, status, "dataPedido", "dataPagamento" 
        FROM "Withdrawal" 
        WHERE "userId" = $1
        ORDER BY "dataPedido" DESC
      `,
          [user.id],
        );

        // Calcular totais de depósitos e saques
        const totalDepositado = deposits
          .filter((d: DepositRow) => d.status === "concluido")
          .reduce((sum: number, deposit: DepositRow) => sum + deposit.valor, 0);

        const totalSacado = withdrawals
          .filter((w: WithdrawalRow) => w.status === "concluido")
          .reduce(
            (sum: number, withdrawal: WithdrawalRow) => sum + withdrawal.valor,
            0,
          );

        const saquesPendentes = withdrawals
          .filter((w: WithdrawalRow) => w.status === "pendente")
          .reduce(
            (sum: number, withdrawal: WithdrawalRow) => sum + withdrawal.valor,
            0,
          );

        const saldoDisponivel = (user.saldoReal || 0) - saquesPendentes;

        return {
          id: user.id,
          nome: user.nome,
          email: user.email,
          cpf: user.cpf,
          telefone: user.telefone,
          documentoNumero: user.documentoNumero,
          documentoTipo: user.documentoTipo,
          dataNascimento: user.dataNascimento,
          dataCadastro: user.dataCadastro,
          saldoReal: user.saldoReal || 0,
          saldoDemo: user.saldoDemo || 0,
          saldoDisponivel: saldoDisponivel > 0 ? saldoDisponivel : 0,
          totalDepositado,
          totalSacado,
          totalDepositadoFormatado: totalDepositado.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          totalSacadoFormatado: totalSacado.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          saldoRealFormatado: (user.saldoReal || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          saldoDemoFormatado: (user.saldoDemo || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          saldoDisponivelFormatado:
            saldoDisponivel > 0
              ? saldoDisponivel.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })
              : "R$ 0,00",
          deposits: deposits.map((deposit: DepositRow) => ({
            id: deposit.id,
            valor: deposit.valor,
            valorFormatado: deposit.valor.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            }),
            tipo: deposit.tipo,
            status: deposit.status,
            dataCriacao: deposit.dataCriacao,
            dataPagamento: deposit.dataPagamento,
          })),
          withdrawals: withdrawals.map((withdrawal: WithdrawalRow) => ({
            id: withdrawal.id,
            valor: withdrawal.valor,
            valorFormatado: withdrawal.valor.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            }),
            taxa: withdrawal.taxa,
            tipoChave: withdrawal.tipoChave,
            chave: withdrawal.chave,
            status: withdrawal.status,
            dataPedido: withdrawal.dataPedido,
            dataPagamento: withdrawal.dataPagamento,
          })),
        };
      }),
    );

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar usuários" },
      { status: 500 },
    );
  }
}
