// src/types/pagos.ts
export interface Pago {
  id: string;
  tratamiento_id: string;
  fecha_pago: string;
  monto: number;
  metodo_pago: string;
  referencia: string | null;
  observaciones: string | null;
  registrado_por: string;
  creado_en: string;
}
