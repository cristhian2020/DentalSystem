// src/app/dashboard/historias/[id]/page.tsx - VERSIÓN RESPONSIVE
'use client'

import { useEffect, useState, useRef } from 'react'
import type { HistoriaClinica } from '@/types/historias'
import { useRouter, useParams } from 'next/navigation'
import { getHistoriaById, deleteHistoria } from '@/actions/historias'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PrintHistoria from '@/components/historias/PrintHistoria'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  ArrowLeft,
  User,
  FileText,
  Calendar,
  Heart,
  Phone,
  MapPin,
  Edit,
  Printer,
  DollarSign,
  MoreVertical,
  X,
  AlertCircle,
  Trash2,
} from 'lucide-react'

import Odontograma from '@/components/odontograma/Odontograma'
import Tratamientos from '@/components/tratamientos/Tratamientos'

import Icon from '@mdi/react';
import { mdiTooth } from '@mdi/js';

export default function DetalleHistoriaPage() {
  const router = useRouter()
  const params = useParams()
  const historiaId = params.id as string

  const [historia, setHistoria] = useState<HistoriaClinica | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [odontogramaData, setOdontogramaData] = useState<any[]>([])
  const [tratamientosData, setTratamientosData] = useState<any[]>([])
  const [pagosTotales, setPagosTotales] = useState<Record<string, number>>({})
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const res = await getHistoriaById(historiaId)
        if (!res.success || !res.data) {
          throw new Error(res.error || 'Historia clínica no encontrada')
        }

        const data = res.data
        setHistoria(data)
        setOdontogramaData(data.odontogramas || [])
        setTratamientosData(data.tratamientos || [])

        const totales: Record<string, number> = {}
        for (const trat of data.tratamientos || []) {
          const total = (trat.pagos || []).reduce(
            (sum: number, p: any) => sum + Number(p.monto),
            0
          )
          totales[trat.id] = total
        }
        setPagosTotales(totales)
      } catch (err: any) {
        console.error('Error:', err)
        setError(err.message || 'Error al cargar la historia clínica')
      } finally {
        setLoading(false)
      }
    }

    if (historiaId) {
      fetchData()
    }
  }, [historiaId, router])

  const formatFecha = (fecha?: string | null) => {
    if (!fecha) return 'No registrada'
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Print helper without deprecated document.write
  const handlePrint = () => {
    if (!printRef.current) return
    const printWindow = window.open('', '', 'width=800,height=600')
    if (!printWindow) return

    const doc = printWindow.document
    const styles = `
      body { font-family: Arial, sans-serif; margin: 20px; }
      table { width: 100%; border-collapse: collapse; margin: 10px 0; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
      th { background-color: #f0f0f0; font-weight: bold; }
      h1 { color: #1e40af; font-size: 24px; margin-bottom: 10px; }
      h2 { color: #334155; font-size: 18px; margin-top: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
      h3 { color: #475569; font-size: 14px; margin-top: 15px; }
      .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 10px 0; }
      .info-item { margin-bottom: 8px; }
      .label { font-weight: bold; color: #64748b; font-size: 11px; }
      .value { color: #1e293b; font-size: 13px; }
      .section { page-break-inside: avoid; margin-bottom: 20px; }
      @media print { body { margin: 0; } }
    `

    // Inject styles via <style> element
    const styleEl = doc.createElement('style')
    styleEl.type = 'text/css'
    styleEl.appendChild(doc.createTextNode(styles))
    doc.head.appendChild(styleEl)

    // Set printable content
    const container = doc.createElement('div')
    container.innerHTML = printRef.current.innerHTML
    doc.body.innerHTML = ''
    doc.body.appendChild(container)
    doc.title = 'Historia Clínica'

    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta historia clínica? Esta acción no se puede deshacer.')) {
      try {
        const res = await deleteHistoria(historiaId)
        if (res.success) {
          alert('Historia clínica eliminada correctamente.')
          router.push('/dashboard/historias')
        } else {
          alert(res.error || 'Error al eliminar la historia clínica.')
        }
      } catch (err) {
        alert('Error al eliminar la historia clínica.')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando historia clínica...</p>
        </div>
      </div>
    )
  }

  if (error || !historia) {
    return (
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/historias')}
          className="mb-4 sm:mb-6 px-2 sm:px-4"
          size={isMobile ? "sm" : "default"}
        >
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="text-xs sm:text-sm">Volver a historias</span>
        </Button>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 sm:p-8 text-center">
            <div className="text-red-600 mb-3 sm:mb-4">
              <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-red-800 mb-2">
              Historia clínica no encontrada
            </h3>
            <p className="text-xs sm:text-sm text-red-600 mb-4 sm:mb-6">
              {error || 'La historia clínica solicitada no existe o no tienes acceso.'}
            </p>
            <Button
              onClick={() => router.push('/dashboard/historias')}
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="text-xs sm:text-sm"
            >
              Ver todas las historias
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/historias')}
            className="mb-3 sm:mb-4 px-2 sm:px-4"
            size={isMobile ? "sm" : "default"}
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Volver a historias</span>
          </Button>
          
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1 sm:mb-2">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                    {historia.nombre} {historia.apellido}
                  </h1>
                  <Badge 
                    variant="outline" 
                    className="bg-blue-50 text-blue-700 border-blue-200 text-xs sm:text-sm w-fit"
                  >
                    {historia.numero_historia}
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{historia.edad} años • {historia.sexo}</span>
                  </div>
                  {historia.celular && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{historia.celular}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Registro: {formatFecha(historia.creado_en)}</span>
                  </div>
                </div>
              </div>
              
              {/* Botones de acción - Versión móvil con dropdown */}
              {isMobile ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem 
                      onClick={() => router.push(`/dashboard/historias/${historiaId}/editar`)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handlePrint}
                      className="flex items-center gap-2"
                    >
                      <Printer className="h-4 w-4" />
                      <span>Imprimir</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleDelete}
                      className="flex items-center gap-2 text-red-600 "
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Eliminar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex gap-2">
                  <Button
                    className='bg-blue-500 text-white hover:bg-blue-600'
                    onClick={() => router.push(`/dashboard/historias/${historiaId}/editar`)}
                    size="sm"
                  >
                    <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    <span className="text-xs sm:text-sm">Editar</span>
                  </Button>
                  <Button
                    onClick={handlePrint}
                    variant="outline"
                    size="sm"
                  >
                    <Printer className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    <span className="text-xs sm:text-sm">Imprimir</span>
                  </Button>
                  <Button
                  className=' hover:bg-red-500'
                    onClick={handleDelete}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-white" />
                    <span className="text-xs sm:text-sm text-white">Eliminar</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs principales - Responsive */}
        <Tabs defaultValue="informacion" className="mb-6 sm:mb-8">
          <div className="overflow-x-auto pb-2">
            <TabsList className="inline-flex w-max min-w-full sm:w-full grid-cols-5 gap-1 sm:gap-2 px-1">
              <TabsTrigger 
                value="informacion" 
                className="flex-1 min-w-[70px] text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2 flex flex-col sm:flex-row items-center justify-center gap-1"
              >
                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Información</span>
                <span className="sm:hidden text-[10px] mt-0.5">Información</span>
              </TabsTrigger>
              <TabsTrigger 
                value="antecedentes" 
                className="flex-1 min-w-[70px] text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2 flex flex-col sm:flex-row items-center justify-center gap-1"
              >
                <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Antecedentes</span>
                <span className="sm:hidden text-[10px] mt-0.5">Antecedentes</span>
              </TabsTrigger>
              <TabsTrigger 
                value="habitos" 
                className="flex-1 min-w-[70px] text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2 flex flex-col sm:flex-row items-center justify-center gap-1"
              >
                <Icon path={mdiTooth} className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Hábitos</span>
                <span className="sm:hidden text-[10px] mt-0.5">Hábitos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="odontograma" 
                className="flex-1 min-w-[70px] text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2 flex flex-col sm:flex-row items-center justify-center gap-1"
              >
                <Icon path={mdiTooth} className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Odontograma</span>
                <span className="sm:hidden text-[10px] mt-0.5">Odontograma</span>
              </TabsTrigger>
              <TabsTrigger 
                value="tratamientos" 
                className="flex-1 min-w-[70px] text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2 flex flex-col sm:flex-row items-center justify-center gap-1"
              >
                <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Tratamientos</span>
                <span className="sm:hidden text-[10px] mt-0.5">Tratamientos</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab 1: Información Personal */}
          <TabsContent value="informacion" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Información Básica */}
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-500">Nombre</p>
                      <p className="font-medium text-sm sm:text-base truncate">{historia.nombre}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-500">Apellido</p>
                      <p className="font-medium text-sm sm:text-base truncate">{historia.apellido}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-500">Edad</p>
                      <p className="font-medium text-sm sm:text-base">{historia.edad} años</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-500">Sexo</p>
                      <p className="font-medium text-sm sm:text-base">{historia.sexo}</p>
                    </div>
                  </div>

                  {historia.fecha_nacimiento && (
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-500">Fecha de Nacimiento</p>
                      <p className="font-medium text-sm sm:text-base">{formatFecha(historia.fecha_nacimiento)}</p>
                    </div>
                  )}

                  {historia.lugar_nacimiento && (
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-500">Lugar de Nacimiento</p>
                      <p className="font-medium text-sm sm:text-base truncate">{historia.lugar_nacimiento}</p>
                    </div>
                  )}

                  {historia.religion && (
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-500">Religión</p>
                      <p className="font-medium text-sm sm:text-base">{historia.religion}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contacto y Dirección */}
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    Contacto
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
                  {historia.celular && (
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-500">Celular</p>
                      <p className="font-medium text-sm sm:text-base">{historia.celular}</p>
                    </div>
                  )}

                  {historia.direccion && (
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                        Dirección
                      </p>
                      <p className="font-medium text-sm sm:text-base mt-1 break-words">{historia.direccion}</p>
                    </div>
                  )}

                  {/* Estado del paciente */}
                  <div className="pt-3 sm:pt-4 border-t">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Estado del Paciente</p>
                    <Badge 
                      className={
                        `text-xs sm:text-sm ${
                          historia.estado === 'activo' ? 'bg-green-100 text-green-800' :
                          historia.estado === 'inactivo' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        }`
                      }
                    >
                      {historia.estado === 'activo' ? 'Activo' :
                       historia.estado === 'inactivo' ? 'Inactivo' :
                       'Alta'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 2: Antecedentes Médicos */}
          <TabsContent value="antecedentes" className="mt-4">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  Antecedentes Médicos
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Información relevante para tratamientos dentales
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Columna 1 */}
                  <div className="space-y-4 sm:space-y-6">
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3 flex items-center gap-2">
                        <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
                        Tratamiento Médico Actual
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${historia.tratamiento_medico ? 'bg-red-500' : 'bg-green-500'}`} />
                        <span className="font-medium text-sm sm:text-base">
                          {historia.tratamiento_medico ? 'Sí' : 'No'}
                        </span>
                      </div>
                      {historia.tratamiento_medico_detalle && (
                        <p className="text-xs sm:text-sm text-gray-700 mt-2 p-2 sm:p-3 bg-white rounded border break-words">
                          {historia.tratamiento_medico_detalle}
                        </p>
                      )}
                    </div>

                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3">Medicamentos Actuales</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${historia.medicamentos_actuales ? 'bg-red-500' : 'bg-green-500'}`} />
                        <span className="font-medium text-sm sm:text-base">
                          {historia.medicamentos_actuales ? 'Sí' : 'No'}
                        </span>
                      </div>
                      {historia.medicamentos_actuales_detalle && (
                        <p className="text-xs sm:text-sm text-gray-700 mt-2 p-2 sm:p-3 bg-white rounded border break-words">
                          {historia.medicamentos_actuales_detalle}
                        </p>
                      )}
                    </div>

                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3">Enfermedad del Corazón</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${historia.enfermedad_corazon ? 'bg-red-500' : 'bg-green-500'}`} />
                        <span className="font-medium text-sm sm:text-base">
                          {historia.enfermedad_corazon ? 'Sí' : 'No'}
                        </span>
                      </div>
                      {historia.enfermedad_corazon_detalle && (
                        <p className="text-xs sm:text-sm text-gray-700 mt-2 p-2 sm:p-3 bg-white rounded border break-words">
                          {historia.enfermedad_corazon_detalle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Columna 2 */}
                  <div className="space-y-4 sm:space-y-6">
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3">Alergias</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${historia.alergias ? 'bg-red-500' : 'bg-green-500'}`} />
                        <span className="font-medium text-sm sm:text-base">
                          {historia.alergias ? 'Sí' : 'No'}
                        </span>
                      </div>
                      {historia.alergias_detalle && (
                        <p className="text-xs sm:text-sm text-gray-700 mt-2 p-2 sm:p-3 bg-white rounded border break-words">
                          {historia.alergias_detalle}
                        </p>
                      )}
                    </div>

                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3">Hemorragias en Extracciones</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${historia.hemorragias_extraccion ? 'bg-red-500' : 'bg-green-500'}`} />
                        <span className="font-medium text-sm sm:text-base">
                          {historia.hemorragias_extraccion ? 'Sí' : 'No'}
                        </span>
                      </div>
                      {historia.hemorragias_extraccion_detalle && (
                        <p className="text-xs sm:text-sm text-gray-700 mt-2 p-2 sm:p-3 bg-white rounded border break-words">
                          {historia.hemorragias_extraccion_detalle}
                        </p>
                      )}
                    </div>

                    {/* Comentarios del médico */}
                    {historia.comentarios_medico && (
                      <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3 text-blue-800">
                          Comentarios del Médico
                        </h3>
                        <p className="text-xs sm:text-sm text-blue-700 break-words">
                          {historia.comentarios_medico}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Hábitos de Higiene */}
          <TabsContent value="habitos" className="mt-4">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Icon path={mdiTooth} className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600" />
                  Hábitos de Higiene Bucal
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                  {/* Información de higiene */}
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Frecuencia de Higiene</h3>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded">
                          <span className="font-medium text-xs sm:text-sm">Usa cepillo dental</span>
                          <Badge variant={historia.usa_cepillo ? "default" : "secondary"} className="text-xs">
                            {historia.usa_cepillo ? 'Sí' : 'No'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded">
                          <span className="font-medium text-xs sm:text-sm">Usa dentífrico</span>
                          <Badge variant={historia.usa_dentifrico ? "default" : "secondary"} className="text-xs">
                            {historia.usa_dentifrico ? 'Sí' : 'No'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded">
                          <span className="font-medium text-xs sm:text-sm">Frecuencia de cepillado</span>
                          <span className="font-bold text-blue-600 text-xs sm:text-sm">
                            {historia.veces_cepillado_dia} veces al día
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded">
                          <span className="font-medium text-xs sm:text-sm">Usa hilo dental</span>
                          <Badge variant={historia.usa_hilo_dental ? "default" : "secondary"} className="text-xs">
                            {historia.usa_hilo_dental ? 'Sí' : 'No'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Técnica y observaciones */}
                  <div className="space-y-4 sm:space-y-6">
                    {historia.tecnica_cepillado && (
                      <div>
                        <h3 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3">Técnica de Cepillado</h3>
                        <div className="p-2.5 sm:p-4 bg-teal-50 rounded-lg border border-teal-200">
                          <p className="text-teal-800 text-xs sm:text-sm break-words">{historia.tecnica_cepillado}</p>
                        </div>
                      </div>
                    )}

                    {historia.observaciones_generales && (
                      <div>
                        <h3 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3">Observaciones Generales</h3>
                        <div className="p-2.5 sm:p-4 bg-gray-50 rounded-lg">
                          <p className="text-gray-700 text-xs sm:text-sm break-words">{historia.observaciones_generales}</p>
                        </div>
                      </div>
                    )}

                    {/* Resumen de higiene */}
                    <div className="p-2.5 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                      <h3 className="font-semibold text-green-800 text-sm sm:text-base mb-1 sm:mb-2">
                        Resumen de Hábitos
                      </h3>
                      <p className="text-xs sm:text-sm text-green-700 break-words">
                        {historia.usa_cepillo && historia.usa_dentifrico && (historia.veces_cepillado_dia ?? 0) >= 2
                          ? 'Excelentes hábitos de higiene bucal'
                          : historia.usa_cepillo
                            ? 'Hábitos de higiene básicos'
                            : 'Requiere orientación en higiene bucal'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Odontograma */}
          <TabsContent value="odontograma" className="mt-4">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Icon path={mdiTooth} className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  Odontograma
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Registro y visualización del estado dental del paciente
                </CardDescription>
                <img 
                  src='/dientes2.png' 
                  alt="Información del Odontograma" 
                  className="mt-3 sm:mt-4 w-full max-w-md mx-auto object-contain" 
                />
              </CardHeader>
              <CardContent className="p-2 sm:p-6">
                <div className="w-full overflow-x-auto">
                  <Odontograma historiaId={historiaId} editable={false} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 5: Tratamientos y Pagos */}
          <TabsContent value="tratamientos" className="mt-4">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                  Tratamientos Realizados
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Historial de tratamientos realizados y pagos asociados
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 sm:p-6">
                <div className="w-full overflow-x-auto">
                  <Tratamientos historiaId={historiaId} editable={false} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Hidden content for printing - Uses PrintHistoria component */}
        <div ref={printRef} style={{ display: 'none' }}>
          <PrintHistoria 
            historia={historia}
            odontogramaData={odontogramaData}
            tratamientosData={tratamientosData}
            pagosTotales={pagosTotales}
          />
        </div>

        {/* Acciones adicionales */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pt-4 sm:pt-6 border-t">
          <div className="text-xs sm:text-sm text-gray-500">
            <p>Última actualización: {formatFecha(historia.actualizado_en || historia.creado_en)}</p>
          </div>
          
          <div className="flex gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/odontograma')}
              className="flex items-center gap-1.5 text-xs sm:text-sm"
              size={isMobile ? "sm" : "default"}
            >
              <Icon path={mdiTooth} className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Odontograma</span>
            </Button>
          </div>
        </div>
      </div>
  )
}