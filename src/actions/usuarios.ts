'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function getUsuarios() {
  try {
    const session = await auth()
    if (!session?.user || session.user.rol !== 'admin') {
      return { success: false, error: 'Acceso restringido a administradores' }
    }

    const usuarios = await prisma.usuario.findMany({
      orderBy: { creado_en: 'desc' },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        telefono: true,
        especialidad: true,
        rol: true,
        numero_colegiado: true,
        activo: true,
        fecha_registro: true,
        ultimo_login: true,
        _count: {
          select: {
            historias_doctor: true,
            tratamientos_realizados: true,
          },
        },
      },
    })

    const formatted = usuarios.map((u) => ({
      ...u,
      fecha_registro: u.fecha_registro?.toISOString() || null,
      ultimo_login: u.ultimo_login?.toISOString() || null,
    }))

    return { success: true, data: formatted }
  } catch (error: any) {
    console.error('Error al obtener usuarios:', error)
    return { success: false, error: error?.message || 'Error al obtener usuarios' }
  }
}

export async function toggleUsuarioActivo(id: string) {
  try {
    const session = await auth()
    if (!session?.user || session.user.rol !== 'admin') {
      return { success: false, error: 'Acceso restringido a administradores' }
    }

    // Do not deactivate oneself
    if (session.user.id === id) {
      return { success: false, error: 'No puedes desactivar tu propia cuenta' }
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: { activo: true },
    })

    if (!usuario) return { success: false, error: 'Usuario no encontrado' }

    const updated = await prisma.usuario.update({
      where: { id },
      data: { activo: !usuario.activo },
    })

    revalidatePath('/dashboard/usuarios')
    return { success: true, activo: updated.activo }
  } catch (error: any) {
    console.error('Error al cambiar estado de usuario:', error)
    return { success: false, error: error?.message || 'Error al modificar usuario' }
  }
}

export async function updateUsuarioRol(id: string, rol: 'admin' | 'dentista') {
  try {
    const session = await auth()
    if (!session?.user || session.user.rol !== 'admin') {
      return { success: false, error: 'Acceso restringido a administradores' }
    }

    const updated = await prisma.usuario.update({
      where: { id },
      data: { rol },
    })

    revalidatePath('/dashboard/usuarios')
    return { success: true, rol: updated.rol }
  } catch (error: any) {
    console.error('Error al cambiar rol de usuario:', error)
    return { success: false, error: error?.message || 'Error al actualizar rol' }
  }
}

