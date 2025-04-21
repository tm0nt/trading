import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Obter configurações (apenas campos específicos)
export async function GET() {
  try {
    const config = await prisma.config.findUnique({
      where: { id: 1 },
      select: {
        logoUrl: true,
        nomeSite: true,
        valorMinimoDeposito: true,
        valorMinimoSaque: true,
      },
    });

    if (!config) {
      return NextResponse.json(
        { error: "Configurações não encontradas" },
        { status: 404 },
      );
    }

    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json(
      { error: "Falha ao carregar configurações" },
      { status: 500 },
    );
  }
}
