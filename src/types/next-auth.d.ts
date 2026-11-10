import 'next-auth'
import { DefaultSession } from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      rol: 'admin' | 'dentista' | string
      especialidad?: string | null
    } & DefaultSession['user']
  }

  interface User {
    id: string
    rol: 'admin' | 'dentista' | string
    especialidad?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    rol: 'admin' | 'dentista' | string
    especialidad?: string | null
  }
}

