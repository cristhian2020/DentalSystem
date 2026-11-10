'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function generarNumeroHistoria(): Promise<string> {
  const anioActual = new Date().getFullYear()
  const prefijo = `HC-${anioActual}-`

  const ultimaHistoria = await prisma.historiaClinica.findFirst({
    where: {
      numero_historia: {
        startsWith: prefijo,
      },
    },
    orderBy: {
      numero_historia: 'desc',
    },
    select: {
      numero_historia: true,
    },
  })

  let siguienteNumero = 1
  if (ultimaHistoria?.numero_historia) {
    const match = ultimaHistoria.numero_historia.match(/HC-\d{4}-(\d{4})/)
    if (match) {
      siguienteNumero = parseInt(match[1], 10) + 1
    }
  }

  return `HC-${anioActual}-${String(siguienteNumero).padStart(4, '0')}`
}

export async function getHistorias(options?: {
  search?: string
  doctorId?: string
}) {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: 'No autorizado' }

    const conditions: any[] = []

    // Restricción por rol: un dentista sólo ve a sus propios pacientes (asignados o creados)
    if (session.user.rol === 'dentista') {
      conditions.push({
        OR: [
          { doctor_id: session.user.id },
          { creado_por: session.user.id },
        ],
      })
    } else if (options?.doctorId) {
      conditions.push({ doctor_id: options.doctorId })
    }

    if (options?.search && options.search.trim()) {
      const term = options.search.trim()
      conditions.push({
        OR: [
          { nombre: { contains: term, mode: 'insensitive' } },
          { apellido: { contains: term, mode: 'insensitive' } },
          { numero_historia: { contains: term, mode: 'insensitive' } },
          { celular: { contains: term, mode: 'insensitive' } },
        ],
      })
    }

    const whereClause = conditions.length > 0 ? { AND: conditions } : {}

    const historias = await prisma.historiaClinica.findMany({
      where: whereClause,
      orderBy: { creado_en: 'desc' },
      include: {
        doctor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            especialidad: true,
          },
        },
        _count: {
          select: {
            tratamientos: true,
            odontogramas: true,
          },
        },
      },
    })

    const formatted = historias.map((h) => ({
      ...h,
      fecha_nacimiento: h.fecha_nacimiento?.toISOString().split('T')[0] || null,
      creado_en: h.creado_en?.toISOString() || null,
      actualizado_en: h.actualizado_en?.toISOString() || null,
    }))

    return { success: true, data: formatted }
  } catch (error: any) {
    console.error('Error al obtener historias clínicas:', error)
    return { success: false, error: error?.message || 'Error al obtener historias' }
  }
}

export async function getHistoriaById(id: string) {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: 'No autorizado' }

    const historia = await prisma.historiaClinica.findUnique({
      where: { id },
      include: {
        doctor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            especialidad: true,
            telefono: true,
            numero_colegiado: true,
          },
        },
        creador: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        odontogramas: {
          orderBy: { pieza_numero: 'asc' },
        },
        tratamientos: {
          orderBy: { fecha_tratamiento: 'desc' },
          include: {
            pagos: {
              orderBy: { fecha_pago: 'desc' },
            },
          },
        },
      },
    })

    if (!historia) {
      return { success: false, error: 'Historia clínica no encontrada' }
    }

    // Aislamiento por rol: dentista sólo puede ver sus propios expedientes
    if (
      session.user.rol === 'dentista' &&
      historia.doctor_id !== session.user.id &&
      historia.creado_por !== session.user.id
    ) {
      return { success: false, error: 'No tienes permisos para ver el expediente de este paciente' }
    }

    const formatted = {
      ...historia,
      fecha_nacimiento: historia.fecha_nacimiento?.toISOString().split('T')[0] || null,
      creado_en: historia.creado_en?.toISOString() || null,
      actualizado_en: historia.actualizado_en?.toISOString() || null,
      odontogramas: historia.odontogramas.map((o) => ({
        ...o,
        fecha_ultimo_cambio: o.fecha_ultimo_cambio?.toISOString().split('T')[0] || null,
        creado_en: o.creado_en?.toISOString() || null,
        actualizado_en: o.actualizado_en?.toISOString() || null,
      })),
      tratamientos: historia.tratamientos.map((t) => ({
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
      })),
    }

    return { success: true, data: formatted }
  } catch (error: any) {
    console.error('Error al obtener historia por id:', error)
    return { success: false, error: error?.message || 'Error al obtener la historia' }
  }
}

export async function createHistoriaCompleta(input: {
  paciente: {
    nombre: string
    apellido: string
    edad?: number | null
    sexo?: string | null
    fecha_nacimiento?: string | null
    lugar_nacimiento?: string | null
    religion?: string | null
    celular?: string | null
    direccion?: string | null
    tratamiento_medico?: boolean
    tratamiento_medico_detalle?: string | null
    medicamentos_actuales?: boolean
    medicamentos_actuales_detalle?: string | null
    enfermedad_corazon?: boolean
    enfermedad_corazon_detalle?: string | null
    alergias?: boolean
    alergias_detalle?: string | null
    hemorragias_extraccion?: boolean
    hemorragias_extraccion_detalle?: string | null
    comentarios_medico?: string | null
    usa_cepillo?: boolean
    usa_dentifrico?: boolean
    veces_cepillado_dia?: number
    tecnica_cepillado?: string | null
    usa_hilo_dental?: boolean
    observaciones_generales?: string | null
    doctor_id?: string
  }
  odontogramas?: Array<{
    pieza_numero: string
    descripcion?: string
    estado?: string
    color_codigo?: string
    observaciones?: string
  }>
  tratamientos?: Array<{
    fecha_tratamiento: string
    descripcion: string
    precio: number
    estado_pago?: string
  }>
  pagos?: Array<{
    fecha_pago: string
    monto: number
    metodo_pago: string
    referencia?: string
    observaciones?: string
  }>
}) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: 'No autorizado' }

    const doctorId = input.paciente.doctor_id || session.user.id
    const numeroHistoria = await generarNumeroHistoria()

    // Transaction for atomic creation
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Historia
      const historia = await tx.historiaClinica.create({
        data: {
          numero_historia: numeroHistoria,
          nombre: input.paciente.nombre.trim(),
          apellido: input.paciente.apellido.trim(),
          edad: input.paciente.edad || null,
          sexo: input.paciente.sexo || null,
          fecha_nacimiento: input.paciente.fecha_nacimiento
            ? new Date(`${input.paciente.fecha_nacimiento}T00:00:00.000Z`)
            : null,
          lugar_nacimiento: input.paciente.lugar_nacimiento?.trim() || null,
          religion: input.paciente.religion?.trim() || null,
          celular: input.paciente.celular?.trim() || null,
          direccion: input.paciente.direccion?.trim() || null,

          tratamiento_medico: !!input.paciente.tratamiento_medico,
          tratamiento_medico_detalle: input.paciente.tratamiento_medico_detalle || null,
          medicamentos_actuales: !!input.paciente.medicamentos_actuales,
          medicamentos_actuales_detalle: input.paciente.medicamentos_actuales_detalle || null,
          enfermedad_corazon: !!input.paciente.enfermedad_corazon,
          enfermedad_corazon_detalle: input.paciente.enfermedad_corazon_detalle || null,
          alergias: !!input.paciente.alergias,
          alergias_detalle: input.paciente.alergias_detalle || null,
          hemorragias_extraccion: !!input.paciente.hemorragias_extraccion,
          hemorragias_extraccion_detalle: input.paciente.hemorragias_extraccion_detalle || null,
          comentarios_medico: input.paciente.comentarios_medico || null,

          usa_cepillo: !!input.paciente.usa_cepillo,
          usa_dentifrico: !!input.paciente.usa_dentifrico,
          veces_cepillado_dia: input.paciente.veces_cepillado_dia || 0,
          tecnica_cepillado: input.paciente.tecnica_cepillado || null,
          usa_hilo_dental: !!input.paciente.usa_hilo_dental,

          observaciones_generales: input.paciente.observaciones_generales || null,
          doctor_id: doctorId,
          creado_por: session.user.id,
          estado: 'activo',
        },
      })

      // 2. Create Odontogramas
      if (input.odontogramas && input.odontogramas.length > 0) {
        for (const o of input.odontogramas) {
          await tx.odontograma.create({
            data: {
              historia_id: historia.id,
              pieza_numero: String(o.pieza_numero),
              descripcion: o.descripcion || null,
              estado: o.estado || 'sano',
              color_codigo: o.color_codigo || '#FFFFFF',
              observaciones: o.observaciones || null,
              modificado_por: session.user.id,
            },
          })
        }
      }

      // 3. Create Tratamientos & Pagos
      if (input.tratamientos && input.tratamientos.length > 0) {
        for (const t of input.tratamientos) {
          const trat = await tx.tratamientoRealizado.create({
            data: {
              historia_id: historia.id,
              fecha_tratamiento: t.fecha_tratamiento
                ? new Date(`${t.fecha_tratamiento}T00:00:00.000Z`)
                : new Date(),
              descripcion: t.descripcion.trim(),
              precio: t.precio,
              estado_pago: t.estado_pago || 'pendiente',
              realizado_por: session.user.id,
            },
          })

          // Associate payments to the first treatment if provided
          if (input.pagos && input.pagos.length > 0) {
            let totalPagado = 0
            for (const p of input.pagos) {
              await tx.pago.create({
                data: {
                  tratamiento_id: trat.id,
                  fecha_pago: p.fecha_pago
                    ? new Date(`${p.fecha_pago}T00:00:00.000Z`)
                    : new Date(),
                  monto: p.monto,
                  metodo_pago: p.metodo_pago || 'efectivo',
                  referencia: p.referencia || null,
                  observaciones: p.observaciones || null,
                  registrado_por: session.user.id,
                },
              })
              totalPagado += Number(p.monto)
            }

            // Update estado_pago based on totalPagado
            const nuevoEstado =
              totalPagado >= Number(t.precio)
                ? 'pagado'
                : totalPagado > 0
                ? 'parcial'
                : 'pendiente'

            await tx.tratamientoRealizado.update({
              where: { id: trat.id },
              data: { estado_pago: nuevoEstado },
            })
          }
        }
      }

      return historia
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/historias')
    revalidatePath('/dashboard/pacientes')

    return { success: true, data: { id: result.id, numero_historia: result.numero_historia } }
  } catch (error: any) {
    console.error('Error al crear historia clínica completa:', error)
    return { success: false, error: error?.message || 'Error al guardar la historia clínica' }
  }
}

export async function updateHistoria(id: string, data: any) {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: 'No autorizado' }

    const existing = await prisma.historiaClinica.findUnique({
      where: { id },
      select: { doctor_id: true, creado_por: true },
    })

    if (!existing) return { success: false, error: 'Historia clínica no encontrada' }

    if (
      session.user.rol === 'dentista' &&
      existing.doctor_id !== session.user.id &&
      existing.creado_por !== session.user.id
    ) {
      return { success: false, error: 'No tienes permisos para modificar este expediente' }
    }

    const updatePayload: any = {
      actualizado_en: new Date(),
    }

    const directFields = [
      'nombre',
      'apellido',
      'edad',
      'sexo',
      'lugar_nacimiento',
      'religion',
      'celular',
      'direccion',
      'tratamiento_medico',
      'tratamiento_medico_detalle',
      'medicamentos_actuales',
      'medicamentos_actuales_detalle',
      'enfermedad_corazon',
      'enfermedad_corazon_detalle',
      'alergias',
      'alergias_detalle',
      'hemorragias_extraccion',
      'hemorragias_extraccion_detalle',
      'comentarios_medico',
      'usa_cepillo',
      'usa_dentifrico',
      'veces_cepillado_dia',
      'tecnica_cepillado',
      'usa_hilo_dental',
      'observaciones_generales',
      'estado',
    ]

    for (const f of directFields) {
      if (data[f] !== undefined) {
        updatePayload[f] = data[f]
      }
    }

    if (data.fecha_nacimiento !== undefined) {
      updatePayload.fecha_nacimiento = data.fecha_nacimiento
        ? new Date(`${data.fecha_nacimiento}T00:00:00.000Z`)
        : null
    }

    const updated = await prisma.historiaClinica.update({
      where: { id },
      data: updatePayload,
    })

    revalidatePath(`/dashboard/historias/${id}`)
    revalidatePath('/dashboard/historias')
    revalidatePath('/dashboard/pacientes')

    return { success: true, data: updated }
  } catch (error: any) {
    console.error('Error al actualizar historia:', error)
    return { success: false, error: error?.message || 'Error al actualizar historia' }
  }
}

export async function deleteHistoria(id: string) {
  try {
    const session = await auth()
    if (!session?.user) return { success: false, error: 'No autorizado' }

    const existing = await prisma.historiaClinica.findUnique({
      where: { id },
      select: { doctor_id: true, creado_por: true },
    })

    if (!existing) return { success: false, error: 'Historia clínica no encontrada' }

    if (
      session.user.rol === 'dentista' &&
      existing.doctor_id !== session.user.id &&
      existing.creado_por !== session.user.id
    ) {
      return { success: false, error: 'No tienes permisos para eliminar este expediente' }
    }

    await prisma.historiaClinica.delete({
      where: { id },
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/historias')
    revalidatePath('/dashboard/pacientes')
    return { success: true }
  } catch (error: any) {
    console.error('Error al eliminar historia:', error)
    return { success: false, error: error?.message || 'Error al eliminar historia' }
  }
}

