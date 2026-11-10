'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAllTratamientosConPagos } from '@/actions/tratamientos'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Stethoscope, DollarSign, Calendar } from 'lucide-react'

interface TratamientoDetallado {
  id: string
  historia_id: string
  fecha_tratamiento: string
  descripcion: string
  precio: number
  estado_pago: 'pendiente' | 'parcial' | 'pagado'
  historia_nombre: string
  historia_apellido: string
  totalPagado: number
}

interface EstadisticasFinancieras {
  totalTratamientos: number
  ingresoTotal: number
  totalPagado: number
  totalPendiente: number
  porcentajePago: number
}

export default function TratamientosPage() {
  const router = useRouter()
  const [tratamientos, setTratamientos] = useState<TratamientoDetallado[]>([])
  const [filteredTratamientos, setFilteredTratamientos] = useState<TratamientoDetallado[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [estadisticas, setEstadisticas] = useState<EstadisticasFinancieras>({
    totalTratamientos: 0,
    ingresoTotal: 0,
    totalPagado: 0,
    totalPendiente: 0,
    porcentajePago: 0,
  })

  useEffect(() => {
    fetchTratamientos()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTratamientos(tratamientos)
    } else {
      const term = searchTerm.toLowerCase()
      const filtered = tratamientos.filter(t => 
        t.historia_nombre.toLowerCase().includes(term) ||
        t.historia_apellido.toLowerCase().includes(term) ||
        t.descripcion.toLowerCase().includes(term)
      )
      setFilteredTratamientos(filtered)
    }
  }, [searchTerm, tratamientos])

  const fetchTratamientos = async () => {
    setLoading(true)
    try {
      const res = await getAllTratamientosConPagos()
      if (!res.success || !res.data) {
        console.error('Error fetching tratamientos:', res.error)
        return
      }

      const tratamientosConPagos: TratamientoDetallado[] = res.data as any
      let totalIngresos = 0
      let totalPagado = 0
      let totalPendiente = 0

      for (const trat of tratamientosConPagos) {
        totalIngresos += trat.precio
        totalPagado += trat.totalPagado
        totalPendiente += Math.max(0, trat.precio - trat.totalPagado)
      }

      setTratamientos(tratamientosConPagos)
      setFilteredTratamientos(tratamientosConPagos)

      const porcentaje = totalIngresos > 0 ? (totalPagado / totalIngresos) * 100 : 0
      setEstadisticas({
        totalTratamientos: tratamientosConPagos.length,
        ingresoTotal: totalIngresos,
        totalPagado: totalPagado,
        totalPendiente: totalPendiente,
        porcentajePago: Math.round(porcentaje),
      })
    } catch (error) {
      console.error('Error en fetchTratamientos:', error)
    }
    setLoading(false)
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pagado':
        return <Badge className="bg-green-600 hover:bg-green-700">Pagado</Badge>
      case 'parcial':
        return <Badge className="bg-yellow-600 hover:bg-yellow-700">Parcial</Badge>
      case 'pendiente':
        return <Badge className="bg-red-600 hover:bg-red-700">Pendiente</Badge>
      default:
        return <Badge>{estado}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tratamientos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full min-w-0">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tratamientos y Pagos</h1>
        <p className="text-gray-600">Resumen de todos los tratamientos y su estado de pago</p>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Buscar por paciente o descripción de tratamiento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full"
          />
        </div>
      </div>

      {/* Estadísticas financieras */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tratamientos</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.totalTratamientos}</p>
              </div>
              <Stethoscope className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ingreso Total</p>
                <p className="text-2xl font-bold text-gray-900">Bs/ {estadisticas.ingresoTotal.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pagado</p>
                <p className="text-2xl font-bold text-green-600">Bs/ {estadisticas.totalPagado.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendiente</p>
                <p className="text-2xl font-bold text-red-600">Bs/ {estadisticas.totalPendiente.toFixed(2)}</p>
              </div>
              <Calendar className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">% Recaudado</p>
                <p className="text-2xl font-bold text-blue-600">{estadisticas.porcentajePago}%</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600">📊</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de tratamientos */}
      {filteredTratamientos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'No se encontraron tratamientos con ese criterio' : 'No hay tratamientos registrados'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Tratamientos Registrados ({filteredTratamientos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="p-3 text-left">Paciente</th>
                    <th className="p-3 text-left">Descripción</th>
                    <th className="p-3 text-center">Fecha</th>
                    <th className="p-3 text-right">Precio</th>
                    <th className="p-3 text-right">Pagado</th>
                    <th className="p-3 text-right">Saldo</th>
                    <th className="p-3 text-center">Estado</th>
                    <th className="p-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTratamientos.map((trat) => {
                    const saldo = trat.precio - trat.totalPagado
                    return (
                      <tr key={trat.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{trat.historia_apellido}, {trat.historia_nombre}</td>
                        <td className="p-3 text-gray-600">{trat.descripcion}</td>
                        <td className="p-3 text-center text-gray-600">{formatearFecha(trat.fecha_tratamiento)}</td>
                        <td className="p-3 text-right font-semibold">Bs/ {trat.precio.toFixed(2)}</td>
                        <td className="p-3 text-right text-green-600 font-semibold">Bs/ {trat.totalPagado.toFixed(2)}</td>
                        <td className={`p-3 text-right font-semibold ${saldo > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          Bs/ {saldo.toFixed(2)}
                        </td>
                        <td className="p-3 text-center">
                          {getEstadoBadge(trat.estado_pago)}
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            onClick={() => router.push(`/dashboard/historias/${trat.historia_id}/editar`)}
                            variant="outline"
                            className='bg-blue-500 text-white hover:bg-blue-400 hover:text-white'
                            size="sm"
                          >
                            Editar
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
