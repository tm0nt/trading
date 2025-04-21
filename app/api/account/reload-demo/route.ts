import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const cookie = await cookies();

  const sessionCookie = cookie.get("session");

  if (!sessionCookie) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const session = JSON.parse(decodeURIComponent(sessionCookie.value));
  const userId = session.userId;

  const updated = await prisma.balance.update({
    where: { userId },
    data: {
      saldoDemo: 10000,
    },
  });

  return NextResponse.json({
    success: true,
    demoBalance: Number(updated.saldoDemo),
  });
}
