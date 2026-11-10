'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function getOdontogramaByHistoria(historiaId: string) {
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
        return { success: false, error: 'No tienes permiso para ver este odontograma' }
      }
    }

    const dientes = await prisma.odontograma.findMany({
      where: { historia_id: historiaId },
      orderBy: { pieza_numero: 'asc' },
    })

    const formatted = dientes.map((d) => ({
      ...d,
      fecha_ultimo_cambio: d.fecha_ultimo_cambio?.toISOString().split('T')[0] || null,
      creado_en: d.creado_en?.toISOString() || null,
      actualizado_en: d.actualizado_en?.toISOString() || null,
    }))

    return { success: true, data: formatted }
  } catch (error: any) {
    console.error('Error al obtener odontograma:', error)
    return { success: false, error: error?.message || 'Error al obtener odontograma' }
  }
}

export async function upsertOdontogramaDiente(data: {
  historia_id: string
  pieza_numero: string
  descripcion?: string
  estado?: string
  color_codigo?: string
  observaciones?: string
}) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: 'No autorizado' }

    const pieza = String(data.pieza_numero)

    const result = await prisma.odontograma.upsert({
      where: {
        historia_id_pieza_numero: {
          historia_id: data.historia_id,
          pieza_numero: pieza,
        },
      },
      update: {
        descripcion: data.descripcion || null,
        estado: data.estado || 'sano',
        color_codigo: data.color_codigo || '#FFFFFF',
        observaciones: data.observaciones || null,
        modificado_por: session.user.id,
        actualizado_en: new Date(),
      },
      create: {
        historia_id: data.historia_id,
        pieza_numero: pieza,
        descripcion: data.descripcion || null,
        estado: data.estado || 'sano',
        color_codigo: data.color_codigo || '#FFFFFF',
        observaciones: data.observaciones || null,
        modificado_por: session.user.id,
      },
    })

    revalidatePath(`/dashboard/historias/${data.historia_id}`)
    revalidatePath('/dashboard/odontograma')
    return { success: true, data: result }
  } catch (error: any) {
    console.error('Error al guardar pieza en odontograma:', error)
    return { success: false, error: error?.message || 'Error al guardar pieza' }
  }
}

export async function deleteOdontogramaDiente(id: string) {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: 'No autorizado' }

    await prisma.odontograma.delete({
      where: { id },
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error al eliminar pieza:', error)
    return { success: false, error: error?.message || 'Error al eliminar pieza' }
  }
}


export async function getHistoriasConOdontogramas() {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: 'No autorizado' }

    const whereClause: any = {}
    if (session.user.rol === 'dentista') {
      whereClause.OR = [
        { doctor_id: session.user.id },
        { creado_por: session.user.id },
      ]
    }

    const historias = await prisma.historiaClinica.findMany({
      where: whereClause,
      orderBy: { apellido: 'asc' },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        numero_historia: true,
        fecha_nacimiento: true,
        celular: true,
        creado_en: true,
        odontogramas: {
          orderBy: { pieza_numero: 'asc' },
          select: {
            id: true,
            historia_id: true,
            pieza_numero: true,
            descripcion: true,
            creado_en: true,
            actualizado_en: true,
          },
        },
      },
    })

    const formatted = historias.map((h) => ({
      ...h,
      numero_historia: h.numero_historia || '',
      celular: h.celular || '',
      fecha_nacimiento: h.fecha_nacimiento?.toISOString().split('T')[0] || '',
      creado_en: h.creado_en?.toISOString() || '',
      odontogramas: h.odontogramas.map((o) => ({
        ...o,
        pieza_numero: Number(o.pieza_numero),
        descripcion: o.descripcion || '',
        creado_en: o.creado_en?.toISOString() || '',
        actualizado_en: o.actualizado_en?.toISOString() || '',
      })),
    }))

    return { success: true, data: formatted }
  } catch (error: any) {
    return { success: false, error: error?.message || 'Error al obtener odontogramas' }
  }
}
