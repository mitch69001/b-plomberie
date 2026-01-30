import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email et mot de passe requis')
        }

        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email }
        })

        if (!admin || !admin.active) {
          throw new Error('Identifiants invalides')
        }

        const isValid = await bcrypt.compare(credentials.password, admin.password)

        if (!isValid) {
          throw new Error('Identifiants invalides')
        }

        // Mettre à jour la dernière connexion
        await prisma.admin.update({
          where: { id: admin.id },
          data: { lastLogin: new Date() }
        })

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      }
    })
  ],
  pages: {
    signIn: '/admin/login',
    error: '/admin/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role
      }
      return session
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60 // 24 heures
  },
  secret: process.env.NEXTAUTH_SECRET
}
