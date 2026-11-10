'use server'

import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { auth } from '@/auth'

export async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.id) return null

  const user = await prisma.usuario.findUnique({
    where: { id: session.user.id },
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
    },
  })

  return user
}

export async function registerUser(formData: {
  nombre: string
  apellido?: string
  email: string
  password: string
  telefono?: string
  rol?: string
  especialidad?: string
  numero_colegiado?: string
}) {
  try {
    const email = formData.email.trim().toLowerCase()
    if (!email || !formData.password || !formData.nombre) {
      return { success: false, error: 'Nombre, email y contraseña son obligatorios' }
    }

    if (formData.password.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' }
    }

    const existingUser = await prisma.usuario.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { success: false, error: 'Este correo electrónico ya está registrado' }
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(formData.password, salt)

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido?.trim() || '',
        email,
        password_hash: passwordHash,
        telefono: formData.telefono?.trim() || null,
        especialidad: formData.rol === 'dentista' ? formData.especialidad?.trim() || 'General' : null,
        rol: formData.rol === 'admin' ? 'admin' : 'dentista',
        numero_colegiado: formData.numero_colegiado?.trim() || null,
        activo: true,
      },
    })

    return {
      success: true,
      user: {
        id: nuevoUsuario.id,
        email: nuevoUsuario.email,
        nombre: nuevoUsuario.nombre,
      },
    }
  } catch (error: any) {
    console.error('Error al registrar usuario:', error)
    return { success: false, error: error?.message || 'Error al procesar el registro' }
  }
}

export async function updatePasswordWithEmail(email: string, newPassword: string) {
  try {
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !newPassword) {
      return { success: false, error: 'Correo y nueva contraseña son obligatorios' }
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' }
    }

    const user = await prisma.usuario.findUnique({
      where: { email: cleanEmail },
    })

    if (!user) {
      return { success: false, error: 'No se encontró un usuario con este correo electrónico' }
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(newPassword, salt)

    await prisma.usuario.update({
      where: { id: user.id },
      data: { password_hash: passwordHash },
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error al actualizar contraseña:', error)
    return { success: false, error: error?.message || 'Error al actualizar contraseña' }
  }
}
