// src/app/dashboard/historias/page.tsx
'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getHistorias } from '@/actions/historias'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Search, UserPlus, FileText, Calendar, Phone } from 'lucide-react'

export default function HistoriasPage() {
  const [historias, setHistorias] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  const fetchHistorias = async () => {
    setLoading(true)
    const res = await getHistorias()
    if (res.success && res.data) {
      setHistorias(res.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchHistorias()
  }, [])

  const filteredHistorias = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return historias

    return historias.filter((historia) =>
      historia.nombre.toLowerCase().includes(term) ||
      historia.apellido.toLowerCase().includes(term) ||
      (historia.numero_historia || '').toLowerCase().includes(term) ||
      (historia.celular || '').toLowerCase().includes(term)
    )
  }, [historias, searchTerm])

  const totalActivos = useMemo(
    () => historias.filter((h) => h.estado === 'activo').length,
    [historias]
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Historias Clínicas
          </h1>
          <p className="text-gray-600 mt-1 flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-blue-600" />
            Total: {historias.length} expedientes clínicos
          </p>
        </div>
        <Link href="/dashboard/historias/nueva">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <UserPlus className="h-4 w-4 mr-2" />
            Nueva Historia
          </Button>
        </Link>
      </div>

      {/* Buscador y estadísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-xs border-gray-200">
          <CardContent className="p-4 sm:p-5">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, apellido, celular o N° historia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-gray-200">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Pacientes activos</p>
                <h3 className="text-2xl font-bold mt-0.5 text-gray-900">{totalActivos}</h3>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de historias */}
      <Card className="shadow-xs border-gray-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              Cargando historias clínicas...
            </div>
          ) : filteredHistorias.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay historias clínicas
              </h3>
              <p className="text-gray-600 mb-6 text-sm">
                {searchTerm
                  ? 'No se encontraron resultados para tu búsqueda'
                  : 'Comienza creando tu primera historia clínica'}
              </p>
              {!searchTerm && (
                <Link href="/dashboard/historias/nueva">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Crear primera historia
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Historia</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead className="hidden md:table-cell">Edad</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="hidden lg:table-cell">Registro</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistorias.map((historia) => (
                    <TableRow key={historia.id} className="hover:bg-gray-50/80">
                      <TableCell className="font-mono text-xs font-semibold text-blue-600">
                        {historia.numero_historia || '---'}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900">
                          {historia.nombre} {historia.apellido}
                        </div>
                        <div className="text-xs text-gray-500">
                          {historia.sexo || 'No especificado'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-gray-700">
                          {historia.doctor
                            ? `${historia.doctor.nombre} ${historia.doctor.apellido || ''}`
                            : 'Sin asignar'}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {historia.edad ? `${historia.edad} años` : '---'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Phone className="h-3.5 w-3.5 text-gray-400" />
                          {historia.celular || 'S/N'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            historia.estado === 'activo'
                              ? 'default'
                              : historia.estado === 'inactivo'
                              ? 'secondary'
                              : 'outline'
                          }
                          className={
                            historia.estado === 'activo'
                              ? 'bg-emerald-100 text-emerald-800'
                              : historia.estado === 'inactivo'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-blue-100 text-blue-800'
                          }
                        >
                          {historia.estado === 'activo'
                            ? 'Activo'
                            : historia.estado === 'inactivo'
                            ? 'Inactivo'
                            : 'Alta'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <span>
                            {historia.creado_en
                              ? new Date(historia.creado_en).toLocaleDateString('es-ES')
                              : '---'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                          size="sm"
                          onClick={() => router.push(`/dashboard/historias/${historia.id}`)}
                        >
                          Ver Detalle
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-center text-xs text-gray-500">
        <p>Mostrando {filteredHistorias.length} de {historias.length} historias clínicas</p>
      </div>
    </div>
  )
}
