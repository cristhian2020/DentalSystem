'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { getUsuarios, toggleUsuarioActivo, updateUsuarioRol } from '@/actions/usuarios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ShieldCheck, UserCheck, UserX, Users, Phone, Mail, Award } from 'lucide-react'
import { toast } from 'sonner'

export default function UsuariosPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadUsuarios = async () => {
    setLoading(true)
    const res = await getUsuarios()
    if (res.success && res.data) {
      setUsuarios(res.data)
    } else {
      toast.error(res.error || 'Error al cargar usuarios')
      if (res.error?.includes('restringido')) {
        router.push('/dashboard')
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    loadUsuarios()
  }, [])

  const handleToggleActivo = async (id: string, nombre: string) => {
    const res = await toggleUsuarioActivo(id)
    if (res.success) {
      toast.success(`Estado de ${nombre} actualizado`)
      setUsuarios((prev) =>
        prev.map((u) => (u.id === id ? { ...u, activo: res.activo } : u))
      )
    } else {
      toast.error(res.error || 'No se pudo cambiar el estado')
    }
  }

  const handleRoleChange = async (id: string, newRole: 'admin' | 'dentista', nombre: string) => {
    const res = await updateUsuarioRol(id, newRole)
    if (res.success) {
      toast.success(`Rol de ${nombre} actualizado a ${newRole}`)
      setUsuarios((prev) =>
        prev.map((u) => (u.id === id ? { ...u, rol: newRole } : u))
      )
    } else {
      toast.error(res.error || 'No se pudo cambiar el rol')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Gestión de Usuarios y Roles
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Administra los accesos, roles y permisos de los dentistas y administradores de la clínica.
          </p>
        </div>
      </div>

      <Card className="border-gray-200 shadow-xs">
        <CardHeader className="border-b bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">
                Usuarios Registrados ({usuarios.length})
              </CardTitle>
              <CardDescription>
                Lista de cuentas con acceso al sistema clínico
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              Cargando usuarios...
            </div>
          ) : usuarios.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No hay usuarios registrados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Especialidad / Colegiado</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Historias / Tratamientos</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((u) => {
                    const isSelf = session?.user?.id === u.id
                    return (
                      <TableRow key={u.id} className="hover:bg-gray-50/80">
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900 flex items-center gap-1.5">
                              {u.nombre} {u.apellido}
                              {isSelf && (
                                <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-200">
                                  Tú
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <Mail className="h-3 w-3" />
                              {u.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-gray-600 flex items-center gap-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            {u.telefono || 'Sin teléfono'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <span className="font-medium text-gray-700">
                              {u.especialidad || 'General'}
                            </span>
                            {u.numero_colegiado && (
                              <div className="text-gray-400 text-[11px]">
                                Col: {u.numero_colegiado}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            defaultValue={u.rol || 'dentista'}
                            disabled={isSelf}
                            onValueChange={(val: any) =>
                              handleRoleChange(u.id, val, u.nombre)
                            }
                          >
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dentista">Dentista</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={u.activo ? 'default' : 'secondary'}
                            className={u.activo ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-100 text-red-700'}
                          >
                            {u.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-gray-600">
                            <span>{u._count?.historias_doctor || 0} pacientes</span>
                            <span className="mx-1 text-gray-300">•</span>
                            <span>{u._count?.tratamientos_realizados || 0} tratamientos</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isSelf}
                            onClick={() => handleToggleActivo(u.id, u.nombre)}
                            className={u.activo ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}
                          >
                            {u.activo ? (
                              <>
                                <UserX className="h-4 w-4 mr-1" />
                                Desactivar
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-1" />
                                Activar
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

