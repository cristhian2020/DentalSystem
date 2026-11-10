'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'loading') return
    if (session) {
      router.replace('/dashboard')
    } else {
      router.replace('/login')
    }
  }, [session, status, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-zinc-600 text-sm">Cargando sistema...</p>
      </div>
    </div>
  )
}
