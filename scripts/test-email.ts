/**
 * Script de test de l'envoi d'emails
 * Vérifie que la configuration SMTP fonctionne correctement
 */

import { sendTestEmail, sendLeadNotification } from '@/lib/email'

async function main() {
  console.log('🧪 Test de la configuration email\n')
  
  const testEmail = process.env.ADMIN_EMAIL || 'test@example.com'
  
  console.log(`📧 Envoi d'un email de test vers: ${testEmail}\n`)
  
  // Test 1: Email de test simple
  console.log('1️⃣  Test email simple...')
  const result1 = await sendTestEmail(testEmail)
  if (result1) {
    console.log('   ✅ Email de test envoyé avec succès\n')
  } else {
    console.log('   ❌ Échec de l\'envoi de l\'email de test\n')
  }
  
  // Test 2: Email de notification de lead (exemple)
  console.log('2️⃣  Test email notification lead...')
  const mockLead = {
    id: 'test-lead-123',
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    phone: '06 12 34 56 78',
    city: {
      name: 'Paris',
      postalCode: '75001',
      department: 'Paris',
    },
    projectType: 'installation',
    message: 'Je souhaite installer des panneaux solaires sur ma maison.',
    budget: '10-15k',
    surface: 40,
    createdAt: new Date(),
  }
  
  const result2 = await sendLeadNotification(mockLead)
  if (result2) {
    console.log('   ✅ Email de notification envoyé avec succès\n')
  } else {
    console.log('   ❌ Échec de l\'envoi de l\'email de notification\n')
  }
  
  console.log('='.repeat(60))
  console.log('📊 Résumé des tests:')
  console.log(`   Email simple: ${result1 ? '✅' : '❌'}`)
  console.log(`   Email notification: ${result2 ? '✅' : '❌'}`)
  console.log('='.repeat(60))
  
  if (!result1 || !result2) {
    console.log('\n⚠️  Vérifiez votre configuration SMTP dans le fichier .env:')
    console.log('   - SMTP_HOST')
    console.log('   - SMTP_PORT')
    console.log('   - SMTP_USER')
    console.log('   - SMTP_PASSWORD')
    console.log('   - SMTP_FROM')
    console.log('   - ADMIN_EMAIL')
  }
}

main()
  .then(() => {
    console.log('\n✅ Tests terminés')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur:', error)
    process.exit(1)
  })
