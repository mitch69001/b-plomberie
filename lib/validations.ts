/**
 * Schémas de validation avec Zod
 */

import { z } from 'zod'

export const leadSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, 'Numéro de téléphone français invalide'),
  cityId: z.string().cuid(),
  postalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
  projectType: z.enum(['installation', 'renovation', 'maintenance', 'autre']),
  message: z.string().optional(),
  budget: z.string().optional(),
  surface: z.string().optional().transform((val) => val ? parseInt(val) : undefined),
})

export type LeadInput = z.infer<typeof leadSchema>
