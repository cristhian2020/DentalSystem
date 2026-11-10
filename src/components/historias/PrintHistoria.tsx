import type { HistoriaClinica } from '@/types/historias'
import type { TratamientoRealizado } from '@/types/tratamientos'

interface PrintHistoriaProps {
  historia: HistoriaClinica
  odontogramaData: any[]
  tratamientosData: TratamientoRealizado[]
  pagosTotales: Record<string, number>
}

export default function PrintHistoria({ 
  historia, 
  odontogramaData, 
  tratamientosData, 
  pagosTotales 
}: PrintHistoriaProps) {
  
  const formatFecha = (fecha?: string | null) => {
    if (!fecha) return 'No registrada'
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div id="print-content" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <style>
        {`
          @media print {
            body { margin: 0; }
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
            .full-width { grid-column: 1 / -1; }
          }
        `}
      </style>
      
      <h1>Historia Clínica - {historia.nombre} {historia.apellido}</h1>
      <p><strong>No. Historia:</strong> {historia.numero_historia}</p>
      <p><strong>Fecha de Registro:</strong> {formatFecha(historia.creado_en)}</p>
      
      <h2>Información Personal</h2>
      <div className="info-grid">
        <div className="info-item">
          <span className="label">Nombre:</span> 
          <span className="value">{historia.nombre}</span>
        </div>
        <div className="info-item">
          <span className="label">Apellido:</span> 
          <span className="value">{historia.apellido}</span>
        </div>
        <div className="info-item">
          <span className="label">Edad:</span> 
          <span className="value">{historia.edad} años</span>
        </div>
        <div className="info-item">
          <span className="label">Sexo:</span> 
          <span className="value">{historia.sexo}</span>
        </div>
        {historia.fecha_nacimiento && (
          <div className="info-item">
            <span className="label">Fecha de Nacimiento:</span> 
            <span className="value">{formatFecha(historia.fecha_nacimiento)}</span>
          </div>
        )}
        {historia.lugar_nacimiento && (
          <div className="info-item">
            <span className="label">Lugar de Nacimiento:</span> 
            <span className="value">{historia.lugar_nacimiento}</span>
          </div>
        )}
        {historia.religion && (
          <div className="info-item">
            <span className="label">Religión:</span> 
            <span className="value">{historia.religion}</span>
          </div>
        )}
      </div>

      <h2>Contacto</h2>
      <div className="info-grid">
        {historia.celular && (
          <div className="info-item">
            <span className="label">Celular:</span> 
            <span className="value">{historia.celular}</span>
          </div>
        )}
        
        {historia.direccion && (
          <div className="info-item full-width">
            <span className="label">Dirección:</span> 
            <span className="value">{historia.direccion}</span>
          </div>
        )}
      </div>

      <h2>Antecedentes Médicos</h2>
      <div className="info-grid">
        <div className="info-item">
          <span className="label">Tratamiento Médico Actual:</span>
          <span className="value">{historia.tratamiento_medico ? 'Sí' : 'No'}</span>
          {historia.tratamiento_medico_detalle && (
            <div style={{ marginTop: '5px' }}>{historia.tratamiento_medico_detalle}</div>
          )}
        </div>
        
        <div className="info-item">
          <span className="label">Medicamentos Actuales:</span>
          <span className="value">{historia.medicamentos_actuales ? 'Sí' : 'No'}</span>
          {historia.medicamentos_actuales_detalle && (
            <div style={{ marginTop: '5px' }}>{historia.medicamentos_actuales_detalle}</div>
          )}
        </div>
        
        <div className="info-item">
          <span className="label">Enfermedad del corazón:</span>
          <span className="value">{historia.enfermedad_corazon ? 'Sí' : 'No'}</span>
          {historia.enfermedad_corazon_detalle && (
            <div style={{ marginTop: '5px' }}>{historia.enfermedad_corazon_detalle}</div>
          )}
        </div>
        
        <div className="info-item">
          <span className="label">Alergias:</span>
          <span className="value">{historia.alergias ? 'Sí' : 'No'}</span>
          {historia.alergias_detalle && (
            <div style={{ marginTop: '5px' }}>{historia.alergias_detalle}</div>
          )}
        </div>
        
        <div className="info-item">
          <span className="label">Hemorragias en Extracciones:</span>
          <span className="value">{historia.hemorragias_extraccion ? 'Sí' : 'No'}</span>
          {historia.hemorragias_extraccion_detalle && (
            <div style={{ marginTop: '5px' }}>{historia.hemorragias_extraccion_detalle}</div>
          )}
        </div>
      </div>

      <h2>Hábitos de Higiene Bucal</h2>
      <div className="info-grid">
        <div className="info-item">
          <span className="label">Usa Cepillo:</span> 
          <span className="value">{historia.usa_cepillo ? 'Sí' : 'No'}</span>
        </div>
        <div className="info-item">
          <span className="label">Usa Dentífrico:</span> 
          <span className="value">{historia.usa_dentifrico ? 'Sí' : 'No'}</span>
        </div>
        <div className="info-item">
          <span className="label">Usa Hilo Dental:</span> 
          <span className="value">{historia.usa_hilo_dental ? 'Sí' : 'No'}</span>
        </div>
        <div className="info-item">
          <span className="label">Frecuencia de Cepillado:</span> 
          <span className="value">{historia.veces_cepillado_dia} veces/día</span>
        </div>
      </div>
      
      {historia.tecnica_cepillado && (
        <div className="section">
          <h3>Técnica de Cepillado</h3>
          <p>{historia.tecnica_cepillado}</p>
        </div>
      )}

      <h2>Odontograma</h2>
      {odontogramaData.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>No. Pieza</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {odontogramaData.map(o => (
              <tr key={o.id}>
                <td style={{textAlign: 'center', fontWeight: 'bold'}}>{o.pieza_numero}</td>
                <td>{o.descripcion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay registros dentales</p>
      )}

      <h2>Tratamientos Realizados</h2>
      {tratamientosData.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Pagado</th>
              <th>Saldo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {tratamientosData.map(t => {
              const totalPagado = pagosTotales[t.id] || 0
              const precioNumero = typeof t.precio === 'string' ? parseFloat(t.precio) : t.precio
              const saldo = precioNumero - totalPagado
              return (
                <tr key={t.id}>
                  <td>{formatFecha(t.fecha_tratamiento)}</td>
                  <td>{t.descripcion}</td>
                  <td>Bs/ {precioNumero.toFixed(2)}</td>
                  <td style={{color: '#15803d', fontWeight: 'bold'}}>Bs/ {totalPagado.toFixed(2)}</td>
                  <td style={{color: saldo > 0 ? '#dc2626' : '#15803d', fontWeight: 'bold'}}>
                    Bs/ {saldo.toFixed(2)}
                  </td>
                  <td style={{textTransform: 'capitalize'}}>{t.estado_pago}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ) : (
        <p>No hay tratamientos registrados</p>
      )}

      {historia.observaciones_generales && (
        <div className="section">
          <h2>Observaciones Generales</h2>
          <p>{historia.observaciones_generales}</p>
        </div>
      )}

      {historia.comentarios_medico && (
        <div className="section">
          <h2>Comentarios del Médico</h2>
          <p>{historia.comentarios_medico}</p>
        </div>
      )}

      <div style={{marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e5e7eb'}}>
        <p style={{fontSize: '11px', color: '#64748b'}}>
          <strong>Última actualización:</strong> {formatFecha(historia.actualizado_en || historia.creado_en)}
        </p>
      </div>
    </div>
  )
}