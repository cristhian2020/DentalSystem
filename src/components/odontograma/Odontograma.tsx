import { OdontogramaDiente } from '@/types/odontograma'
import { useState, useEffect } from 'react'
import {
  getOdontogramaByHistoria,
  upsertOdontogramaDiente,
  deleteOdontogramaDiente,
} from '@/actions/odontograma'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle } from 'lucide-react'

interface OdontogramaProps {
  historiaId: string
  editable?: boolean
}

export default function Odontograma({ historiaId, editable = false }: OdontogramaProps) {
  const [registros, setRegistros] = useState<OdontogramaDiente[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ pieza_numero: '', descripcion: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadOdontograma = async () => {
    setLoading(true)
    const res = await getOdontogramaByHistoria(historiaId)
    if (res.success && res.data) {
      setRegistros(res.data as any)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (historiaId) loadOdontograma()
  }, [historiaId])

  const handleAdd = async () => {
    if (!editable) return
    
    setError('')
    setSuccess('')
    
    try {
      if (!form.pieza_numero || !form.descripcion) {
        throw new Error('Completa todos los campos')
      }

      const num = Number(form.pieza_numero)
      if (num < 11 || num > 85) {
        throw new Error('El número de pieza debe estar entre 11 y 85')
      }

      setLoading(true)
      
      const res = await upsertOdontogramaDiente({
        historia_id: historiaId,
        pieza_numero: form.pieza_numero,
        descripcion: form.descripcion,
      })

      if (!res.success) {
        throw new Error(res.error || 'Error al guardar pieza')
      }
      
      setSuccess('Registro agregado correctamente')
      setForm({ pieza_numero: '', descripcion: '' })
      await loadOdontograma()
    } catch (err: any) {
      console.error('Error completo:', err)
      setError(err.message || 'Error al agregar el registro')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!editable) return
    setLoading(true)
    await deleteOdontogramaDiente(id)
    await loadOdontograma()
  }

  return (
    <div>
      <h3 className="font-semibold mb-2">Odontograma</h3>
      {loading && <div className="text-sm text-gray-500">Cargando...</div>}
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="mb-4 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}
      
      {editable ? (
        <div className="mb-4 flex flex-wrap sm:flex-nowrap gap-2">
          <input
            type="number"
            placeholder="Nº Pieza"
            value={form.pieza_numero}
            onChange={e => setForm(f => ({ ...f, pieza_numero: e.target.value }))}
            className="border rounded px-2 py-1 text-sm w-24 shrink-0"
            min="11"
            max="85"
          />
          <input
            type="text"
            placeholder="Descripción del trabajo realizado"
            value={form.descripcion}
            onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
            className="border rounded px-2 py-1 text-sm flex-1 min-w-[150px]"
          />
          <Button
            type="button"
            className='bg-blue-600 hover:bg-blue-900 text-white shrink-0'
            onClick={handleAdd}
            disabled={loading || !form.pieza_numero || !form.descripcion}
            size="sm"
          >
            Agregar
          </Button>
        </div>
      ) : (
        <div className="mb-4 text-sm text-gray-600">Solo lectura. Para agregar piezas edita la historia clínica.</div>
      )}

      <div className="w-full overflow-x-auto rounded border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border-b w-24">Nº Pieza</th>
              <th className="p-2 border-b">Descripción</th>
              {editable && <th className="p-2 border-b w-24">Acción</th>}
            </tr>
          </thead>
          <tbody>
            {registros.length === 0 ? (
              <tr>
                <td colSpan={editable ? 3 : 2} className="p-4 text-center text-gray-500">
                  No hay registros dentales
                </td>
              </tr>
            ) : (
              registros.map(r => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 border-r text-center font-semibold">{r.pieza_numero}</td>
                  <td className="p-2 border-r">{r.descripcion}</td>
                  {editable && (
                    <td className="p-2 text-center">
                      <Button
                        type="button"
                        size="sm"
                        className='text-white'
                        variant="destructive"
                        onClick={() => handleDelete(r.id)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
