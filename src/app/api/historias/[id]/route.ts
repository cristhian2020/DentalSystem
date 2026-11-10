import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } | { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let id: string | undefined
  if (context && context.params) {
    if (typeof (context.params as any).then === 'function') {
      const resolved = await (context.params as Promise<{ id: string }>)
      id = resolved.id
    } else {
      id = (context.params as { id: string }).id
    }
  }

  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  }

  try {
    await prisma.historiaClinica.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error eliminando historia clínica:', error)
    return NextResponse.json(
      { error: error?.message || 'Error al eliminar historia clínica' },
      { status: 500 }
    )
  }
}
