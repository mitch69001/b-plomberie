import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        department: true,
        region: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(cities)
  } catch (error) {
    console.error('Erreur lors de la récupération des villes:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
