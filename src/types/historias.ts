// src/types/historias.ts
export interface HistoriaClinica {
  id: string
  numero_historia?: string | null
  nombre: string
  apellido: string
  edad?: number | null
  sexo?: 'Masculino' | 'Femenino' | 'Otro' | string | null
  fecha_nacimiento?: string | null
  lugar_nacimiento?: string | null
  religion?: string | null
  celular?: string | null
  direccion?: string | null
  
  // Antecedentes
  tratamiento_medico?: boolean | null
  tratamiento_medico_detalle?: string | null
  medicamentos_actuales?: boolean | null
  medicamentos_actuales_detalle?: string | null
  enfermedad_corazon?: boolean | null
  enfermedad_corazon_detalle?: string | null
  alergias?: boolean | null
  alergias_detalle?: string | null
  hemorragias_extraccion?: boolean | null
  hemorragias_extraccion_detalle?: string | null
  
  // Comentarios
  comentarios_medico?: string | null
  
  // Hábitos
  usa_cepillo?: boolean | null
  usa_dentifrico?: boolean | null
  veces_cepillado_dia?: number | null
  tecnica_cepillado?: string | null
  usa_hilo_dental?: boolean | null
  
  // Observaciones
  observaciones_generales?: string | null
  
  // Metadata
  doctor_id?: string | null
  creado_por?: string | null
  estado?: string | null
  creado_en?: string | null
  actualizado_en?: string | null

  // Relaciones opcionales
  doctor?: any
  creador?: any
  odontogramas?: any[]
  tratamientos?: any[]
  _count?: {
    tratamientos?: number
    odontogramas?: number
  }
}
