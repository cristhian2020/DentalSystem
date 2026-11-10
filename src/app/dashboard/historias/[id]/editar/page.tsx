// src/app/dashboard/historias/[id]/editar/page.tsx - VERSIÓN RESPONSIVE
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getHistoriaById, updateHistoria } from "@/actions/historias";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  User,
  FileText,
  Calendar,
  Heart,
  Phone,
  MapPin,
  Save,
  X,
  AlertCircle,
  DollarSign,
  Loader2,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import type { HistoriaClinica } from "@/types/historias";
import Odontograma from "@/components/odontograma/Odontograma";
import Tratamientos from "@/components/tratamientos/Tratamientos";
import Icon from '@mdi/react';
import { mdiTooth } from '@mdi/js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function EditarHistoriaPage() {
  const router = useRouter();
  const params = useParams();
  const historiaId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [historia, setHistoria] = useState<HistoriaClinica | null>(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<Partial<HistoriaClinica>>({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await getHistoriaById(historiaId);
        if (!res.success || !res.data) {
          throw new Error(res.error || "Historia clínica no encontrada");
        }

        setHistoria(res.data);
        setFormData(res.data);
      } catch (err: any) {
        console.error("Error:", err);
        setError(err.message || "Error al cargar la historia clínica");
        toast.error("Error al cargar la historia clínica");
      } finally {
        setLoading(false);
      }
    };

    if (historiaId) {
      fetchData();
    }
  }, [historiaId, router]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBooleanChange = (field: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Si se desactiva un booleano, limpiar su detalle
    if (!value) {
      const detailField = `${field}_detalle`;
      setFormData((prev) => ({
        ...prev,
        [detailField]: "",
      }));
    }
  };

  const validateForm = () => {
    if (!formData.nombre?.trim()) {
      toast.error("El nombre es obligatorio");
      return false;
    }
    if (!formData.apellido?.trim()) {
      toast.error("El apellido es obligatorio");
      return false;
    }
    if (!formData.edad || formData.edad < 0 || formData.edad > 120) {
      toast.error("La edad debe ser entre 0 y 120 años");
      return false;
    }
    if (!formData.sexo) {
      toast.error("El sexo es obligatorio");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      // Preparar datos - asegurar que sexo sea string o null
      const sexoValue = formData.sexo?.toString().trim() || null;

      const datosActualizar = {
        ...formData,
        edad: Number(formData.edad) || 0,
        sexo: sexoValue,
        veces_cepillado_dia: Number(formData.veces_cepillado_dia) || 2,
        tratamiento_medico: Boolean(formData.tratamiento_medico),
        medicamentos_actuales: Boolean(formData.medicamentos_actuales),
        enfermedad_corazon: Boolean(formData.enfermedad_corazon),
        alergias: Boolean(formData.alergias),
        hemorragias_extraccion: Boolean(formData.hemorragias_extraccion),
        usa_cepillo: Boolean(formData.usa_cepillo),
        usa_dentifrico: Boolean(formData.usa_dentifrico),
        usa_hilo_dental: Boolean(formData.usa_hilo_dental),
        actualizado_en: new Date().toISOString(),
      };

      const res = await updateHistoria(historiaId, datosActualizar);

      if (!res.success) {
        throw new Error(res.error || "Error al actualizar");
      }

      toast.success("Historia clínica actualizada exitosamente");

      setTimeout(() => {
        router.push(`/dashboard/historias/${historiaId}`);
        router.refresh();
      }, 1000);
    } catch (err: any) {
      console.error("Error completo en catch:", err);
      toast.error(`Error: ${err.message || JSON.stringify(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres cancelar? Los cambios no guardados se perderán."
      )
    ) {
      router.push(`/dashboard/historias/${historiaId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando historia clínica...</p>
        </div>
      </div>
    );
  }

  if (error || !historia) {
    return (
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/historias")}
          className="mb-4 sm:mb-6 px-2 sm:px-4"
          size={isMobile ? "sm" : "default"}
        >
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="text-xs sm:text-sm">Volver a historias</span>
        </Button>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
            <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-red-600 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-red-800 mb-1 sm:mb-2">
              Historia clínica no encontrada
            </h3>
            <p className="text-xs sm:text-sm text-red-600 mb-4 sm:mb-6">
              {error ||
                "La historia clínica solicitada no existe o no tienes acceso."}
            </p>
            <Button
              onClick={() => router.push("/dashboard/historias")}
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="text-xs sm:text-sm"
            >
              Ver todas las historias
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/dashboard/historias/${historiaId}`)}
            className="mb-3 sm:mb-4 px-2 sm:px-4"
            size={isMobile ? "sm" : "default"}
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Volver al detalle</span>
          </Button>

          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Editar Historia Clínica
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {historia.nombre} {historia.apellido} • Nº{" "}
                  {historia.numero_historia}
                </p>
              </div>

              {/* Botones de acción */}
              {isMobile ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem 
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancelar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleSubmit}
                      disabled={saving}
                      className="flex items-center gap-2 text-blue-600"
                    >
                      <Save className="h-4 w-4" />
                      <span>Guardar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={saving}
                    size={isMobile ? "sm" : "default"}
                  >
                    <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    <span className="text-xs sm:text-sm">Cancelar</span>
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700"
                    size={isMobile ? "sm" : "default"}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 animate-spin" />
                        <span className="text-xs sm:text-sm">Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        <span className="text-xs sm:text-sm">Guardar Cambios</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="informacion" className="mb-6 sm:mb-8">
            <div className="overflow-x-auto pb-2">
              <TabsList className="inline-flex w-max min-w-full sm:w-full grid-cols-5 gap-1 sm:gap-2 px-1">
                <TabsTrigger 
                  value="informacion" 
                  className="flex-1 min-w-[70px] text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2 flex flex-col sm:flex-row items-center justify-center gap-1"
                >
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Información</span>
                  <span className="sm:hidden text-[10px] mt-0.5">Información</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="antecedentes" 
                  className="flex-1 min-w-[70px] text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2 flex flex-col sm:flex-row items-center justify-center gap-1"
                >
                  <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Antecedentes</span>
                  <span className="sm:hidden text-[10px] mt-0.5">Antecedentes</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="habitos" 
                  className="flex-1 min-w-[70px] text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2 flex flex-col sm:flex-row items-center justify-center gap-1"
                >
                  <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Hábitos</span>
                  <span className="sm:hidden text-[10px] mt-0.5">Hábitos</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="odontograma" 
                  className="flex-1 min-w-[70px] text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2 flex flex-col sm:flex-row items-center justify-center gap-1"
                >
                  <Icon path={mdiTooth} className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Odontograma</span>
                  <span className="sm:hidden text-[10px] mt-0.5">Odontograma</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="tratamientos" 
                  className="flex-1 min-w-[70px] text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2 flex flex-col sm:flex-row items-center justify-center gap-1"
                >
                  <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Tratamientos</span>
                  <span className="sm:hidden text-[10px] mt-0.5">Tratamientos</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab 1: Información Personal */}
            <TabsContent value="informacion" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Información Básica */}
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      Información Personal
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Datos básicos del paciente
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="nombre" className="text-xs sm:text-sm">
                          Nombre *
                        </Label>
                        <Input
                          id="nombre"
                          value={formData.nombre || ""}
                          onChange={(e) =>
                            handleInputChange("nombre", e.target.value)
                          }
                          required
                          className="text-xs sm:text-sm"
                        />
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="apellido" className="text-xs sm:text-sm">
                          Apellido *
                        </Label>
                        <Input
                          id="apellido"
                          value={formData.apellido || ""}
                          onChange={(e) =>
                            handleInputChange("apellido", e.target.value)
                          }
                          required
                          className="text-xs sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="edad" className="text-xs sm:text-sm">
                          Edad *
                        </Label>
                        <Input
                          id="edad"
                          type="number"
                          min="0"
                          max="120"
                          value={formData.edad || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "edad",
                              parseInt(e.target.value) || 0
                            )
                          }
                          required
                          className="text-xs sm:text-sm"
                        />
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="sexo" className="text-xs sm:text-sm">
                          Sexo *
                        </Label>
                        <Select
                          value={formData.sexo || ""}
                          onValueChange={(value) =>
                            handleInputChange("sexo", value)
                          }
                        >
                          <SelectTrigger className="text-xs sm:text-sm">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Masculino">Masculino</SelectItem>
                            <SelectItem value="Femenino">Femenino</SelectItem>
                            <SelectItem value="Otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="fecha_nacimiento" className="text-xs sm:text-sm">
                        Fecha de Nacimiento
                      </Label>
                      <Input
                        id="fecha_nacimiento"
                        type="date"
                        value={
                          formData.fecha_nacimiento
                            ? formData.fecha_nacimiento.split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          handleInputChange("fecha_nacimiento", e.target.value)
                        }
                        className="text-xs sm:text-sm"
                      />
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="lugar_nacimiento" className="text-xs sm:text-sm">
                        Lugar de Nacimiento
                      </Label>
                      <Input
                        id="lugar_nacimiento"
                        value={formData.lugar_nacimiento || ""}
                        onChange={(e) =>
                          handleInputChange("lugar_nacimiento", e.target.value)
                        }
                        className="text-xs sm:text-sm"
                      />
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="religion" className="text-xs sm:text-sm">
                        Religión
                      </Label>
                      <Input
                        id="religion"
                        value={formData.religion || ""}
                        onChange={(e) =>
                          handleInputChange("religion", e.target.value)
                        }
                        className="text-xs sm:text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Contacto y Estado */}
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      Contacto y Estado
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="celular" className="text-xs sm:text-sm">
                        Celular
                      </Label>
                      <Input
                        id="celular"
                        type="tel"
                        value={formData.celular || ""}
                        onChange={(e) =>
                          handleInputChange("celular", e.target.value)
                        }
                        className="text-xs sm:text-sm"
                      />
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="direccion" className="text-xs sm:text-sm">
                        Dirección
                      </Label>
                      <Textarea
                        id="direccion"
                        value={formData.direccion || ""}
                        onChange={(e) =>
                          handleInputChange("direccion", e.target.value)
                        }
                        rows={isMobile ? 2 : 3}
                        className="text-xs sm:text-sm resize-none"
                      />
                    </div>

                    <Separator />

                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="estado" className="text-xs sm:text-sm">
                        Estado del Paciente
                      </Label>
                      <Select
                        value={formData.estado || "activo"}
                        onValueChange={(value) =>
                          handleInputChange("estado", value)
                        }
                      >
                        <SelectTrigger className="text-xs sm:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="activo">Activo</SelectItem>
                          <SelectItem value="inactivo">Inactivo</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="p-2.5 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs sm:text-sm text-blue-700 flex items-start gap-1.5 sm:gap-2">
                        <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
                        Los campos marcados con * son obligatorios
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab 2: Antecedentes Médicos */}
            <TabsContent value="antecedentes" className="mt-4">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                    Antecedentes Médicos
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Información relevante para tratamientos dentales
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
                  {/* Tratamiento Médico Actual */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold text-sm sm:text-base">
                        Tratamiento Médico Actual
                      </Label>
                      <Switch
                        checked={!!formData.tratamiento_medico}
                        onCheckedChange={(checked) =>
                          handleBooleanChange("tratamiento_medico", checked)
                        }
                        className={isMobile ? "scale-90" : ""}
                      />
                    </div>
                    {formData.tratamiento_medico && (
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="tratamiento_medico_detalle" className="text-xs sm:text-sm">
                          Detalles del tratamiento
                        </Label>
                        <Textarea
                          id="tratamiento_medico_detalle"
                          value={formData.tratamiento_medico_detalle || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "tratamiento_medico_detalle",
                              e.target.value
                            )
                          }
                          placeholder="Describa el tratamiento médico actual..."
                          rows={isMobile ? 2 : 3}
                          className="text-xs sm:text-sm resize-none"
                        />
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Medicamentos Actuales */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold text-sm sm:text-base">
                        Medicamentos Actuales
                      </Label>
                      <Switch
                        checked={!!formData.medicamentos_actuales}
                        onCheckedChange={(checked) =>
                          handleBooleanChange("medicamentos_actuales", checked)
                        }
                        className={isMobile ? "scale-90" : ""}
                      />
                    </div>
                    {formData.medicamentos_actuales && (
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="medicamentos_actuales_detalle" className="text-xs sm:text-sm">
                          Lista de medicamentos
                        </Label>
                        <Textarea
                          id="medicamentos_actuales_detalle"
                          value={formData.medicamentos_actuales_detalle || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "medicamentos_actuales_detalle",
                              e.target.value
                            )
                          }
                          placeholder="Especifique medicamentos, dosis y frecuencia..."
                          rows={isMobile ? 2 : 3}
                          className="text-xs sm:text-sm resize-none"
                        />
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Enfermedad del Corazón */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold text-sm sm:text-base">
                        Enfermedad del Corazón
                      </Label>
                      <Switch
                        checked={!!formData.enfermedad_corazon}
                        onCheckedChange={(checked) =>
                          handleBooleanChange("enfermedad_corazon", checked)
                        }
                        className={isMobile ? "scale-90" : ""}
                      />
                    </div>
                    {formData.enfermedad_corazon && (
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="enfermedad_corazon_detalle" className="text-xs sm:text-sm">
                          Detalles de la condición cardíaca
                        </Label>
                        <Textarea
                          id="enfermedad_corazon_detalle"
                          value={formData.enfermedad_corazon_detalle || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "enfermedad_corazon_detalle",
                              e.target.value
                            )
                          }
                          placeholder="Describa la condición cardíaca..."
                          rows={isMobile ? 2 : 3}
                          className="text-xs sm:text-sm resize-none"
                        />
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Alergias */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold text-sm sm:text-base">
                        Alergias
                      </Label>
                      <Switch
                        checked={!!formData.alergias}
                        onCheckedChange={(checked) =>
                          handleBooleanChange("alergias", checked)
                        }
                        className={isMobile ? "scale-90" : ""}
                      />
                    </div>
                    {formData.alergias && (
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="alergias_detalle" className="text-xs sm:text-sm">
                          Detalles de alergias
                        </Label>
                        <Textarea
                          id="alergias_detalle"
                          value={formData.alergias_detalle || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "alergias_detalle",
                              e.target.value
                            )
                          }
                          placeholder="Lista de alergias conocidas..."
                          rows={isMobile ? 2 : 3}
                          className="text-xs sm:text-sm resize-none"
                        />
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Hemorragias en Extracciones */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold text-sm sm:text-base">
                        Hemorragias en Extracciones
                      </Label>
                      <Switch
                        checked={!!formData.hemorragias_extraccion}
                        onCheckedChange={(checked) =>
                          handleBooleanChange("hemorragias_extraccion", checked)
                        }
                        className={isMobile ? "scale-90" : ""}
                      />
                    </div>
                    {formData.hemorragias_extraccion && (
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="hemorragias_extraccion_detalle" className="text-xs sm:text-sm">
                          Historial de hemorragias
                        </Label>
                        <Textarea
                          id="hemorragias_extraccion_detalle"
                          value={formData.hemorragias_extraccion_detalle || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "hemorragias_extraccion_detalle",
                              e.target.value
                            )
                          }
                          placeholder="Describa episodios de hemorragias anteriores..."
                          rows={isMobile ? 2 : 3}
                          className="text-xs sm:text-sm resize-none"
                        />
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Comentarios del médico */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label
                      htmlFor="comentarios_medico"
                      className="font-semibold text-sm sm:text-base"
                    >
                      Comentarios del Médico
                    </Label>
                    <Textarea
                      id="comentarios_medico"
                      value={formData.comentarios_medico || ""}
                      onChange={(e) =>
                        handleInputChange("comentarios_medico", e.target.value)
                      }
                      placeholder="Observaciones adicionales del médico..."
                      rows={isMobile ? 3 : 4}
                      className="text-xs sm:text-sm resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: Hábitos de Higiene */}
            <TabsContent value="habitos" className="mt-4">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Hábitos de Higiene Bucal</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Información sobre los hábitos de cuidado dental del paciente
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Columna 1 */}
                    <div className="space-y-4 sm:space-y-6">
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="font-semibold text-sm sm:text-base">
                            Usa cepillo dental
                          </Label>
                          <Switch
                            checked={!!formData.usa_cepillo}
                            onCheckedChange={(checked) =>
                              handleBooleanChange("usa_cepillo", checked)
                            }
                            className={isMobile ? "scale-90" : ""}
                          />
                        </div>
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="font-semibold text-sm sm:text-base">
                            Usa dentífrico
                          </Label>
                          <Switch
                            checked={!!formData.usa_dentifrico}
                            onCheckedChange={(checked) =>
                              handleBooleanChange("usa_dentifrico", checked)
                            }
                            className={isMobile ? "scale-90" : ""}
                          />
                        </div>
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="font-semibold text-sm sm:text-base">
                            Usa hilo dental
                          </Label>
                          <Switch
                            checked={!!formData.usa_hilo_dental}
                            onCheckedChange={(checked) =>
                              handleBooleanChange("usa_hilo_dental", checked)
                            }
                            className={isMobile ? "scale-90" : ""}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Columna 2 */}
                    <div className="space-y-4 sm:space-y-6">
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label
                          htmlFor="veces_cepillado_dia"
                          className="font-semibold text-sm sm:text-base"
                        >
                          Veces que se cepilla al día
                        </Label>
                        <Select
                          value={
                            formData.veces_cepillado_dia?.toString() || "2"
                          }
                          onValueChange={(value) =>
                            handleInputChange(
                              "veces_cepillado_dia",
                              parseInt(value)
                            )
                          }
                        >
                          <SelectTrigger className="text-xs sm:text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0 - Nunca</SelectItem>
                            <SelectItem value="1">1 vez</SelectItem>
                            <SelectItem value="2">2 veces</SelectItem>
                            <SelectItem value="3">3 veces</SelectItem>
                            <SelectItem value="4">4 o más veces</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5 sm:space-y-2">
                        <Label
                          htmlFor="tecnica_cepillado"
                          className="font-semibold text-sm sm:text-base"
                        >
                          Técnica de Cepillado
                        </Label>
                        <Textarea
                          id="tecnica_cepillado"
                          value={formData.tecnica_cepillado || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "tecnica_cepillado",
                              e.target.value
                            )
                          }
                          placeholder="Describa la técnica de cepillado observada..."
                          rows={isMobile ? 2 : 3}
                          className="text-xs sm:text-sm resize-none"
                        />
                      </div>

                      <div className="space-y-1.5 sm:space-y-2">
                        <Label
                          htmlFor="observaciones_generales"
                          className="font-semibold text-sm sm:text-base"
                        >
                          Observaciones Generales
                        </Label>
                        <Textarea
                          id="observaciones_generales"
                          value={formData.observaciones_generales || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "observaciones_generales",
                              e.target.value
                            )
                          }
                          placeholder="Otras observaciones sobre hábitos de higiene..."
                          rows={isMobile ? 2 : 3}
                          className="text-xs sm:text-sm resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 4: Odontograma */}
            <TabsContent value="odontograma" className="mt-4">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Odontograma</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Actualiza el estado dental del paciente
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-2 sm:p-6">
                  <div className="w-full overflow-x-auto">
                    <Odontograma historiaId={historiaId} editable />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 5: Tratamientos y pagos */}
            <TabsContent value="tratamientos" className="mt-4">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Tratamientos y pagos</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Gestiona tratamientos y su estado de pago
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-2 sm:p-6">
                  <div className="w-full overflow-x-auto">
                    <Tratamientos historiaId={historiaId} editable />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>
  );
}