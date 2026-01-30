import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function updateAdmin() {
  console.log('🔐 Mise à jour du compte admin...\n')

  const newEmail = 'contact@b-photovoltaique.fr'
  const newPassword = 'UpOr9djgCsi5sgNXjU1B0Q=='

  try {
    // Crypter le mot de passe
    console.log('🔒 Cryptage du mot de passe...')
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    console.log('   ✅ Mot de passe crypté\n')

    // Trouver l'admin existant
    const existingAdmin = await prisma.admin.findFirst()

    if (!existingAdmin) {
      // Créer un nouvel admin s'il n'existe pas
      console.log('👤 Création du compte admin...')
      const admin = await prisma.admin.create({
        data: {
          email: newEmail,
          password: hashedPassword,
          name: 'Mickael Challet',
          role: 'super_admin',
          active: true
        }
      })

      console.log('\n✅ Compte admin créé avec succès!')
      console.log(`   Email: ${admin.email}`)
      console.log(`   Nom: ${admin.name}`)
      console.log(`   Rôle: ${admin.role}`)
    } else {
      // Mettre à jour l'admin existant
      console.log('👤 Mise à jour du compte admin existant...')
      const admin = await prisma.admin.update({
        where: { id: existingAdmin.id },
        data: {
          email: newEmail,
          password: hashedPassword,
          name: 'Mickael Challet',
          role: 'super_admin',
          active: true
        }
      })

      console.log('\n✅ Compte admin mis à jour avec succès!')
      console.log(`   Email: ${admin.email}`)
      console.log(`   Nom: ${admin.name}`)
      console.log(`   Rôle: ${admin.role}`)
    }

    console.log('\n🔑 Identifiants de connexion:')
    console.log(`   Email: ${newEmail}`)
    console.log(`   Mot de passe: ${newPassword}`)
    console.log('\n⚠️  NOTEZ BIEN CES IDENTIFIANTS !')

  } catch (error) {
    console.error('\n❌ Erreur:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

updateAdmin()
  .then(() => {
    console.log('\n✅ Opération terminée!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur:', error)
    process.exit(1)
  })
