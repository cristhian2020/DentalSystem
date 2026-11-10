'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getHistorias } from '@/actions/historias'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, Users, UserPlus, Phone, Calendar } from 'lucide-react'

export default function PacientesPage() {
  const router = useRouter()
  const [pacientes, setPacientes] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchPacientes = async () => {
    setLoading(true)
    const res = await getHistorias()
    if (res.success && res.data) {
      setPacientes(res.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPacientes()
  }, [])

  const filteredPacientes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return pacientes

    return pacientes.filter((paciente) => {
      const nombreCompleto = `${paciente.nombre} ${paciente.apellido}`.toLowerCase()
      return (
        nombreCompleto.includes(term) ||
        (paciente.celular || '').toLowerCase().includes(term) ||
        (paciente.numero_historia || '').toLowerCase().includes(term)
      )
    })
  }, [pacientes, searchTerm])

  const totalActivos = useMemo(
    () => pacientes.filter((p) => p.estado === 'activo').length,
    [pacientes]
  )

  const renderEstado = (estado?: string | null) => {
    if (!estado) return <Badge variant="outline">Sin estado</Badge>
    const base = estado.toLowerCase()
    if (base === 'activo') {
      return <Badge className="bg-emerald-100 text-emerald-800">Activo</Badge>
    }
    if (base === 'inactivo') {
      return <Badge className="bg-gray-100 text-gray-800">Inactivo</Badge>
    }
    return <Badge className="bg-blue-100 text-blue-800">{estado}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Pacientes
          </h1>
          <p className="text-gray-600 mt-1 flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-blue-600" />
            Total: {pacientes.length} pacientes registrados
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/historias">
            <Button variant="outline">Ver historias</Button>
          </Link>
          <Link href="/dashboard/historias/nueva">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <UserPlus className="h-4 w-4 mr-2" />
              Nuevo paciente
            </Button>
          </Link>
        </div>
      </div>

      {/* Buscador y métrica */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, celular o N° historia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Pacientes activos</p>
                <h3 className="text-2xl font-bold mt-0.5 text-gray-900">{totalActivos}</h3>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla */}
      <Card className="shadow-xs border-gray-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              Cargando pacientes...
            </div>
          ) : filteredPacientes.length === 0 ? (
            <div className="p-12 text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay pacientes
              </h3>
              <p className="text-gray-600 mb-6 text-sm">
                {searchTerm
                  ? 'No se encontraron resultados para tu búsqueda'
                  : 'Comienza registrando tu primer paciente'}
              </p>
              {!searchTerm && (
                <Link href="/dashboard/historias/nueva">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Crear paciente
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead className="hidden sm:table-cell">Contacto</TableHead>
                    <TableHead>N° Historia</TableHead>
                    <TableHead className="hidden md:table-cell">Edad</TableHead>
                    <TableHead className="hidden md:table-cell">Estado</TableHead>
                    <TableHead className="hidden lg:table-cell">Registro</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPacientes.map((paciente) => (
                    <TableRow key={paciente.id} className="hover:bg-gray-50/80">
                      <TableCell>
                        <div className="font-semibold text-gray-900">
                          {paciente.nombre} {paciente.apellido}
                        </div>
                        <p className="text-xs text-gray-500 sm:hidden">
                          {paciente.celular || 'Sin número'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {paciente.sexo || 'No especificado'}
                        </p>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-1.5 text-xs text-gray-700">
                          <Phone className="h-3.5 w-3.5 text-gray-400" />
                          {paciente.celular || 'Sin número'}
                        </div>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">
                          {paciente.direccion || 'Sin dirección'}
                        </p>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-medium text-blue-600">
                        {paciente.numero_historia || '---'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {paciente.edad ? `${paciente.edad} años` : '---'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {renderEstado(paciente.estado)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          {paciente.creado_en
                            ? new Date(paciente.creado_en).toLocaleDateString('es-ES')
                            : '---'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                          onClick={() => router.push(`/dashboard/historias/${paciente.id}`)}
                        >
                          Ver ficha
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
        <p>
          Mostrando {filteredPacientes.length} de {pacientes.length} pacientes
        </p>
      </div>
    </div>
  )
}
