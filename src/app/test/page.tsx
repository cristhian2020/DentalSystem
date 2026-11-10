// src/app/test/page.tsx
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function TestPage() {
  let dbStatus = 'Desconocido'
  let usuariosCount = 0
  let errorMsg = ''

  try {
    usuariosCount = await prisma.usuario.count()
    dbStatus = 'Conectado a Neon PostgreSQL con éxito'
  } catch (error: any) {
    dbStatus = 'Error al conectar'
    errorMsg = error?.message || 'Error desconocido'
  }

  return (
    <div className="p-8 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900">Diagnóstico de Base de Datos Neon</h1>
      
      <div className={`p-5 rounded-lg border ${errorMsg ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
        <h2 className="text-xl font-semibold mb-2">Estado de Prisma ORM + Neon</h2>
        <p className={`font-medium ${errorMsg ? 'text-red-700' : 'text-green-700'}`}>
          {errorMsg ? '❌ ' + dbStatus : '✅ ' + dbStatus}
        </p>
        {!errorMsg && (
          <p className="mt-2 text-gray-700">
            Total de usuarios registrados en Neon: <span className="font-bold">{usuariosCount}</span>
          </p>
        )}
        {errorMsg && (
          <p className="mt-2 text-sm text-red-600 bg-red-100 p-2 rounded">
            {errorMsg}
          </p>
        )}
      </div>

      <div className="p-4 border rounded-lg bg-gray-50 text-sm text-gray-600 space-y-1">
        <p>• Motor: <strong>Neon PostgreSQL (Serverless)</strong></p>
        <p>• ORM: <strong>Prisma Client v6</strong></p>
        <p>• Auth: <strong>NextAuth (JWT Strategy)</strong></p>
      </div>
    </div>
  )
}
