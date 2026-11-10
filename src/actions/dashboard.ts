'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/auth'

export async function getDashboardStats() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'No autorizado' }
    }

    const isAdmin = session.user.rol === 'admin'
    const doctorId = session.user.id

    // Where clause for historias
    const historiaWhere = isAdmin
      ? {}
      : {
          OR: [{ doctor_id: doctorId }, { creado_por: doctorId }],
        }

    // 1. Total pacientes
    const totalPacientes = await prisma.historiaClinica.count({
      where: historiaWhere,
    })

    // 2. Historias IDs for treatments
    let historiaIds: string[] = []
    if (!isAdmin) {
      const his = await prisma.historiaClinica.findMany({
        where: historiaWhere,
        select: { id: true },
      })
      historiaIds = his.map((h) => h.id)
    }

    const tratamientoWhere = isAdmin ? {} : { historia_id: { in: historiaIds } }

    // 3. Tratamientos
    const tratamientos = await prisma.tratamientoRealizado.findMany({
      where: tratamientoWhere,
      select: {
        id: true,
        precio: true,
        estado_pago: true,
        pagos: {
          select: { monto: true },
        },
      },
    })

    const totalTratamientos = tratamientos.length

    let totalIngresos = 0
    let totalPendiente = 0

    for (const t of tratamientos) {
      const precio = Number(t.precio)
      const pagado = t.pagos.reduce((acc, p) => acc + Number(p.monto), 0)
      totalIngresos += pagado
      totalPendiente += Math.max(0, precio - pagado)
    }

    // 4. Citas de hoy
    const todayStr = new Date().toISOString().split('T')[0]
    const todayDate = new Date(`${todayStr}T00:00:00.000Z`)

    const citasHoy = await prisma.cita.count({
      where: { fecha: todayDate },
    })

    // 5. Próximas citas (take 5)
    const proximasCitas = await prisma.cita.findMany({
      where: { fecha: { gte: todayDate } },
      orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
      take: 5,
    })

    // 6. Últimos pacientes
    const ultimosPacientes = await prisma.historiaClinica.findMany({
      where: historiaWhere,
      orderBy: { creado_en: 'desc' },
      take: 5,
      select: {
        id: true,
        numero_historia: true,
        nombre: true,
        apellido: true,
        celular: true,
        creado_en: true,
        estado: true,
      },
    })

    return {
      success: true,
      data: {
        stats: {
          pacientes: totalPacientes,
          tratamientos: totalTratamientos,
          ingresos: totalIngresos,
          pendientes: totalPendiente,
          citasHoy,
        },
        proximasCitas: proximasCitas.map((c) => ({
          ...c,
          fecha: c.fecha.toISOString().split('T')[0],
          creado_en: c.creado_en.toISOString(),
        })),
        ultimosPacientes: ultimosPacientes.map((p) => ({
          ...p,
          creado_en: p.creado_en?.toISOString() || null,
        })),
        isAdmin,
      },
    }
  } catch (error: any) {
    console.error('Error al obtener estadísticas del dashboard:', error)
    return { success: false, error: error?.message || 'Error al cargar estadísticas' }
  }
}

