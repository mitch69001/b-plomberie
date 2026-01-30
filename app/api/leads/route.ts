import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { leadSchema } from '@/lib/validations'
import { sendLeadNotification, sendLeadConfirmation } from '@/lib/email'
import { ZodError } from 'zod'

/**
 * API de capture de leads
 * POST /api/leads
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validation des données
    const validated = leadSchema.parse(data)

    // Informations de tracking
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    const userAgent = request.headers.get('user-agent')
    const referer = request.headers.get('referer')

    // Sauvegarde en base de données
    const lead = await prisma.lead.create({
      data: {
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        cityId: validated.cityId,
        postalCode: validated.postalCode,
        projectType: validated.projectType,
        message: validated.message || null,
        budget: validated.budget || null,
        surface: validated.surface || null,
        status: 'nouveau',
        source: referer || 'direct',
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
      include: {
        city: true,
      },
    })

    // Envoi du webhook vers plateforme tierce (en arrière-plan)
    sendWebhook(lead).catch((error) => {
      console.error('Webhook error:', error)
    })

    // Envoi d'email de notification admin (en arrière-plan)
    sendLeadNotification(lead).catch((error) => {
      console.error('Email notification error:', error)
    })

    // Envoi d'email de confirmation au client (en arrière-plan)
    sendLeadConfirmation(lead).catch((error) => {
      console.error('Email confirmation error:', error)
    })

    return NextResponse.json(
      {
        success: true,
        id: lead.id,
        message: 'Votre demande a été envoyée avec succès',
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Données invalides',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    console.error('Lead creation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Une erreur est survenue',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/leads - Liste des leads (admin uniquement)
 */
export async function GET(request: NextRequest) {
  // TODO: Ajouter l'authentification admin
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const cityId = searchParams.get('cityId')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')

  try {
    const where: any = {}
    if (status) where.status = status
    if (cityId) where.cityId = cityId

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          city: {
            select: {
              name: true,
              postalCode: true,
              department: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ])

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Leads fetch error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des leads',
      },
      { status: 500 }
    )
  }
}

/**
 * Envoi du webhook vers plateforme tierce
 */
async function sendWebhook(lead: any) {
  const webhookUrl = process.env.WEBHOOK_LEAD_URL
  
  if (!webhookUrl) {
    console.log('No webhook URL configured')
    return
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        city: lead.city.name,
        postalCode: lead.postalCode,
        projectType: lead.projectType,
        message: lead.message,
        budget: lead.budget,
        surface: lead.surface,
        createdAt: lead.createdAt,
      }),
    })

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status}`)
    }

    console.log('Webhook sent successfully')
  } catch (error) {
    console.error('Webhook error:', error)
    // Retry logic could be implemented here
  }
}

