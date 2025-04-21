import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando." },
        { status: 400 },
      );
    }

    // Verificando se o usuário já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email já está em uso." },
        { status: 400 },
      );
    }

    // Criando a senha criptografada
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criando o novo usuário, balance e audit log
    const newUser = await prisma.user.create({
      data: {
        nome: name,
        email,
        senha: hashedPassword,
        cpf: null,
        nacionalidade: "Brasil",
        documentoTipo: null,
        documentoNumero: null,
        ddi: null,
        telefone: null,
        dataNascimento: null,
        avatarUrl: null,

        // Criando balance para o usuário
        balance: {
          create: {
            saldoDemo: 10000.0,
            saldoReal: 0.0,
          },
        },

        // Criando audit log para o usuário
        auditLogs: {
          create: {
            entidade: "User",
            entidadeId: "", // Vai ser atualizado com o id do usuário depois
            acao: "create",
            valoresAntigos: {}, // Substituído null por um objeto vazio
            valoresNovos: {
              nome: name,
              email,
            },
          },
        },
      },
      include: {
        auditLogs: true, // Incluindo audit logs para pegar o id do audit log
      },
    });

    // Atualizando o audit log com o ID do usuário recém-criado
    await prisma.auditLog.update({
      where: { id: newUser.auditLogs[0].id }, // Usando o id do audit log criado
      data: {
        entidadeId: newUser.id, // Atualizando com o id do usuário
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 },
    );
  }
}
