'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getHistoriasConOdontogramas } from '@/actions/odontograma'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, FileText, Calendar, User } from 'lucide-react'

interface HistoriaClinica {
  id: string
  nombre: string
  apellido: string
  numero_historia: string
  fecha_nacimiento: string
  celular: string
  creado_en: string
}

interface Odontograma {
  id: string
  historia_id: string
  pieza_numero: number
  descripcion: string // CORRECCIÓN: Estaba como "description" en el código pero "descripcion" en la interfaz
  creado_en: string
  actualizado_en: string
}

export default function OdontogramaPage() {
  const router = useRouter()
  const [historias, setHistorias] = useState<HistoriaClinica[]>([])
  const [filteredHistorias, setFilteredHistorias] = useState<HistoriaClinica[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [odontogramasPorHistoria, setOdontogramasPorHistoria] = useState<{[key: string]: Odontograma[]}>({})

  useEffect(() => {
    fetchHistorias()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredHistorias(historias)
    } else {
      const term = searchTerm.toLowerCase()
      const filtered = historias.filter(h => 
        h.nombre.toLowerCase().includes(term) ||
        h.apellido.toLowerCase().includes(term) ||
        h.numero_historia.includes(term)
      )
      setFilteredHistorias(filtered)
    }
  }, [searchTerm, historias])

  const fetchHistorias = async () => {
    setLoading(true)
    const res = await getHistoriasConOdontogramas()

    if (res.success && res.data) {
      const historiasData = res.data
      setHistorias(historiasData as any)
      setFilteredHistorias(historiasData as any)

      const grouped: { [key: string]: Odontograma[] } = {}
      historiasData.forEach((h: any) => {
        grouped[h.id] = h.odontogramas || []
      })
      setOdontogramasPorHistoria(grouped)
    } else {
      console.error('Error fetching historias:', res.error)
    }
    setLoading(false)
  }

  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }
    return edad
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando pacientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full min-w-0">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Odontogramas</h1>
        <p className="text-gray-600">Selecciona un paciente para ver o editar su odontograma</p>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Buscar por nombre, apellido o documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full"
          />
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pacientes</p>
                <p className="text-2xl font-bold text-gray-900">{historias.length}</p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resultados</p>
                <p className="text-2xl font-bold text-gray-900">{filteredHistorias.length}</p>
              </div>
              <Search className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Historias Activas</p>
                <p className="text-2xl font-bold text-gray-900">{historias.length}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de pacientes */}
      {filteredHistorias.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'No se encontraron pacientes con ese criterio de búsqueda' : 'No hay historias clínicas registradas'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHistorias.map((historia) => {
            // Obtener los odontogramas para esta historia específica
            const odontogramas = odontogramasPorHistoria[historia.id] || []
            
            return (
              <Card key={historia.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {historia.apellido}, {historia.nombre}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span>N.º Historia: {historia.numero_historia}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{calcularEdad(historia.fecha_nacimiento)} años</span>
                    </div>
                    {historia.celular && (
                      <div className="flex items-center text-gray-600">
                        <span className="mr-2">📞</span>
                        <span>{historia.celular}</span>
                      </div>
                    )}

                    {/* Mostrar información del odontograma */}
                    {odontogramas.length > 0 ? (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-medium text-gray-700 mb-2">Odontograma:</p>
                        <div className="space-y-1 max-h-20 overflow-y-auto text-xs">
                          {odontogramas.map(odo => (
                            <div key={odo.id} className="flex justify-between items-center">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Pieza {odo.pieza_numero}
                              </span>
                              <span className="text-gray-600 truncate ml-2">
                                {odo.descripcion} {/* CORRECCIÓN: Usar 'descripcion' no 'description' */}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-gray-500 italic">
                          No hay registros en el odontograma
                        </p>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 mt-3 pt-3 border-t">
                      Registrado: {formatearFecha(historia.creado_en)}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      onClick={() => router.push(`/dashboard/historias/${historia.id}`)}
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-500 hover:text-white"
                    >
                      Ver Historia
                    </Button>
                    <Button
                      onClick={() => router.push(`/dashboard/historias/${historia.id}/editar`)}
                      variant="outline" 
                      size="sm"
                      className="flex-1 bg-green-700 text-white hover:bg-green-600 hover:text-white"
                    >
                      Ver Odontograma
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}