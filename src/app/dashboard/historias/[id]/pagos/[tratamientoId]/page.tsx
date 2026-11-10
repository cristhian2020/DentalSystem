'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getTratamientoById } from '@/actions/tratamientos'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Pagos from '@/components/pagos/Pagos'
import { ArrowLeft, DollarSign } from 'lucide-react'

export default function PagosPage() {
  const router = useRouter()
  const params = useParams()
  const historiaId = params.id as string
  const tratamientoId = params.tratamientoId as string

  const [loading, setLoading] = useState(true)
  const [tratamiento, setTratamiento] = useState<any>(null)
  const [historia, setHistoria] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await getTratamientoById(tratamientoId)
        if (res.success && res.data) {
          setTratamiento(res.data)
          setHistoria(res.data.historia)
        }
      } catch (err: any) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (tratamientoId) {
      fetchData()
    }
  }, [tratamientoId])

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
        <p className="text-sm text-gray-500">Cargando información de pagos...</p>
      </div>
    )
  }

  if (!tratamiento) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => router.push(`/dashboard/historias/${historiaId}`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 font-medium">Tratamiento no encontrado</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const precioNumerico = Number(tratamiento.precio) || 0

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push(`/dashboard/historias/${historiaId}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Historia Clínica
        </Button>

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Gestión de Pagos
          </h1>
          {historia && (
            <p className="text-sm text-gray-600">
              Paciente: <span className="font-semibold text-gray-900">{historia.nombre} {historia.apellido}</span>
            </p>
          )}
        </div>
      </div>

      {/* Información del Tratamiento */}
      <Card className="border-gray-200 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-amber-600" />
            Información del Tratamiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</p>
              <p className="font-semibold text-gray-800 mt-0.5">{tratamiento.fecha_tratamiento}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</p>
              <p className="font-semibold text-gray-800 mt-0.5">{tratamiento.descripcion}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Total</p>
              <p className="font-bold text-lg text-blue-600 mt-0.5">
                Bs. {precioNumerico.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Componente de Pagos */}
      <Card className="border-gray-200 shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg">Registro de Pagos</CardTitle>
          <CardDescription>
            Administra los pagos realizados para este tratamiento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Pagos
            tratamientoId={tratamientoId}
            precioTratamiento={precioNumerico}
            editable={true}
          />
        </CardContent>
      </Card>
    </div>
  )
}
