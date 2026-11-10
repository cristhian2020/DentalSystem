import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        const email = String(credentials.email).trim().toLowerCase()
        const password = String(credentials.password)

        const user = await prisma.usuario.findUnique({
          where: { email },
        })

        if (!user || !user.password_hash) {
          return null
        }

        const isValid = await bcrypt.compare(password, user.password_hash)
        if (!isValid) {
          return null
        }

        if (user.activo === false) {
          throw new Error('Usuario inactivo. Contacte al administrador.')
        }

        try {
          await prisma.usuario.update({
            where: { id: user.id },
            data: { ultimo_login: new Date() },
          })
        } catch (e) {
          console.error('Error al actualizar último login:', e)
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.nombre} ${user.apellido || ''}`.trim(),
          rol: user.rol || 'dentista',
          especialidad: user.especialidad || null,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.rol = (user as any).rol
        token.especialidad = (user as any).especialidad
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.rol = (token.rol as string) || 'dentista'
        session.user.especialidad = (token.especialidad as string) || null
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
})

