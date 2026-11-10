// src/app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { getDashboardStats } from '@/actions/dashboard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  Clock,
  ArrowRight,
  UserPlus,
  CalendarPlus,
  ShieldCheck,
} from 'lucide-react'
import Icon from '@mdi/react'
import { mdiToothOutline } from '@mdi/js'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>({
    stats: {
      pacientes: 0,
      tratamientos: 0,
      ingresos: 0,
      pendientes: 0,
      citasHoy: 0,
    },
    proximasCitas: [],
    ultimosPacientes: [],
    isAdmin: false,
  })

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true)
      const res = await getDashboardStats()
      if (res.success && res.data) {
        setData(res.data)
      }
      setLoading(false)
    }

    loadStats()
  }, [])

  const stats = data.stats
  const isAdmin = data.isAdmin || session?.user?.rol === 'admin'

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
        <p className="text-sm text-gray-500">Cargando panel de control...</p>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Pacientes Registrados',
      value: stats.pacientes,
      icon: Users,
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-100',
    },
    {
      label: 'Tratamientos Realizados',
      value: stats.tratamientos,
      icon: Calendar,
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
    },
    {
      label: 'Ingresos Totales',
      value: `Bs. ${Number(stats.ingresos).toFixed(2)}`,
      icon: DollarSign,
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'border-indigo-100',
    },
    {
      label: 'Montos Pendientes',
      value: `Bs. ${Number(stats.pendientes).toFixed(2)}`,
      icon: TrendingUp,
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Panel Principal
            </h1>
            <Badge
              variant={isAdmin ? 'default' : 'secondary'}
              className="text-xs px-2 py-0.5 capitalize"
            >
              {isAdmin ? 'Vista Administrador' : 'Vista Dentista'}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Bienvenido, <span className="font-semibold">{session?.user?.name || session?.user?.email}</span>
            {isAdmin && ' — Tienes acceso a todos los datos globales de la clínica.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/historias/nueva">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs gap-1.5 text-sm">
              <UserPlus className="h-4 w-4" />
              Nuevo Paciente
            </Button>
          </Link>
          <Link href="/dashboard/citas">
            <Button variant="outline" className="gap-1.5 text-sm">
              <CalendarPlus className="h-4 w-4" />
              Agendar Cita
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Card key={i} className={`shadow-xs hover:shadow-md transition-shadow border ${card.border}`}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`${card.bg} p-2.5 rounded-xl`}>
                  <card.icon className={`h-5 w-5 ${card.text}`} />
                </div>
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                {card.label}
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                {card.value}
              </h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two Column Layout: Recent Patients & Upcoming Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas Citas */}
        <Card className="border-gray-200 shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                Próximas Citas Programadas
              </CardTitle>
              <CardDescription>
                Citas agendadas para hoy y los próximos días
              </CardDescription>
            </div>
            <Link href="/dashboard/citas">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700">
                Ver todas <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {data.proximasCitas.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                No hay citas programadas próximamente
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {data.proximasCitas.map((cita: any) => (
                  <div key={cita.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-gray-900">
                        {cita.nombre_cliente}
                      </p>
                      <p className="text-xs text-gray-500">
                        Fecha: {cita.fecha} • Hora: {cita.hora}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">
                      {cita.estado || 'pendiente'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Últimos Pacientes */}
        <Card className="border-gray-200 shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Pacientes Recientes
              </CardTitle>
              <CardDescription>
                Últimas historias clínicas registradas
              </CardDescription>
            </div>
            <Link href="/dashboard/pacientes">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700">
                Ver todos <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {data.ultimosPacientes.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                No hay historias clínicas registradas
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {data.ultimosPacientes.map((paciente: any) => (
                  <div key={paciente.id} className="py-3 flex items-center justify-between">
                    <div>
                      <Link
                        href={`/dashboard/historias/${paciente.id}`}
                        className="font-medium text-sm text-blue-600 hover:underline"
                      >
                        {paciente.nombre} {paciente.apellido}
                      </Link>
                      <p className="text-xs text-gray-500">
                        {paciente.numero_historia} • Cel: {paciente.celular || 'S/N'}
                      </p>
                    </div>
                    <Badge
                      variant={paciente.estado === 'activo' ? 'default' : 'secondary'}
                      className="text-xs capitalize"
                    >
                      {paciente.estado || 'activo'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Tiles */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3">
          Acciones y Módulos del Sistema
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link href="/dashboard/historias/nueva" className="block">
            <Button
              variant="outline"
              className="h-24 w-full flex flex-col items-center justify-center gap-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <UserPlus className="h-6 w-6 text-blue-600" />
              <div className="text-center">
                <span className="text-sm font-semibold text-gray-900 block">
                  Nueva Historia
                </span>
                <span className="text-[11px] text-gray-500">Registrar paciente</span>
              </div>
            </Button>
          </Link>

          <Link href="/dashboard/odontograma" className="block">
            <Button
              variant="outline"
              className="h-24 w-full flex flex-col items-center justify-center gap-2 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
            >
              <Icon path={mdiToothOutline} className="h-6 w-6 text-emerald-600" />
              <div className="text-center">
                <span className="text-sm font-semibold text-gray-900 block">
                  Odontograma
                </span>
                <span className="text-[11px] text-gray-500">Piezas dentales</span>
              </div>
            </Button>
          </Link>

          <Link href="/dashboard/citas" className="block">
            <Button
              variant="outline"
              className="h-24 w-full flex flex-col items-center justify-center gap-2 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
            >
              <Calendar className="h-6 w-6 text-indigo-600" />
              <div className="text-center">
                <span className="text-sm font-semibold text-gray-900 block">
                  Agenda de Citas
                </span>
                <span className="text-[11px] text-gray-500">Horarios y estados</span>
              </div>
            </Button>
          </Link>

          <Link href="/dashboard/tratamientos" className="block">
            <Button
              variant="outline"
              className="h-24 w-full flex flex-col items-center justify-center gap-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-colors"
            >
              <DollarSign className="h-6 w-6 text-purple-600" />
              <div className="text-center">
                <span className="text-sm font-semibold text-gray-900 block">
                  Tratamientos / Pagos
                </span>
                <span className="text-[11px] text-gray-500">Control financiero</span>
              </div>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
