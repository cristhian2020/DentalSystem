// src/app/dashboard/historias/nueva/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createHistoriaCompleta } from "@/actions/historias";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  UserPlus,
  AlertCircle,
  Trash2,
  Plus,
  Loader2,
  DollarSign,
  User,
  FileText,
  Calendar,
  Heart,
  Phone,
  MapPin,
  Edit,
  Printer,
} from "lucide-react";

import HistoriaClinicaForm from "@/components/historias/HistoriaClinicaForm";
import Icon from "@mdi/react";
import { mdiTooth } from "@mdi/js";

export default function NuevaHistoriaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [historiaFormData, setHistoriaFormData] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Estados para Odontograma
  const [odontogramas, setOdontogramas] = useState<
    { pieza_numero: string; descripcion: string }[]
  >([]);
  const [odontogramaForm, setOdontogramaForm] = useState({
    pieza_numero: "",
    descripcion: "",
  });

  // Estados para Tratamientos
  const [tratamientos, setTratamientos] = useState<
    { fecha_tratamiento: string; descripcion: string; precio: string }[]
  >([]);
  const [tratamientoForm, setTratamientoForm] = useState({
    fecha_tratamiento: "",
    descripcion: "",
    precio: "",
  });

  // Estados para Pagos
  const [pagos, setPagos] = useState<
    {
      fecha_pago: string;
      monto: string;
      metodo_pago: string;
      referencia: string;
    }[]
  >([]);
  const [pagoForm, setPagoForm] = useState({
    fecha_pago: "",
    monto: "",
    metodo_pago: "",
    referencia: "",
  });

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Manejar agregar odontograma
  const handleAgregarOdontograma = () => {
    if (!odontogramaForm.pieza_numero || !odontogramaForm.descripcion) {
      setError("Por favor completa ambos campos del odontograma");
      return;
    }
    const piezaNum = parseInt(odontogramaForm.pieza_numero);
    if (piezaNum < 11 || piezaNum > 85) {
      setError("El número de pieza debe estar entre 11 y 85");
      return;
    }
    setOdontogramas([...odontogramas, { ...odontogramaForm }]);
    setOdontogramaForm({ pieza_numero: "", descripcion: "" });
    setError("");
  };

  const handleEliminarOdontograma = (index: number) => {
    setOdontogramas(odontogramas.filter((_, i) => i !== index));
  };

  // Manejar agregar tratamiento
  const handleAgregarTratamiento = () => {
    if (
      !tratamientoForm.fecha_tratamiento ||
      !tratamientoForm.descripcion ||
      !tratamientoForm.precio
    ) {
      setError("Por favor completa todos los campos del tratamiento");
      return;
    }
    const precio = parseFloat(tratamientoForm.precio);
    if (isNaN(precio) || precio < 0) {
      setError("El precio debe ser un número válido");
      return;
    }
    setTratamientos([...tratamientos, { ...tratamientoForm }]);
    setTratamientoForm({ fecha_tratamiento: "", descripcion: "", precio: "" });
    setError("");
  };

  const handleEliminarTratamiento = (index: number) => {
    setTratamientos(tratamientos.filter((_, i) => i !== index));
  };

  // Manejar agregar pago
  const handleAgregarPago = () => {
    if (!pagoForm.fecha_pago || !pagoForm.monto || !pagoForm.metodo_pago) {
      setError("Por favor completa los campos obligatorios del pago");
      return;
    }
    const monto = parseFloat(pagoForm.monto);
    if (isNaN(monto) || monto <= 0) {
      setError("El monto debe ser un número positivo");
      return;
    }
    setPagos([...pagos, { ...pagoForm }]);
    setPagoForm({ fecha_pago: "", monto: "", metodo_pago: "", referencia: "" });
    setError("");
  };

  const handleEliminarPago = (index: number) => {
    setPagos(pagos.filter((_, i) => i !== index));
  };

  const handleHistoriaFormSubmit = (formData: any) => {
    setHistoriaFormData(formData);
    setError("");
  };

  const handleSubmit = async (formData: any) => {
    if (!formData.nombre || !formData.apellido) {
      setError("Por favor completa al menos el nombre y apellido del paciente");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await createHistoriaCompleta({
        paciente: {
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          edad: parseInt(formData.edad) || null,
          sexo: formData.sexo,
          fecha_nacimiento: formData.fechaNacimiento || null,
          lugar_nacimiento: formData.lugarNacimiento?.trim() || null,
          religion: formData.religion?.trim() || null,
          celular: formData.celular?.trim() || null,
          direccion: formData.direccion?.trim() || null,

          tratamiento_medico: formData.tratamientoMedico === "si",
          tratamiento_medico_detalle:
            formData.tratamientoMedico === "si"
              ? formData.tratamientoMedicoDetalle?.trim()
              : null,

          medicamentos_actuales: formData.medicamentosActuales === "si",
          medicamentos_actuales_detalle:
            formData.medicamentosActuales === "si"
              ? formData.medicamentosActualesDetalle?.trim()
              : null,

          enfermedad_corazon: formData.enfermedadCorazon === "si",
          enfermedad_corazon_detalle:
            formData.enfermedadCorazon === "si"
              ? formData.enfermedadCorazonDetalle?.trim()
              : null,

          alergias: formData.alergias === "si",
          alergias_detalle:
            formData.alergias === "si" ? formData.alergiasDetalle?.trim() : null,

          hemorragias_extraccion: formData.hemorragiasExtraccion === "si",
          hemorragias_extraccion_detalle:
            formData.hemorragiasExtraccion === "si"
              ? formData.hemorragiasExtraccionDetalle?.trim()
              : null,

          comentarios_medico: formData.comentariosMedico?.trim() || null,

          usa_cepillo: formData.usaCepillo === "si",
          usa_dentifrico: formData.usaDentifrico === "si",
          veces_cepillado_dia: parseInt(formData.vecesCepilladoDia) || 0,
          tecnica_cepillado: formData.tecnicaCepillado?.trim() || null,
          usa_hilo_dental: formData.usaHiloDental === "si",

          observaciones_generales:
            formData.observacionesGenerales?.trim() || null,
        },
        odontogramas: odontogramas.map((o) => ({
          pieza_numero: String(o.pieza_numero),
          descripcion: o.descripcion,
        })),
        tratamientos:
          tratamientos.length > 0
            ? tratamientos.map((t) => ({
                fecha_tratamiento: t.fecha_tratamiento,
                descripcion: t.descripcion,
                precio: Number(t.precio),
              }))
            : pagos.length > 0
            ? [
                {
                  fecha_tratamiento: pagos[0].fecha_pago,
                  descripcion: "Tratamiento general",
                  precio: pagos.reduce((sum, p) => sum + Number(p.monto), 0),
                },
              ]
            : [],
        pagos: pagos.map((p) => ({
          fecha_pago: p.fecha_pago,
          monto: Number(p.monto),
          metodo_pago: p.metodo_pago,
          referencia: p.referencia || undefined,
        })),
      });

      if (!res.success) {
        throw new Error(res.error || "Error al guardar la historia clínica");
      }

      router.push(`/dashboard/historias/${res.data?.id}`);
      router.refresh();
    } catch (err: any) {
      console.error("Error completo:", err);
      setError(err.message || "Error al guardar la historia clínica");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/historias")}
            className="mb-2 sm:mb-4 px-2 sm:px-4"
            size={isMobile ? "sm" : "default"}
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Volver</span>
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Nueva Historia Clínica
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Registra los datos médicos dentales del paciente
              </p>
            </div>
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Errores */}
        {error && (
          <Alert variant="destructive" className="mb-3 sm:mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs sm:text-sm">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Card className="shadow-sm">
          <CardHeader className="border-b px-3 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-base sm:text-lg font-semibold">
              Registro Completo del Paciente
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <Tabs defaultValue="datos" className="w-full">
              <div className="overflow-x-auto pb-2 -mx-1">
                <TabsList className="flex w-max sm:w-full sm:grid sm:grid-cols-4 gap-1 sm:gap-2 px-1">
                  <TabsTrigger
                    value="datos"
                    className="text-xs px-2 py-1.5 sm:px-3 sm:py-2 min-w-[50px] sm:min-w-0 flex flex-col sm:flex-row items-center justify-center gap-1"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Información</span>
                    <span className="sm:hidden text-[10px]">Información</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="odontograma"
                    className="text-xs px-2 py-1.5 sm:px-3 sm:py-2 min-w-[50px] sm:min-w-0 flex flex-col sm:flex-row items-center justify-center gap-1"
                  >
                    <Icon path={mdiTooth} className="h-4 w-4" />
                    <span className="hidden sm:inline">Odontograma</span>
                    <span className="sm:hidden text-[10px]">Odontograma</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="tratamientos"
                    className="text-xs px-2 py-1.5 sm:px-3 sm:py-2 min-w-[50px] sm:min-w-0 flex flex-col sm:flex-row items-center justify-center gap-1"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Tratamientos</span>
                    <span className="sm:hidden text-[10px]">Tratamientos</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="pagos"
                    className="text-xs px-2 py-1.5 sm:px-3 sm:py-2 min-w-[50px] sm:min-w-0 flex flex-col sm:flex-row items-center justify-center gap-1"
                  >
                    <DollarSign className="h-4 w-4" />
                    <span className="hidden sm:inline">Pagos</span>
                    <span className="sm:hidden text-[10px]">Pagos</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab 1: Datos Personales */}
              <TabsContent value="datos" className="mt-4">
                <HistoriaClinicaForm
                  onSubmit={handleHistoriaFormSubmit}
                  loading={loading}
                  error={error}
                  initialData={historiaFormData}
                />
              </TabsContent>

              {/* Tab 2: Odontograma */}
              <TabsContent value="odontograma" className="space-y-4 mt-4">
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <p className="text-xs sm:text-sm text-blue-900">
                    📝 Agrega registros de piezas dentales. Se guardarán al
                    crear la historia.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 flex flex-col sm:flex-row gap-2">
                    <Input
                      type="number"
                      placeholder="Nº(11-85)"
                      value={odontogramaForm.pieza_numero}
                      onChange={(e) =>
                        setOdontogramaForm((f) => ({
                          ...f,
                          pieza_numero: e.target.value,
                        }))
                      }
                      min="11"
                      max="85"
                      className="w-full sm:w-28"
                    />
                    <Input
                      type="text"
                      placeholder="Descripción del trabajo"
                      value={odontogramaForm.descripcion}
                      onChange={(e) =>
                        setOdontogramaForm((f) => ({
                          ...f,
                          descripcion: e.target.value,
                        }))
                      }
                      className="flex-1"
                    />
                  </div>
                  <Button
                    onClick={handleAgregarOdontograma}
                    variant="outline"
                    className="w-full sm:w-auto"
                    size={isMobile ? "sm" : "default"}
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Agregar
                  </Button>
                </div>

                {odontogramas.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold mb-2">
                      Piezas dentales registradas:
                    </h3>
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="w-full text-xs sm:text-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-2 border text-center min-w-[60px]">
                              Pieza
                            </th>
                            <th className="p-2 border min-w-[120px]">
                              Descripción
                            </th>
                            <th className="p-2 border text-center min-w-[60px]">
                              Acción
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {odontogramas.map((odon, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="p-2 border text-center font-semibold">
                                {odon.pieza_numero}
                              </td>
                              <td className="p-2 border">{odon.descripcion}</td>
                              <td className="p-2 border text-center">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleEliminarOdontograma(idx)}
                                  className="h-7 w-7"
                                >
                                  <Trash2 className="h-3 w-3 text-white" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Tab 3: Tratamientos */}
              <TabsContent value="tratamientos" className="space-y-4 mt-4">
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <p className="text-xs sm:text-sm text-blue-900">
                    💼 Agrega tratamientos realizados. Se guardarán al crear la
                    historia.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 flex-1">
                      <Input
                        type="date"
                        value={tratamientoForm.fecha_tratamiento}
                        onChange={(e) =>
                          setTratamientoForm((f) => ({
                            ...f,
                            fecha_tratamiento: e.target.value,
                          }))
                        }
                        className="w-full sm:w-32"
                      />
                      <Input
                        type="text"
                        placeholder="Descripción"
                        value={tratamientoForm.descripcion}
                        onChange={(e) =>
                          setTratamientoForm((f) => ({
                            ...f,
                            descripcion: e.target.value,
                          }))
                        }
                        className="col-span-2 sm:flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Precio Bs/"
                        value={tratamientoForm.precio}
                        onChange={(e) =>
                          setTratamientoForm((f) => ({
                            ...f,
                            precio: e.target.value,
                          }))
                        }
                        className="w-full sm:w-32"
                        step="0.01"
                      />
                    </div>
                    <Button
                      onClick={handleAgregarTratamiento}
                      variant="outline"
                      className="w-full sm:w-auto"
                      size={isMobile ? "sm" : "default"}
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="ml-1 sm:ml-2">Agregar</span>
                    </Button>
                  </div>
                </div>

                {tratamientos.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold mb-2">
                      Tratamientos registrados:
                    </h3>
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="w-full text-xs sm:text-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-2 border text-center min-w-[80px]">
                              Fecha
                            </th>
                            <th className="p-2 border min-w-[150px]">
                              Descripción
                            </th>
                            <th className="p-2 border text-right min-w-[80px]">
                              Precio
                            </th>
                            <th className="p-2 border text-center min-w-[60px]">
                              Acción
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {tratamientos.map((trat, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="p-2 border text-center">
                                {trat.fecha_tratamiento}
                              </td>
                              <td className="p-2 border">{trat.descripcion}</td>
                              <td className="p-2 border text-right font-medium">
                                Bs/ {Number(trat.precio).toFixed(2)}
                              </td>
                              <td className="p-2 border text-center">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleEliminarTratamiento(idx)}
                                  className="h-7 w-7"
                                >
                                  <Trash2 className="h-3 w-3 text-white" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Tab 4: Pagos */}
              <TabsContent value="pagos" className="space-y-4 mt-4">
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <p className="text-xs sm:text-sm text-blue-900">
                    💰 Registra pagos. Se asociarán a tratamientos al crear la
                    historia.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row flex-1">
                      <Input
                        type="date"
                        value={pagoForm.fecha_pago}
                        onChange={(e) =>
                          setPagoForm((f) => ({
                            ...f,
                            fecha_pago: e.target.value,
                          }))
                        }
                        className="w-full sm:w-32"
                      />
                      <Input
                        type="number"
                        placeholder="Monto Bs/"
                        value={pagoForm.monto}
                        onChange={(e) =>
                          setPagoForm((f) => ({ ...f, monto: e.target.value }))
                        }
                        className="w-full sm:w-32"
                        step="0.01"
                      />
                      <Select
                        value={pagoForm.metodo_pago}
                        onValueChange={(v) =>
                          setPagoForm((f) => ({ ...f, metodo_pago: v }))
                        }
                      >
                        <SelectTrigger className="w-full sm:w-36">
                          <SelectValue placeholder="Método" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="efectivo">Efectivo</SelectItem>
                          <SelectItem value="qr">QR</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                      {!isMobile && (
                        <Input
                          type="text"
                          placeholder="Referencia"
                          value={pagoForm.referencia}
                          onChange={(e) =>
                            setPagoForm((f) => ({
                              ...f,
                              referencia: e.target.value,
                            }))
                          }
                          className="flex-1"
                        />
                      )}
                    </div>
                    <Button
                      onClick={handleAgregarPago}
                      variant="outline"
                      className="w-full sm:w-auto"
                      size={isMobile ? "sm" : "default"}
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="ml-1 sm:ml-2">Agregar</span>
                    </Button>
                  </div>

                  {/* Campo de referencia para móvil */}
                  {isMobile && (
                    <Input
                      type="text"
                      placeholder="Referencia (opcional)"
                      value={pagoForm.referencia}
                      onChange={(e) =>
                        setPagoForm((f) => ({
                          ...f,
                          referencia: e.target.value,
                        }))
                      }
                    />
                  )}
                </div>

                {pagos.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold mb-2">
                      Pagos registrados:
                    </h3>
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="w-full text-xs sm:text-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-2 border text-center min-w-[80px]">
                              Fecha
                            </th>
                            <th className="p-2 border text-right min-w-[80px]">
                              Monto
                            </th>
                            <th className="p-2 border min-w-[100px]">Método</th>
                            {!isMobile && (
                              <th className="p-2 border min-w-[120px]">
                                Referencia
                              </th>
                            )}
                            <th className="p-2 border text-center min-w-[60px]">
                              Acción
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {pagos.map((pago, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="p-2 border text-center">
                                {pago.fecha_pago}
                              </td>
                              <td className="p-2 border text-right font-medium">
                                Bs/ {Number(pago.monto).toFixed(2)}
                              </td>
                              <td className="p-2 border">{pago.metodo_pago}</td>
                              {!isMobile && (
                                <td className="p-2 border">
                                  {pago.referencia || "-"}
                                </td>
                              )}
                              <td className="p-2 border text-center">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleEliminarPago(idx)}
                                  className="h-7 w-7"
                                >
                                  <Trash2 className="h-3 w-3 text-white" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row gap-2 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/historias")}
                disabled={loading}
                className="w-full sm:w-auto order-2 sm:order-1"
                size={isMobile ? "sm" : "default"}
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (!historiaFormData) {
                    setError("Por favor completa los datos personales primero");
                    return;
                  }
                  handleSubmit(historiaFormData);
                }}
                disabled={loading}
                className="w-full sm:ml-auto bg-blue-600 hover:bg-blue-700 order-1 sm:order-2"
                size={isMobile ? "sm" : "default"}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                    <span className="text-xs sm:text-sm">Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">Guardar Historia</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Información importante */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mt-4 sm:mt-6">
          <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">
            💡 Información importante
          </h3>
          <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
            <li>• Completa primero los datos personales (obligatorio)</li>
            <li>
              • Puedes agregar opcionalmente odontogramas, tratamientos y pagos
            </li>
            <li>
              • También puedes agregar estos datos después desde la vista de
              detalles
            </li>
            <li>• La información se guardará de forma segura y confidencial</li>
          </ul>
        </div>
      </div>
  );
}
