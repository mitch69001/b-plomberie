/**
 * Service d'envoi d'emails avec nodemailer
 * Gestion des notifications pour les leads et autres communications
 */

import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
}

interface LeadEmailData {
  id: string
  name: string
  email: string
  phone: string
  city: {
    name: string
    postalCode: string
    department: string
  }
  projectType: string
  message?: string | null
  budget?: string | null
  surface?: number | null
  createdAt: Date
}

/**
 * Crée un transporteur nodemailer
 */
function createTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASSWORD
  
  if (!host || !user || !pass) {
    console.warn('⚠️  Configuration SMTP manquante - emails désactivés')
    return null
  }
  
  const config: EmailConfig = {
    host,
    port: parseInt(port || '587'),
    secure: port === '465', // true pour 465, false pour les autres ports
    auth: {
      user,
      pass,
    },
  }
  
  return nodemailer.createTransport(config)
}

/**
 * Envoie un email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const transporter = createTransporter()
  
  if (!transporter) {
    console.log('📧 Email non envoyé (SMTP non configuré)')
    return false
  }
  
  try {
    const from = options.from || process.env.SMTP_FROM || process.env.SMTP_USER
    
    await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })
    
    console.log(`✅ Email envoyé: ${options.subject}`)
    return true
  } catch (error) {
    console.error('❌ Erreur envoi email:', error)
    return false
  }
}

/**
 * Envoie une notification pour un nouveau lead
 */
export async function sendLeadNotification(lead: LeadEmailData): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL
  
  if (!adminEmail) {
    console.warn('⚠️  ADMIN_EMAIL non configuré - notification non envoyée')
    return false
  }
  
  const projectTypeLabels: Record<string, string> = {
    installation: 'Nouvelle installation',
    renovation: 'Rénovation',
    maintenance: 'Maintenance',
    autre: 'Autre',
  }
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
        }
        .header {
          background: linear-gradient(135deg, #1e40af 0%, #ea580c 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .info-box {
          background: white;
          padding: 20px;
          margin: 15px 0;
          border-radius: 8px;
          border-left: 4px solid #1e40af;
        }
        .label {
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 5px;
        }
        .value {
          color: #333;
          margin-bottom: 15px;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #666;
          font-size: 12px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: #1e40af;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎯 Nouveau Lead Reçu</h1>
      </div>
      
      <div class="content">
        <p>Bonjour,</p>
        <p>Une nouvelle demande de devis a été soumise sur votre plateforme.</p>
        
        <div class="info-box">
          <div class="label">👤 Contact</div>
          <div class="value">
            <strong>${lead.name}</strong><br>
            📧 ${lead.email}<br>
            📱 ${lead.phone}
          </div>
          
          <div class="label">📍 Localisation</div>
          <div class="value">
            ${lead.city.name} (${lead.city.postalCode})<br>
            Département: ${lead.city.department}
          </div>
          
          <div class="label">🏗️ Type de projet</div>
          <div class="value">${projectTypeLabels[lead.projectType] || lead.projectType}</div>
          
          ${lead.budget ? `
            <div class="label">💰 Budget</div>
            <div class="value">${lead.budget}</div>
          ` : ''}
          
          ${lead.surface ? `
            <div class="label">📐 Surface disponible</div>
            <div class="value">${lead.surface} m²</div>
          ` : ''}
          
          ${lead.message ? `
            <div class="label">💬 Message</div>
            <div class="value">${lead.message}</div>
          ` : ''}
          
          <div class="label">🕒 Date de la demande</div>
          <div class="value">${new Date(lead.createdAt).toLocaleString('fr-FR')}</div>
        </div>
        
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/leads" class="button">
            Voir dans l'admin
          </a>
        </div>
      </div>
      
      <div class="footer">
        <p>Cet email a été généré automatiquement par votre plateforme de génération de leads photovoltaïques.</p>
        <p>&copy; ${new Date().getFullYear()} Installateurs Photovoltaïque</p>
      </div>
    </body>
    </html>
  `
  
  const text = `
    Nouveau Lead Reçu
    
    Contact:
    Nom: ${lead.name}
    Email: ${lead.email}
    Téléphone: ${lead.phone}
    
    Localisation: ${lead.city.name} (${lead.city.postalCode})
    Département: ${lead.city.department}
    
    Type de projet: ${projectTypeLabels[lead.projectType] || lead.projectType}
    ${lead.budget ? `Budget: ${lead.budget}` : ''}
    ${lead.surface ? `Surface: ${lead.surface} m²` : ''}
    ${lead.message ? `Message: ${lead.message}` : ''}
    
    Date: ${new Date(lead.createdAt).toLocaleString('fr-FR')}
    
    Voir dans l'admin: ${process.env.NEXT_PUBLIC_SITE_URL}/admin/leads
  `
  
  return await sendEmail({
    to: adminEmail,
    subject: `🎯 Nouveau lead: ${lead.name} - ${lead.city.name}`,
    html,
    text,
  })
}

/**
 * Envoie un email de confirmation au client
 */
export async function sendLeadConfirmation(lead: LeadEmailData): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
        }
        .header {
          background: linear-gradient(135deg, #1e40af 0%, #ea580c 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .highlight {
          background: white;
          padding: 20px;
          margin: 20px 0;
          border-radius: 8px;
          border-left: 4px solid #10b981;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>✅ Demande bien reçue</h1>
      </div>
      
      <div class="content">
        <p>Bonjour ${lead.name},</p>
        
        <p>Nous avons bien reçu votre demande de devis pour une installation de panneaux solaires à <strong>${lead.city.name}</strong>.</p>
        
        <div class="highlight">
          <h3 style="margin-top: 0; color: #1e40af;">📋 Récapitulatif de votre demande</h3>
          <p><strong>Ville:</strong> ${lead.city.name} (${lead.city.postalCode})</p>
          <p><strong>Type de projet:</strong> ${lead.projectType}</p>
          ${lead.surface ? `<p><strong>Surface:</strong> ${lead.surface} m²</p>` : ''}
          ${lead.budget ? `<p><strong>Budget:</strong> ${lead.budget}</p>` : ''}
        </div>
        
        <h3>📞 Prochaines étapes</h3>
        <ol>
          <li>Nos installateurs partenaires RGE vont étudier votre demande</li>
          <li>Vous serez contacté sous <strong>24-48h</strong> par téléphone ou email</li>
          <li>Vous recevrez jusqu'à 3 devis comparatifs gratuits et sans engagement</li>
        </ol>
        
        <p style="background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 3px solid #fbbf24;">
          <strong>💡 Conseil:</strong> Préparez vos questions et pensez à vérifier la surface disponible sur votre toiture.
        </p>
        
        <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
        
        <p>Cordialement,<br>L'équipe Installateurs Photovoltaïque</p>
      </div>
      
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Installateurs Photovoltaïque</p>
      </div>
    </body>
    </html>
  `
  
  const text = `
    Bonjour ${lead.name},
    
    Nous avons bien reçu votre demande de devis pour une installation de panneaux solaires à ${lead.city.name}.
    
    Récapitulatif:
    - Ville: ${lead.city.name} (${lead.city.postalCode})
    - Type de projet: ${lead.projectType}
    ${lead.surface ? `- Surface: ${lead.surface} m²` : ''}
    ${lead.budget ? `- Budget: ${lead.budget}` : ''}
    
    Prochaines étapes:
    1. Nos installateurs partenaires RGE vont étudier votre demande
    2. Vous serez contacté sous 24-48h
    3. Vous recevrez jusqu'à 3 devis comparatifs gratuits
    
    Cordialement,
    L'équipe Installateurs Photovoltaïque
  `
  
  return await sendEmail({
    to: lead.email,
    subject: `✅ Votre demande de devis pour ${lead.city.name}`,
    html,
    text,
  })
}

/**
 * Envoie un email de test
 */
export async function sendTestEmail(to: string): Promise<boolean> {
  return await sendEmail({
    to,
    subject: 'Test Email - Configuration SMTP',
    html: `
      <h1>Test réussi ✅</h1>
      <p>Votre configuration SMTP fonctionne correctement.</p>
      <p>Date: ${new Date().toLocaleString('fr-FR')}</p>
    `,
    text: 'Test réussi - Votre configuration SMTP fonctionne correctement.',
  })
}
