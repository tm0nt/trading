import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function makeExternalApiRequest(valor: number, nomeDevedor: any, cpf: any, email: any, host: any) {
  try {
    // Obter a configuração com o token e o endpoint
    const config = await prisma.config.findUnique({
      where: { id: 1 },
      select: {
        tokenPrivadoGateway: true,
        endPointGateway: true,
      },
    });

    if (!config || !config.tokenPrivadoGateway || !config.endPointGateway) {
      throw new Error("Configuração do gateway não encontrada.");
    }

    const postbackUrl = `${host}/api/deposit/webhook`;
    const token = config.tokenPrivadoGateway;
    const endpoint = `${config.endPointGateway}transactions`; // Concatenando o endpoint

    console.log("Realizando requisição para o gateway externo...");
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "Authorization": `Basic ${Buffer.from(`${token}:x`).toString('base64')}`,
      },
      body: JSON.stringify({
        paymentMethod: "pix",
        customer: {
          document: {
            type: "cpf",
            number: cpf,
          },
          name: nomeDevedor,
          email,
        },
        amount: valor * 100, // Convertendo para centavos
        items: [
          {
            title: "Plataforma Tranding",
            unitPrice: valor * 100, // Também convertendo para centavos
            quantity: 1,
            tangible: false,
          },
        ],
        postbackUrl
      }),
    });

    const data = await response.json();
    return {
      qrcode: data.pix.qrcode, // A URL do QR Code
      externalTransactionId: data.secureId, // ID da transação externa
    };

  } catch (error) {
    console.error("Erro ao fazer requisição externa:", error);
    throw new Error("Erro ao fazer requisição para o gateway.");
  }
}


export async function POST(request: Request) {
  try {
    // Autenticação
    const cookie = await cookies();
    const sessionCookie = cookie.get("session");

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const session = JSON.parse(decodeURIComponent(sessionCookie.value));
    const userId = session.userId;
    const email = session.email;
    const host = request.headers.get("host");

    // Validar dados da requisição
    const { valor, nome, cpf } = await request.json();

    console.log("Dados recebidos para processamento:", { valor, nome, cpf });

    if (!valor || !nome || !cpf) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // Verificar valor mínimo com tratamento para valor nulo
    const config = await prisma.config.findUnique({
      where: { id: 1 },
      select: { valorMinimoDeposito: true },
    });

    const valorMinimo = config?.valorMinimoDeposito ?? 0; // Valor padrão se for null
    console.log("Valor mínimo de depósito:", valorMinimo);

    if (valor < valorMinimo) {
      return NextResponse.json(
        { error: `Valor mínimo para depósito é ${valorMinimo}` },
        { status: 400 },
      );
    }

    // Requisição para a API externa
    const { qrcode, externalTransactionId } = await makeExternalApiRequest(valor, nome, cpf, email, host);

    // Criar o depósito no banco de dados
    const deposit = await prisma.deposit.create({
      data: {
        transactionId: externalTransactionId,
        userId,
        valor,
        tipo: "pix",
        status: "pendente",
        dataCriacao: new Date(),
      },
    });
    return NextResponse.json({
      message: "Depósito registrado com sucesso",
      id: externalTransactionId, // Retorna o ID da transação externa
      qrcode, // Retorna o QRCode gerado
    });
  } catch (error) {
    console.error("Erro ao processar depósito:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
