'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

async function syncTratamientoEstadoPago(tratamientoId: string) {
  const tratamiento = await prisma.tratamientoRealizado.findUnique({
    where: { id: tratamientoId },
    include: { pagos: true },
  })

  if (!tratamiento) return

  const totalPagado = tratamiento.pagos.reduce((sum, p) => sum + Number(p.monto), 0)
  const precio = Number(tratamiento.precio)

  let nuevoEstado = 'pendiente'
  if (totalPagado >= precio) {
    nuevoEstado = 'pagado'
  } else if (totalPagado > 0) {
    nuevoEstado = 'parcial'
  }

  await prisma.tratamientoRealizado.update({
    where: { id: tratamientoId },
    data: {
      estado_pago: nuevoEstado,
      actualizado_en: new Date(),
    },
  })
}

export async function getPagosByTratamiento(tratamientoId: string) {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: 'No autorizado' }

    const pagos = await prisma.pago.findMany({
      where: { tratamiento_id: tratamientoId },
      orderBy: { fecha_pago: 'desc' },
      include: {
        registrador: {
          select: { nombre: true, apellido: true },
        },
      },
    })

    const formatted = pagos.map((p) => ({
      ...p,
      monto: Number(p.monto),
      fecha_pago: p.fecha_pago.toISOString().split('T')[0],
      creado_en: p.creado_en?.toISOString() || null,
    }))

    return { success: true, data: formatted }
  } catch (error: any) {
    console.error('Error al obtener pagos:', error)
    return { success: false, error: error?.message || 'Error al obtener pagos' }
  }
}

export async function createPago(data: {
  tratamiento_id: string
  monto: number
  metodo_pago?: string
  referencia?: string
  observaciones?: string
  fecha_pago?: string
}) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: 'No autorizado' }

    const nuevo = await prisma.pago.create({
      data: {
        tratamiento_id: data.tratamiento_id,
        monto: data.monto,
        metodo_pago: data.metodo_pago || 'efectivo',
        referencia: data.referencia || null,
        observaciones: data.observaciones || null,
        fecha_pago: data.fecha_pago
          ? new Date(`${data.fecha_pago}T00:00:00.000Z`)
          : new Date(),
        registrado_por: session.user.id,
      },
    })

    await syncTratamientoEstadoPago(data.tratamiento_id)

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/tratamientos')
    return {
      success: true,
      data: {
        ...nuevo,
        monto: Number(nuevo.monto),
        fecha_pago: nuevo.fecha_pago.toISOString().split('T')[0],
      },
    }
  } catch (error: any) {
    console.error('Error al registrar pago:', error)
    return { success: false, error: error?.message || 'Error al registrar pago' }
  }
}

export async function deletePago(id: string) {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: 'No autorizado' }

    const pago = await prisma.pago.findUnique({
      where: { id },
      select: { tratamiento_id: true },
    })

    if (!pago) return { success: false, error: 'Pago no encontrado' }

    await prisma.pago.delete({
      where: { id },
    })

    await syncTratamientoEstadoPago(pago.tratamiento_id)

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/tratamientos')
    return { success: true }
  } catch (error: any) {
    console.error('Error al eliminar pago:', error)
    return { success: false, error: error?.message || 'Error al eliminar pago' }
  }
}

