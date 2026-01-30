import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      where: {
        active: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        code: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(departments)
  } catch (error) {
    console.error('Erreur lors de la récupération des départements:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
