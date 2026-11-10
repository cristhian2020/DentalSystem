'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function getCitasByFecha(fechaStr: string) {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: 'No autorizado' }

    // Parse YYYY-MM-DD
    const dateObj = new Date(`${fechaStr}T00:00:00.000Z`)

    const citas = await prisma.cita.findMany({
      where: {
        fecha: dateObj,
      },
      orderBy: {
        hora: 'asc',
      },
    })

    const formatted = citas.map((c) => ({
      ...c,
      fecha: c.fecha.toISOString().split('T')[0],
      creado_en: c.creado_en.toISOString(),
    }))

    return { success: true, data: formatted }
  } catch (error: any) {
    console.error('Error al obtener citas:', error)
    return { success: false, error: error?.message || 'Error al obtener citas' }
  }
}

export async function searchCitas(term: string) {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: 'No autorizado' }

    if (!term || !term.trim()) return { success: true, data: [] }

    const cleanTerm = term.trim()

    const citas = await prisma.cita.findMany({
      where: {
        OR: [
          { nombre_cliente: { contains: cleanTerm, mode: 'insensitive' } },
          { hora: { contains: cleanTerm, mode: 'insensitive' } },
        ],
      },
      orderBy: [{ fecha: 'desc' }, { hora: 'asc' }],
      take: 50,
    })

    const formatted = citas.map((c) => ({
      ...c,
      fecha: c.fecha.toISOString().split('T')[0],
      creado_en: c.creado_en.toISOString(),
    }))

    return { success: true, data: formatted }
  } catch (error: any) {
    console.error('Error en búsqueda de citas:', error)
    return { success: false, error: error?.message || 'Error al buscar citas' }
  }
}

export async function createCita(data: {
  fecha: string
  hora: string
  nombre_cliente: string
  estado?: string
}) {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: 'No autorizado' }

    const dateObj = new Date(`${data.fecha}T00:00:00.000Z`)

    // Check if slot is already taken
    const existing = await prisma.cita.findUnique({
      where: {
        fecha_hora: {
          fecha: dateObj,
          hora: data.hora,
        },
      },
    })

    if (existing) {
      return { success: false, error: 'Ya existe una cita programada en ese horario' }
    }

    const nueva = await prisma.cita.create({
      data: {
        fecha: dateObj,
        hora: data.hora,
        nombre_cliente: data.nombre_cliente.trim(),
        estado: data.estado || 'pendiente',
      },
    })

    revalidatePath('/dashboard/citas')
    return {
      success: true,
      data: {
        ...nueva,
        fecha: nueva.fecha.toISOString().split('T')[0],
        creado_en: nueva.creado_en.toISOString(),
      },
    }
  } catch (error: any) {
    console.error('Error al crear cita:', error)
    return { success: false, error: error?.message || 'Error al crear la cita' }
  }
}

export async function updateCita(
  id: string,
  data: {
    nombre_cliente?: string
    estado?: string
    fecha?: string
    hora?: string
  }
) {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: 'No autorizado' }

    const updateData: any = {}
    if (data.nombre_cliente !== undefined) updateData.nombre_cliente = data.nombre_cliente.trim()
    if (data.estado !== undefined) updateData.estado = data.estado
    if (data.hora !== undefined) updateData.hora = data.hora
    if (data.fecha !== undefined) updateData.fecha = new Date(`${data.fecha}T00:00:00.000Z`)

    const updated = await prisma.cita.update({
      where: { id },
      data: updateData,
    })

    revalidatePath('/dashboard/citas')
    return {
      success: true,
      data: {
        ...updated,
        fecha: updated.fecha.toISOString().split('T')[0],
        creado_en: updated.creado_en.toISOString(),
      },
    }
  } catch (error: any) {
    console.error('Error al actualizar cita:', error)
    return { success: false, error: error?.message || 'Error al actualizar cita' }
  }
}

export async function deleteCita(id: string) {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: 'No autorizado' }

    await prisma.cita.delete({
      where: { id },
    })

    revalidatePath('/dashboard/citas')
    return { success: true }
  } catch (error: any) {
    console.error('Error al eliminar cita:', error)
    return { success: false, error: error?.message || 'Error al eliminar cita' }
  }
}

