'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function getTratamientosByHistoria(historiaId: string) {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: 'No autorizado' }

    if (session.user.rol === 'dentista') {
      const historia = await prisma.historiaClinica.findUnique({
        where: { id: historiaId },
        select: { doctor_id: true, creado_por: true },
      })
      if (
        !historia ||
        (historia.doctor_id !== session.user.id && historia.creado_por !== session.user.id)
      ) {
        return { success: false, error: 'No tienes permiso para ver los tratamientos de este paciente' }
      }
    }

    const tratamientos = await prisma.tratamientoRealizado.findMany({
      where: { historia_id: historiaId },
      orderBy: { fecha_tratamiento: 'desc' },
      include: {
        pagos: {
          orderBy: { fecha_pago: 'desc' },
        },
      },
    })

    const formatted = tratamientos.map((t) => ({
      ...t,
      precio: Number(t.precio),
      fecha_tratamiento: t.fecha_tratamiento.toISOString().split('T')[0],
      creado_en: t.creado_en?.toISOString() || null,
      actualizado_en: t.actualizado_en?.toISOString() || null,
      pagos: t.pagos.map((p) => ({
        ...p,
        monto: Number(p.monto),
        fecha_pago: p.fecha_pago.toISOString().split('T')[0],
        creado_en: p.creado_en?.toISOString() || null,
      })),
    }))

    return { success: true, data: formatted }
  } catch (error: any) {
    console.error('Error al obtener tratamientos:', error)
    return { success: false, error: error?.message || 'Error al obtener tratamientos' }
  }
}

export async function createTratamiento(data: {
  historia_id: string
  fecha_tratamiento?: string
  descripcion: string
  precio: number
  estado_pago?: string
}) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: 'No autorizado' }

    const nuevo = await prisma.tratamientoRealizado.create({
      data: {
        historia_id: data.historia_id,
        fecha_tratamiento: data.fecha_tratamiento
          ? new Date(`${data.fecha_tratamiento}T00:00:00.000Z`)
          : new Date(),
        descripcion: data.descripcion.trim(),
        precio: data.precio,
        estado_pago: data.estado_pago || 'pendiente',
        realizado_por: session.user.id,
      },
    })

    revalidatePath(`/dashboard/historias/${data.historia_id}`)
    revalidatePath('/dashboard/tratamientos')
    return {
      success: true,
      data: {
        ...nuevo,
        precio: Number(nuevo.precio),
        fecha_tratamiento: nuevo.fecha_tratamiento.toISOString().split('T')[0],
      },
    }
  } catch (error: any) {
    console.error('Error al crear tratamiento:', error)
    return { success: false, error: error?.message || 'Error al crear tratamiento' }
  }
}

export async function updateTratamiento(
  id: string,
  data: {
    descripcion?: string
    precio?: number
    estado_pago?: string
    fecha_tratamiento?: string
  }
) {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: 'No autorizado' }

    const updatePayload: any = {
      actualizado_en: new Date(),
    }
    if (data.descripcion !== undefined) updatePayload.descripcion = data.descripcion.trim()
    if (data.precio !== undefined) updatePayload.precio = data.precio
    if (data.estado_pago !== undefined) updatePayload.estado_pago = data.estado_pago
    if (data.fecha_tratamiento !== undefined) {
      updatePayload.fecha_tratamiento = new Date(`${data.fecha_tratamiento}T00:00:00.000Z`)
    }

    const updated = await prisma.tratamientoRealizado.update({
      where: { id },
      data: updatePayload,
    })

    revalidatePath('/dashboard/tratamientos')
    return {
      success: true,
      data: {
        ...updated,
        precio: Number(updated.precio),
        fecha_tratamiento: updated.fecha_tratamiento.toISOString().split('T')[0],
      },
    }
  } catch (error: any) {
    console.error('Error al actualizar tratamiento:', error)
    return { success: false, error: error?.message || 'Error al actualizar tratamiento' }
  }
}

export async function deleteTratamiento(id: string) {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: 'No autorizado' }

    await prisma.tratamientoRealizado.delete({
      where: { id },
    })

    revalidatePath('/dashboard/tratamientos')
    return { success: true }
  } catch (error: any) {
    console.error('Error al eliminar tratamiento:', error)
    return { success: false, error: error?.message || 'Error al eliminar tratamiento' }
  }
}


export async function getTratamientoById(id: string) {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: 'No autorizado' }

    const trat = await prisma.tratamientoRealizado.findUnique({
      where: { id },
      include: {
        historia: {
          select: { id: true, nombre: true, apellido: true },
        },
      },
    })

    if (!trat) return { success: false, error: 'Tratamiento no encontrado' }

    return {
      success: true,
      data: {
        ...trat,
        precio: Number(trat.precio),
        fecha_tratamiento: trat.fecha_tratamiento.toISOString().split('T')[0],
      },
    }
  } catch (error: any) {
    return { success: false, error: error?.message || 'Error al obtener tratamiento' }
  }
}


export async function getAllTratamientosConPagos() {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: 'No autorizado' }

    const whereClause: any = {}
    if (session.user.rol === 'dentista') {
      whereClause.OR = [
        { realizado_por: session.user.id },
        {
          historia: {
            OR: [
              { doctor_id: session.user.id },
              { creado_por: session.user.id },
            ],
          },
        },
      ]
    }

    const tratamientos = await prisma.tratamientoRealizado.findMany({
      where: whereClause,
      orderBy: { fecha_tratamiento: 'desc' },
      include: {
        historia: {
          select: { nombre: true, apellido: true },
        },
        pagos: {
          select: { monto: true },
        },
      },
    })

    const formatted = tratamientos.map((t) => {
      const precio = Number(t.precio)
      const totalPagado = t.pagos.reduce((sum, p) => sum + Number(p.monto), 0)
      return {
        id: t.id,
        historia_id: t.historia_id,
        fecha_tratamiento: t.fecha_tratamiento.toISOString().split('T')[0],
        descripcion: t.descripcion,
        precio,
        estado_pago: t.estado_pago || 'pendiente',
        historia_nombre: t.historia?.nombre || 'N/A',
        historia_apellido: t.historia?.apellido || 'N/A',
        totalPagado,
      }
    })

    return { success: true, data: formatted }
  } catch (error: any) {
    return { success: false, error: error?.message || 'Error al obtener tratamientos' }
  }
}
