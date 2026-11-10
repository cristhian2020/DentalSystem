// src/types/tratamientos.ts
export interface TratamientoRealizado {
  id: string;
  historia_id: string;
  fecha_tratamiento: string;
  descripcion: string;
  precio: number | string;
  estado_pago: 'pendiente' | 'pagado' | 'parcial';
  realizado_por: string;
  creado_en: string;
  actualizado_en: string;
}
