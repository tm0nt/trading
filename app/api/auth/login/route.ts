// /app/api/auth/login/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 400 },
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.senha);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Senha incorreta." }, { status: 400 });
    }

    // 👇 await aqui
    const cookieStore = await cookies();
    cookieStore.set(
      "session",
      JSON.stringify({
        userId: user.id,
        email: user.email,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      },
    );

    return NextResponse.json({ message: "Login bem-sucedido", user });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 },
    );
  }
}
