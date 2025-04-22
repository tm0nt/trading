import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // ajuste se seu path for diferente

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const status = body.data.status
    const paymentMethod = body.data.paymentMethod

    // Só processa se for pago e método pix
    if (status == 'paid' && paymentMethod == 'pix') {
      const transactionId = body.data.secureId
      const amount = body.data.amount / 100

      // Busca o depósito pelo transactionId
      const deposit = await prisma.deposit.findFirst({
        where: { transactionId },
      })

      if (!deposit) {
        return NextResponse.json({ error: 'Depósito não encontrado' }, { status: 404 })
      }

      // Verifica se o depósito já está com status 'concluido'
      if (deposit.status === 'concluido') {
        return NextResponse.json({ message: 'Depósito já processado' }, { status: 200 })
      }

      const userId = deposit.userId

      // Atualiza o saldoReal do usuário
      await prisma.balance.updateMany({
        where: { userId },
        data: {
          saldoReal: {
            increment: amount,
          },
        },
      })

      // Atualiza o status do depósito para 'concluido'
      await prisma.deposit.update({
        where: { id: deposit.id },
        data: { status: 'concluido' },
      })

      return NextResponse.json({ message: 'Saldo atualizado e depósito concluído' }, { status: 200 })
    }

    return NextResponse.json({ message: 'Evento ignorado' }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao processar o evento' }, { status: 500 })
  }
}
