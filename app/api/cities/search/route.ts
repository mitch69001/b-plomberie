import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query || query.length < 2) {
    return NextResponse.json([])
  }

  try {
    const cities = await prisma.city.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      select: {
        name: true,
        slug: true,
        department: true,
        region: true,
        _count: {
          select: {
            businesses: true,
          },
        },
      },
      orderBy: {
        population: 'desc',
      },
      take: 10,
    })

    return NextResponse.json(cities)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json([])
  }
}
