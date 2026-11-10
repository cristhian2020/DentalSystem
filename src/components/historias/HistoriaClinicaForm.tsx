// src/components/historias/HistoriaClinicaForm.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Save, AlertCircle } from 'lucide-react'

interface HistoriaClinicaFormProps {
  onSubmit: (data: any) => void
  loading: boolean
  error?: string
  initialData?: any
}

export default function HistoriaClinicaForm({ onSubmit, loading, error, initialData }: HistoriaClinicaFormProps) {
  const [formData, setFormData] = useState({
    // Datos personales
    nombre: initialData?.nombre || '',
    apellido: initialData?.apellido || '',
    edad: initialData?.edad || '',
    sexo: initialData?.sexo || '',
    fechaNacimiento: initialData?.fecha_nacimiento || '',
    lugarNacimiento: initialData?.lugar_nacimiento || '',
    religion: initialData?.religion || '',
    celular: initialData?.celular || '',
    direccion: initialData?.direccion || '',

    // Antecedentes personales
    tratamientoMedico: initialData?.tratamiento_medico ? 'si' : 'no',
    tratamientoMedicoDetalle: initialData?.tratamiento_medico_detalle || '',
    
    medicamentosActuales: initialData?.medicamentos_actuales ? 'si' : 'no',
    medicamentosActualesDetalle: initialData?.medicamentos_actuales_detalle || '',
    
    enfermedadCorazon: initialData?.enfermedad_corazon ? 'si' : 'no',
    enfermedadCorazonDetalle: initialData?.enfermedad_corazon_detalle || '',
    
    alergias: initialData?.alergias ? 'si' : 'no',
    alergiasDetalle: initialData?.alergias_detalle || '',
    
    hemorragiasExtraccion: initialData?.hemorragias_extraccion ? 'si' : 'no',
    hemorragiasExtraccionDetalle: initialData?.hemorragias_extraccion_detalle || '',

    // Comentarios médico
    comentariosMedico: initialData?.comentarios_medico || '',

    // Hábitos de higiene
    usaCepillo: initialData?.usa_cepillo ? 'si' : 'no',
    usaDentifrico: initialData?.usa_dentifrico ? 'si' : 'no',
    vecesCepilladoDia: initialData?.veces_cepillado_dia || '2',
    tecnicaCepillado: initialData?.tecnica_cepillado || '',
    usaHiloDental: initialData?.usa_hilo_dental ? 'si' : 'no',

    // Observaciones
    observacionesGenerales: initialData?.observaciones_generales || '',
  })

  const handleChange = (field: string, value: any) => {
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)
    // Llamar a onSubmit automáticamente cuando los datos cambien (para persistencia)
    onSubmit(newFormData)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  // Validar campos obligatorios
  const isValid = formData.nombre.trim() && 
                  formData.apellido.trim() && 
                  formData.edad.trim() && 
                  formData.sexo

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* SECCIÓN 1: DATOS PERSONALES */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
          1. Datos Personales
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              placeholder="Ej: Juan"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apellido">
              Apellido <span className="text-red-500">*</span>
            </Label>
            <Input
              id="apellido"
              value={formData.apellido}
              onChange={(e) => handleChange('apellido', e.target.value)}
              placeholder="Ej: Pérez"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edad">
              Edad <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edad"
              type="number"
              min="0"
              max="120"
              value={formData.edad}
              onChange={(e) => handleChange('edad', e.target.value)}
              placeholder="Ej: 35"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sexo">
              Sexo <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.sexo}
              onValueChange={(value) => handleChange('sexo', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Masculino">Masculino</SelectItem>
                <SelectItem value="Femenino">Femenino</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
            <Input
              id="fechaNacimiento"
              type="date"
              value={formData.fechaNacimiento}
              onChange={(e) => handleChange('fechaNacimiento', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lugarNacimiento">Lugar de Nacimiento</Label>
            <Input
              id="lugarNacimiento"
              value={formData.lugarNacimiento}
              onChange={(e) => handleChange('lugarNacimiento', e.target.value)}
              placeholder="Ej: Cochabamba, Bolivia"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="religion">Religión</Label>
            <Input
              id="religion"
              value={formData.religion}
              onChange={(e) => handleChange('religion', e.target.value)}
              placeholder="Ej: Católica"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="celular">Celular</Label>
            <Input
              id="celular"
              value={formData.celular}
              onChange={(e) => handleChange('celular', e.target.value)}
              placeholder="Ej: 00000000"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Textarea
              id="direccion"
              value={formData.direccion}
              onChange={(e:any) => handleChange('direccion', e.target.value)}
              placeholder="Ej: Av. Principal 123, Cochabamba"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: ANTECEDENTES PERSONALES */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
          2. Antecedentes Personales
        </h2>

        <div className="space-y-6">
          {/* Pregunta 1 */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Label className="font-medium">
                  ¿Está en tratamiento médico actualmente?
                </Label>
                <RadioGroup
                  value={formData.tratamientoMedico}
                  onValueChange={(value) => handleChange('tratamientoMedico', value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="tratamiento-si" />
                    <Label htmlFor="tratamiento-si">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="tratamiento-no" />
                    <Label htmlFor="tratamiento-no">No</Label>
                  </div>
                </RadioGroup>
                
                {formData.tratamientoMedico === 'si' && (
                  <div className="mt-3">
                    <Label htmlFor="tratamientoDetalle">
                      Especifique el tratamiento:
                    </Label>
                    <Textarea
                      id="tratamientoDetalle"
                      value={formData.tratamientoMedicoDetalle}
                      onChange={(e:any) => handleChange('tratamientoMedicoDetalle', e.target.value)}
                      placeholder="Describa el tratamiento médico..."
                      rows={2}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pregunta 2 */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Label className="font-medium">
                  ¿Toma medicamentos actualmente?
                </Label>
                <RadioGroup
                  value={formData.medicamentosActuales}
                  onValueChange={(value) => handleChange('medicamentosActuales', value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="medicamentos-si" />
                    <Label htmlFor="medicamentos-si">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="medicamentos-no" />
                    <Label htmlFor="medicamentos-no">No</Label>
                  </div>
                </RadioGroup>
                
                {formData.medicamentosActuales === 'si' && (
                  <div className="mt-3">
                    <Label htmlFor="medicamentosDetalle">
                      Especifique los medicamentos:
                    </Label>
                    <Textarea
                      id="medicamentosDetalle"
                      value={formData.medicamentosActualesDetalle}
                      onChange={(e:any) => handleChange('medicamentosActualesDetalle', e.target.value)}
                      placeholder="Describa los medicamentos..."
                      rows={2}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pregunta 3 */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Label className="font-medium">
                  ¿Padece de alguna enfermedad del corazón?
                </Label>
                <RadioGroup
                  value={formData.enfermedadCorazon}
                  onValueChange={(value) => handleChange('enfermedadCorazon', value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="corazon-si" />
                    <Label htmlFor="corazon-si">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="corazon-no" />
                    <Label htmlFor="corazon-no">No</Label>
                  </div>
                </RadioGroup>
                
                {formData.enfermedadCorazon === 'si' && (
                  <div className="mt-3">
                    <Label htmlFor="corazonDetalle">
                      Especifique la enfermedad:
                    </Label>
                    <Textarea
                      id="corazonDetalle"
                      value={formData.enfermedadCorazonDetalle}
                      onChange={(e) => handleChange('enfermedadCorazonDetalle', e.target.value)}
                      placeholder="Describa la enfermedad cardíaca..."
                      rows={2}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pregunta 4 */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Label className="font-medium">
                  ¿Padece de alguna alergia?
                </Label>
                <RadioGroup
                  value={formData.alergias}
                  onValueChange={(value) => handleChange('alergias', value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="alergias-si" />
                    <Label htmlFor="alergias-si">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="alergias-no" />
                    <Label htmlFor="alergias-no">No</Label>
                  </div>
                </RadioGroup>
                
                {formData.alergias === 'si' && (
                  <div className="mt-3">
                    <Label htmlFor="alergiasDetalle">
                      Especifique las alergias:
                    </Label>
                    <Textarea
                      id="alergiasDetalle"
                      value={formData.alergiasDetalle}
                      onChange={(e) => handleChange('alergiasDetalle', e.target.value)}
                      placeholder="Describa las alergias (medicamentos, alimentos, etc)..."
                      rows={2}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pregunta 5 */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Label className="font-medium">
                  ¿Tiene hemorragias anormales después de extracciones?
                </Label>
                <RadioGroup
                  value={formData.hemorragiasExtraccion}
                  onValueChange={(value) => handleChange('hemorragiasExtraccion', value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="hemorragias-si" />
                    <Label htmlFor="hemorragias-si">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="hemorragias-no" />
                    <Label htmlFor="hemorragias-no">No</Label>
                  </div>
                </RadioGroup>
                
                {formData.hemorragiasExtraccion === 'si' && (
                  <div className="mt-3">
                    <Label htmlFor="hemorragiasDetalle">
                      Describa el tipo de hemorragia:
                    </Label>
                    <Textarea
                      id="hemorragiasDetalle"
                      value={formData.hemorragiasExtraccionDetalle}
                      onChange={(e) => handleChange('hemorragiasExtraccionDetalle', e.target.value)}
                      placeholder="Describa las hemorragias..."
                      rows={2}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comentarios del médico */}
        <div className="space-y-2">
          <Label htmlFor="comentariosMedico" className="font-medium">
            Comentarios adicionales del médico:
          </Label>
          <Textarea
            id="comentariosMedico"
            value={formData.comentariosMedico}
            onChange={(e) => handleChange('comentariosMedico', e.target.value)}
            placeholder="Observaciones, recomendaciones, notas importantes..."
            rows={3}
          />
        </div>
      </div>

      {/* SECCIÓN 3: HÁBITOS DE HIGIENE BUCAL */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
          3. Hábitos de Higiene Bucal
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pregunta 1 */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Label className="font-medium">
                  ¿Usa cepillo dental?
                </Label>
                <RadioGroup
                  value={formData.usaCepillo}
                  onValueChange={(value) => handleChange('usaCepillo', value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="cepillo-si" />
                    <Label htmlFor="cepillo-si">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="cepillo-no" />
                    <Label htmlFor="cepillo-no">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Pregunta 2 */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Label className="font-medium">
                  ¿Usa dentífrico?
                </Label>
                <RadioGroup
                  value={formData.usaDentifrico}
                  onValueChange={(value) => handleChange('usaDentifrico', value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="dentifrico-si" />
                    <Label htmlFor="dentifrico-si">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="dentifrico-no" />
                    <Label htmlFor="dentifrico-no">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Pregunta 3 - Veces al día */}
          <div className="space-y-2">
            <Label htmlFor="vecesCepilladoDia" className="font-medium">
              ¿Cuántas veces al día se cepilla?
            </Label>
            <Select
              value={formData.vecesCepilladoDia}
              onValueChange={(value) => handleChange('vecesCepilladoDia', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar frecuencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 - Nunca</SelectItem>
                <SelectItem value="1">1 vez al día</SelectItem>
                <SelectItem value="2">2 veces al día</SelectItem>
                <SelectItem value="3">3 veces al día</SelectItem>
                <SelectItem value="4">Más de 3 veces</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pregunta 4 - Técnica */}
          <div className="space-y-2">
            <Label htmlFor="tecnicaCepillado" className="font-medium">
              Técnica de cepillado que usa
            </Label>
            <Input
              id="tecnicaCepillado"
              value={formData.tecnicaCepillado}
              onChange={(e) => handleChange('tecnicaCepillado', e.target.value)}
              placeholder="Ej: Circular, horizontal, etc."
            />
          </div>

          {/* Pregunta 5 */}
          <Card className="md:col-span-2">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Label className="font-medium">
                  ¿Usa hilo dental?
                </Label>
                <RadioGroup
                  value={formData.usaHiloDental}
                  onValueChange={(value) => handleChange('usaHiloDental', value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="si" id="hilo-si" />
                    <Label htmlFor="hilo-si">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="hilo-no" />
                    <Label htmlFor="hilo-no">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SECCIÓN 4: OBSERVACIONES GENERALES */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
          4. Observaciones Generales
        </h2>

        <div className="space-y-2">
          <Label htmlFor="observacionesGenerales">
            Observaciones y notas adicionales:
          </Label>
          <Textarea
            id="observacionesGenerales"
            value={formData.observacionesGenerales}
            onChange={(e) => handleChange('observacionesGenerales', e.target.value)}
            placeholder="Cualquier otra observación relevante sobre el paciente..."
            rows={4}
          />
        </div>
      </div>

      {/* Validación */}
      {!isValid && (
        <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Por favor, completa los campos obligatorios: Nombre, Apellido, Edad y Sexo.
          </AlertDescription>
        </Alert>
      )}
    </form>
  )
}