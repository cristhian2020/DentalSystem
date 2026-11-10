import { useState, useEffect } from 'react'
import {
  getTratamientosByHistoria,
  createTratamiento,
  updateTratamiento,
  deleteTratamiento,
} from '@/actions/tratamientos'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

import type { TratamientoRealizado } from '@/types/tratamientos'
import { Input } from '../ui/input'

interface TratamientosProps {
  historiaId: string
  editable?: boolean
}

export default function Tratamientos({ historiaId, editable = false }: TratamientosProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [tratamientos, setTratamientos] = useState<TratamientoRealizado[]>([])
  const [form, setForm] = useState({ fecha_tratamiento: '', descripcion: '', precio: '' })
  const [pagosTotales, setPagosTotales] = useState<Record<string, number>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ fecha_tratamiento: '', descripcion: '', precio: '' })

  useEffect(() => {
    if (historiaId) loadTratamientos()
  }, [historiaId])

  const loadTratamientos = async () => {
    setLoading(true)
    const res = await getTratamientosByHistoria(historiaId)

    if (res.success && res.data) {
      setTratamientos(res.data as any)
      const totales: Record<string, number> = {}
      for (const trat of res.data) {
        const total = (trat.pagos || []).reduce((sum: number, p: any) => sum + Number(p.monto), 0)
        totales[trat.id] = total
      }
      setPagosTotales(totales)
    } else {
      setTratamientos([])
      setPagosTotales({})
    }

    setLoading(false)
  }

  const handleAdd = async () => {
    if (!editable) return
    setLoading(true)
    const precioNumero = parseFloat(form.precio) || 0
    await createTratamiento({
      historia_id: historiaId,
      fecha_tratamiento: form.fecha_tratamiento || undefined,
      descripcion: form.descripcion,
      precio: precioNumero,
      estado_pago: 'pendiente',
    })
    setForm({ fecha_tratamiento: '', descripcion: '', precio: '' })
    await loadTratamientos()
    setLoading(false)
  }

  const handleEstadoPago = async (id: string, estado: TratamientoRealizado['estado_pago']) => {
    setLoading(true)
    await updateTratamiento(id, { estado_pago: estado })
    await loadTratamientos()
    setLoading(false)
  }

  const handleEditStart = (t: TratamientoRealizado) => {
    setEditingId(t.id)
    setEditForm({
      fecha_tratamiento: t.fecha_tratamiento,
      descripcion: t.descripcion,
      precio: typeof t.precio === 'string' ? t.precio : t.precio.toString(),
    })
  }

  const handleEditSave = async (id: string) => {
    if (!editable) return
    setLoading(true)
    const precioNumero = parseFloat(editForm.precio) || 0
    await updateTratamiento(id, {
      fecha_tratamiento: editForm.fecha_tratamiento || undefined,
      descripcion: editForm.descripcion,
      precio: precioNumero,
    })
    setEditingId(null)
    setEditForm({ fecha_tratamiento: '', descripcion: '', precio: '' })
    await loadTratamientos()
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!editable) return
    setLoading(true)
    await deleteTratamiento(id)
    if (editingId === id) {
      setEditingId(null)
      setEditForm({ fecha_tratamiento: '', descripcion: '', precio: '' })
    }
    await loadTratamientos()
    setLoading(false)
  }

  // Función para convertir precio a número para cálculos
  const getPrecioNumerico = (precio: number | string): number => {
    if (typeof precio === 'string') {
      const num = parseFloat(precio)
      return isNaN(num) ? 0 : num
    }
    return precio
  }

  return (
    <div>
      <h3 className="font-semibold mb-2">Tratamientos Realizados</h3>
      {loading && <div className="text-sm text-gray-500">Cargando...</div>}
      {editable ? (
        <div className="mb-4 flex flex-wrap sm:flex-nowrap gap-2">
          <Input
            type="date"
            value={form.fecha_tratamiento}
            onChange={e => setForm(f => ({ ...f, fecha_tratamiento: e.target.value }))}
            className="border rounded px-2 py-1 text-sm w-full sm:w-auto"
          />
          <Input
            type="text"
            placeholder="Descripción"
            value={form.descripcion}
            onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
            className="border rounded px-2 py-1 text-sm flex-1 min-w-[150px]"
          />
          <Input
            type="number"
            placeholder="Precio Bs/"
            value={form.precio}
            onChange={e => setForm(f => ({ ...f, precio: e.target.value }))}
            className="border rounded px-2 py-1 text-sm w-full sm:w-36"
            step="0.01"
          />
          <Button className='bg-blue-600 text-white hover:bg-blue-500 shrink-0' onClick={handleAdd} disabled={loading || !form.fecha_tratamiento || !form.descripcion || !form.precio}>
            Agregar
          </Button>
        </div>
      ) : (
        <div className="mb-4 text-sm text-gray-600">Solo lectura. Para agregar tratamientos edita la historia clínica.</div>
      )}
      <div className="w-full overflow-x-auto rounded border">
        <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Fecha</th>
            <th className="p-2 border">Descripción</th>
            <th className="p-2 border">Precio</th>
            <th className="p-2 border">Pagado</th>
            <th className="p-2 border">Saldo</th>
            <th className="p-2 border">Estado Pago</th>
            <th className="p-2 border">Pagos</th>
            {editable && <th className="p-2 border">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {tratamientos.map(t => {
            const precioNumero = getPrecioNumerico(t.precio)
            const totalPagado = pagosTotales[t.id] || 0
            const saldo = precioNumero - totalPagado
            return (
              <tr key={t.id}>
                <td className="p-2 border">
                  {editable && editingId === t.id ? (
                    <Input
                      type="date"
                      value={editForm.fecha_tratamiento}
                      onChange={e => setEditForm(f => ({ ...f, fecha_tratamiento: e.target.value }))}
                      className="border rounded px-2 py-1 text-sm w-full"
                    />
                  ) : (
                    t.fecha_tratamiento
                  )}
                </td>
                <td className="p-2 border">
                  {editable && editingId === t.id ? (
                    <Input
                      type="text"
                      value={editForm.descripcion}
                      onChange={e => setEditForm(f => ({ ...f, descripcion: e.target.value }))}
                      className="border rounded px-2 py-1 text-sm w-full"
                    />
                  ) : (
                    t.descripcion
                  )}
                </td>
                <td className="p-2 border">
                  {editable && editingId === t.id ? (
                    <Input
                      type="number"
                      value={editForm.precio}
                      onChange={e => setEditForm(f => ({ ...f, precio: e.target.value }))}
                      className="border rounded px-2 py-1 text-sm w-full"
                      step="0.01"
                    />
                  ) : (
                    <>Bs/ {precioNumero.toFixed(2)}</>
                  )}
                </td>
                <td className="p-2 border text-green-700 font-semibold">Bs/ {totalPagado.toFixed(2)}</td>
                <td className={`p-2 border font-semibold ${saldo > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  Bs/ {saldo.toFixed(2)}
                </td>
                <td className="p-2 border">
                  {editable ? (
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      value={t.estado_pago}
                      onChange={e => handleEstadoPago(t.id, e.target.value as TratamientoRealizado['estado_pago'])}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="parcial">Parcial</option>
                      <option value="pagado">Pagado</option>
                    </select>
                  ) : (
                    <span className="capitalize">{t.estado_pago}</span>
                  )}
                </td>
                <td className="p-2 border">
                  <Button
                   className='bg-green-300 hover:bg-green-500'
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault()
                      router.push(`/dashboard/historias/${historiaId}/pagos/${t.id}`)
                    }}
                  >
                    Ver Pagos
                  </Button>
                </td>
                {editable && (
                  <td className="p-2 border">
                    {editingId === t.id ? (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          className='bg-blue-600 text-white hover:bg-blue-500'
                          onClick={() => handleEditSave(t.id)}
                          disabled={loading || !editForm.fecha_tratamiento || !editForm.descripcion || !editForm.precio}
                        >
                          Guardar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className='bg-red-500 text-white hover:bg-red-400'
                          onClick={() => {
                            setEditingId(null)
                            setEditForm({ fecha_tratamiento: '', descripcion: '', precio: '' })
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button className='bg-blue-600 text-white hover:bg-blue-500 hover:text-white' type="button" size="sm" variant="outline" onClick={() => handleEditStart(t)}>
                          Editar
                        </Button>
                        <Button
                          className='text-white hover:bg-red-500'
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(t.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
      </div>
    </div>
  )
}