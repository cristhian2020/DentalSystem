import { useState, useEffect } from 'react'
import { getPagosByTratamiento, createPago } from '@/actions/pagos'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Calendar, CreditCard, FileText, Plus, Loader2 } from 'lucide-react'
import type { Pago } from '@/types/pagos'

interface PagosProps {
  tratamientoId: string
  precioTratamiento: number
  editable?: boolean
}

export default function Pagos({ tratamientoId, precioTratamiento, editable = false }: PagosProps) {
  const [pagos, setPagos] = useState<Pago[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ 
    fecha_pago: '', 
    monto: 0, 
    metodo_pago: '', 
    referencia: '', 
    observaciones: '' 
  })

  const loadPagos = async () => {
    if (!tratamientoId) return
    setLoading(true)
    const res = await getPagosByTratamiento(tratamientoId)
    if (res.success && res.data) {
      setPagos(res.data as any)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadPagos()
  }, [tratamientoId])

  const handleAdd = async () => {
    if (!editable) return
    
    if (!form.fecha_pago || !form.monto || !form.metodo_pago) {
      alert('Por favor completa los campos obligatorios: Fecha, Monto y Método de pago')
      return
    }

    if (form.monto <= 0) {
      alert('El monto debe ser mayor a 0')
      return
    }

    setSaving(true)
    try {
      const res = await createPago({
        tratamiento_id: tratamientoId,
        fecha_pago: form.fecha_pago,
        monto: parseFloat(form.monto.toString()),
        metodo_pago: form.metodo_pago,
        referencia: form.referencia && form.referencia.trim() ? form.referencia.trim() : undefined,
        observaciones: form.observaciones && form.observaciones.trim() ? form.observaciones.trim() : undefined,
      })

      if (!res.success) {
        throw new Error(res.error || 'Error al guardar el pago')
      }

      await loadPagos()

      setForm({ 
        fecha_pago: '', 
        monto: 0, 
        metodo_pago: '', 
        referencia: '', 
        observaciones: '' 
      })

      alert('Pago registrado exitosamente')
    } catch (error: any) {
      console.error('Error al registrar pago:', error)
      if (error instanceof Error) {
        alert(`Error al registrar el pago: ${error.message}`)
      } else {
        alert('Error desconocido al registrar el pago')
      }
    } finally {
      setSaving(false)
    }
  }

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getMetodoPagoIcon = (metodo: string) => {
    switch (metodo) {
      case 'efectivo': return '💰'
      case 'otro': return '💸'
      case 'qr': return '📲'
      default: return '💸'
    }
  }

  const getMetodoPagoColor = (metodo: string) => {
    switch (metodo) {
      case 'efectivo': return 'bg-green-100 text-green-800'
      case 'otro': return 'bg-indigo-100 text-indigo-800'
      case 'qr': return 'bg-cyan-100 text-cyan-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalPagado = pagos.reduce((sum, pago) => sum + pago.monto, 0)
  const saldo = precioTratamiento - totalPagado

  return (
    <div className="w-full h-full flex flex-col">
      {/* Contenedor principal con scroll */}
      <div className="flex-1 overflow-y-auto px-1 md:px-0">
        
        {/* Resumen de pagos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-500">Precio</p>
                  <p className="text-lg md:text-xl font-bold text-gray-900">
                    Bs/ {precioTratamiento.toFixed(2)}
                  </p>
                </div>
                <div className="bg-gray-100 p-2 rounded-full">
                  <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-500">Pagado</p>
                  <p className="text-lg md:text-xl font-bold text-green-600">
                    Bs/ {totalPagado.toFixed(2)}
                  </p>
                </div>
                <div className="bg-green-100 p-2 rounded-full">
                  <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs md:text-sm text-gray-500`}>Saldo</p>
                  <p className={`text-lg md:text-xl font-bold ${saldo > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    Bs/ {saldo.toFixed(2)}
                  </p>
                </div>
                <div className={`p-2 rounded-full ${saldo > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                  <DollarSign className={`h-4 w-4 md:h-5 md:w-5 ${saldo > 0 ? 'text-red-600' : 'text-green-600'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulario de pago (solo si es editable) */}
        {editable && (
          <Card className="mb-4 md:mb-6">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <Plus className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                Registrar Nuevo Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  <div className="space-y-2">
                    <label className="text-xs md:text-sm font-medium">Fecha *</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 md:h-4 md:w-4 text-gray-400" />
                      <Input
                        type="date"
                        value={form.fecha_pago}
                        onChange={e => setForm(f => ({ ...f, fecha_pago: e.target.value }))}
                        className="pl-9 text-xs md:text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs md:text-sm font-medium">Monto *</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 md:h-4 md:w-4 text-gray-400" />
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={form.monto || ''}
                        onChange={e => setForm(f => ({ ...f, monto: Number(e.target.value) }))}
                        className="pl-9 text-xs md:text-sm"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs md:text-sm font-medium">Método *</label>
                    <Select
                      value={form.metodo_pago}
                      onValueChange={v => setForm(f => ({ ...f, metodo_pago: v }))}
                    >
                      <SelectTrigger className="text-xs md:text-sm">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="efectivo">Efectivo</SelectItem>
                        <SelectItem value="qr">QR</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs md:text-sm font-medium">Referencia</label>
                    <Input
                      type="text"
                      placeholder="Texto de referencia..."
                      value={form.referencia}
                      onChange={e => setForm(f => ({ ...f, referencia: e.target.value }))}
                      className="text-xs md:text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-medium flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5" />
                    Observaciones
                  </label>
                  <Input
                    type="text"
                    placeholder="Observaciones del pago..."
                    value={form.observaciones}
                    onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))}
                    className="text-xs md:text-sm"
                  />
                </div>

                <Button 
                  onClick={handleAdd} 
                  disabled={saving || !form.fecha_pago || !form.monto || !form.metodo_pago}
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 h-9 md:h-10 px-3 md:px-4"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2 animate-spin" />
                      <span className="text-xs md:text-sm">Registrando...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                      <span className="text-xs md:text-sm">Registrar Pago</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de pagos */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
              Historial de Pagos ({pagos.length})
              {!editable && (
                <span className="text-xs text-gray-500 font-normal ml-2">
                  (Solo lectura)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 md:p-6 pt-0">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Cargando pagos...</p>
                </div>
              </div>
            ) : pagos.length === 0 ? (
              <div className="text-center p-6 md:p-8">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 text-sm md:text-base">
                  No hay pagos registrados para este tratamiento
                </p>
                {editable && (
                  <p className="text-gray-500 text-xs md:text-sm mt-2">
                    Usa el formulario arriba para registrar el primer pago
                  </p>
                )}
              </div>
            ) : (
              <>
                {/* Vista de tabla para desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[100px]">Fecha</TableHead>
                        <TableHead className="min-w-[100px] text-right">Monto</TableHead>
                        <TableHead className="min-w-[120px]">Método</TableHead>
                        <TableHead className="min-w-[150px]">Referencia</TableHead>
                        <TableHead className="min-w-[200px]">Observaciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagos.map(p => (
                        <TableRow key={p.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-gray-400" />
                              {formatFecha(p.fecha_pago)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            Bs/ {p.monto.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getMetodoPagoColor(p.metodo_pago)} border-transparent`}
                            >
                              <span className="mr-1">{getMetodoPagoIcon(p.metodo_pago)}</span>
                              {p.metodo_pago.charAt(0).toUpperCase() + p.metodo_pago.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {p.referencia || '-'}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            <div className="max-w-[200px] truncate">
                              {p.observaciones || '-'}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Vista de tarjetas para móvil CON SCROLL */}
                <div className="md:hidden overflow-y-auto max-h-[400px]">
                  <div className="p-3 md:p-4 space-y-3">
                    {pagos.map(p => (
                      <div key={p.id} className="border rounded-lg p-3 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="bg-blue-100 p-1.5 rounded-full">
                              <DollarSign className="h-3.5 w-3.5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">Bs/ {p.monto.toFixed(2)}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatFecha(p.fecha_pago)}
                              </p>
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getMetodoPagoColor(p.metodo_pago)} border-transparent`}
                          >
                            <span className="mr-1">{getMetodoPagoIcon(p.metodo_pago)}</span>
                            {p.metodo_pago.charAt(0).toUpperCase() + p.metodo_pago.slice(1)}
                          </Badge>
                        </div>
                        
                        {(p.referencia || p.observaciones) && (
                          <div className="pt-2 border-t space-y-1">
                            {p.referencia && (
                              <div className="flex items-center gap-1">
                                <CreditCard className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-600">Ref: {p.referencia}</span>
                              </div>
                            )}
                            {p.observaciones && (
                              <div className="flex items-start gap-1">
                                <FileText className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                <span className="text-xs text-gray-600 break-words">{p.observaciones}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}