"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getCitasByFecha,
  searchCitas,
  createCita,
  updateCita,
  deleteCita,
} from "@/actions/citas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CalendarClock,
  CalendarDays,
  Clock3,
  Search,
  User,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

type Cita = {
  id: string;
  fecha: string;
  hora: string;
  nombre_cliente: string;
  estado: 'programada' | 'cancelada' | 'atendida' | 'no-show';
  creado_en?: string;
};

const buildToday = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().split("T")[0];
};

const buildTimeSlots = () => {
  const slots: string[] = [];
  const startMinutes = 8 * 60; // 08:00
  const endMinutes = 19 * 60 + 30; // 19:30
  for (let m = startMinutes; m <= endMinutes; m += 30) {
    const hours = Math.floor(m / 60);
    const minutes = m % 60;
    const label = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    slots.push(label);
  }
  return slots;
};

export default function CitasPage() {
  const [fecha, setFecha] = useState(buildToday());
  const [hora, setHora] = useState("");
  const [nombre, setNombre] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [buscandoGlobal, setBuscandoGlobal] = useState(false);
  const [resultadosGlobales, setResultadosGlobales] = useState<Cita[]>([]);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editandoCita, setEditandoCita] = useState<Cita | null>(null);
  const [nuevoFecha, setNuevoFecha] = useState("");
  const [nuevoHora, setNuevoHora] = useState("");
  
  // Nuevos estados para responsive
  const [showCitasAgendadas, setShowCitasAgendadas] = useState(false);
  const [showDisponibilidad, setShowDisponibilidad] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const timeSlots = useMemo(() => buildTimeSlots(), []);
  const filteredCitas = useMemo(() => {
    const term = busqueda.trim().toLowerCase();
    if (!term) return citas;
    return citas.filter(
      (c) =>
        c.nombre_cliente.toLowerCase().includes(term) ||
        c.hora.toLowerCase().includes(term)
    );
  }, [busqueda, citas]);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchCitas = async () => {
      setLoading(true);
      setError(null);
      const res = await getCitasByFecha(fecha);

      if (!res.success) {
        console.error("Error al cargar citas", res.error);
        setError("No pudimos cargar las citas de este día. Intenta nuevamente.");
        setCitas([]);
      } else {
        setCitas((res.data as any) || []);
      }
      setLoading(false);
    };

    fetchCitas();
  }, [fecha]);

  // Búsqueda global (todas las fechas) cuando hay término
  useEffect(() => {
    const term = busqueda.trim();
    if (!term) {
      setResultadosGlobales([]);
      setErrorGlobal(null);
      setBuscandoGlobal(false);
      return;
    }

    const handler = setTimeout(async () => {
      setBuscandoGlobal(true);
      setErrorGlobal(null);
      const res = await searchCitas(term);

      if (!res.success) {
        console.error("Error al buscar citas", res.error);
        setErrorGlobal("No pudimos buscar en todas las fechas. Intenta de nuevo.");
        setResultadosGlobales([]);
      } else {
        setResultadosGlobales((res.data as any) || []);
      }
      setBuscandoGlobal(false);
    }, 300);

    return () => clearTimeout(handler);
  }, [busqueda]);

  const slotOcupado = (slot: string) => 
    citas.some((c) => c.hora === slot && c.estado === 'programada');

  const getEstadoBadge = (estado: Cita['estado']) => {
    switch (estado) {
      case 'programada':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'atendida':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelada':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'no-show':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getEstadoLabel = (estado: Cita['estado']) => {
    const labels: Record<Cita['estado'], string> = {
      programada: 'Programada',
      atendida: 'Atendida',
      cancelada: 'Cancelada',
      'no-show': 'No se presentó',
    };
    return labels[estado];
  };

  const handleCrear = async () => {
    setError(null);
    if (!fecha || !hora || !nombre.trim()) {
      setError("Completa fecha, hora y nombre del cliente.");
      return;
    }

    if (slotOcupado(hora)) {
      setError("Ese horario ya está reservado. Elige otro horario libre.");
      return;
    }

    setSaving(true);
    const res = await createCita({
      fecha,
      hora,
      nombre_cliente: nombre.trim(),
      estado: 'programada',
    });

    if (!res.success) {
      console.error("Error al crear cita", res.error);
      setError(res.error || "No pudimos guardar la cita. Intenta nuevamente.");
    } else {
      setNombre("");
      setHora("");
      const refreshRes = await getCitasByFecha(fecha);
      setCitas((refreshRes.data as any) || []);
    }
    setSaving(false);
  };

  const handleReagendar = async () => {
    if (!editandoCita || !nuevoFecha || !nuevoHora) {
      setError("Completa nueva fecha y hora.");
      return;
    }

    const otrasEnNuevaFecha = citas.filter((c) => c.fecha === nuevoFecha && c.estado === 'programada');
    if (otrasEnNuevaFecha.some((c) => c.hora === nuevoHora)) {
      setError("Ese horario ya está ocupado. Elige otro.");
      return;
    }

    setSaving(true);
    const res = await updateCita(editandoCita.id, {
      fecha: nuevoFecha,
      hora: nuevoHora,
    });

    if (!res.success) {
      console.error("Error al reagendar", res.error);
      setError(res.error || "No pudimos reagendar la cita. Intenta nuevamente.");
    } else {
      setEditandoCita(null);
      setNuevoFecha("");
      setNuevoHora("");
      const refreshRes = await getCitasByFecha(fecha);
      setCitas((refreshRes.data as any) || []);
    }
    setSaving(false);
  };

  const handleCancelar = async (citaId: string) => {
    setSaving(true);
    const res = await deleteCita(citaId);

    if (!res.success) {
      console.error("Error al cancelar", res.error);
      setError(res.error || "No pudimos cancelar la cita. Intenta nuevamente.");
    } else {
      const refreshRes = await getCitasByFecha(fecha);
      setCitas((refreshRes.data as any) || []);
    }
    setSaving(false);
  };

  return (
    <div className="w-full space-y-6">
      {/* Tarjeta de creación de citas */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <CalendarClock className="h-5 w-5 text-blue-600" />
              <span className="text-lg md:text-xl">Agenda de Citas</span>
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span>Día seleccionado: {fecha}</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Formulario responsivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1 sm:col-span-1">
              <label className="text-sm font-medium flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-gray-500" />
                Fecha
              </label>
              <Input
                type="date"
                value={fecha}
                onChange={(e) => {
                  setFecha(e.target.value);
                  setHora("");
                }}
                className="w-full"
              />
            </div>

            <div className="space-y-1 sm:col-span-1">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-gray-500" />
                Hora (30 min)
              </label>
              <Select value={hora} onValueChange={setHora}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona una hora" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {timeSlots.map((slot) => (
                    <SelectItem
                      key={slot}
                      value={slot}
                      disabled={slotOcupado(slot)}
                    >
                      <div className="flex items-center justify-between">
                        <span>{slot}</span>
                        {slotOcupado(slot) && (
                          <span className="text-xs text-gray-500 ml-2">Ocupado</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                Nombre del cliente
              </label>
              <Input
                placeholder="Ej. Juan Pérez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleCrear}
              disabled={saving}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              size={isMobile ? "lg" : "default"}
            >
              {saving ? (
                <span className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </span>
              ) : (
                <span className="flex items-center gap-2 text-sm">
                  <CalendarClock className="h-4 w-4" />
                  Crear cita
                </span>
              )}
            </Button>
            
            {isMobile && (
              <Button
                variant="outline"
                onClick={() => setShowCitasAgendadas(!showCitasAgendadas)}
                className="w-full"
                size="lg"
              >
                {showCitasAgendadas ? (
                  <span className="flex items-center gap-2">
                    <ChevronUp className="h-4 w-4" />
                    Ocultar citas
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ChevronDown className="h-4 w-4" />
                    Ver citas del día ({filteredCitas.length})
                  </span>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tarjeta de disponibilidad y citas */}
      <Card className="shadow-sm flex-1 min-h-0 flex flex-col">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarDays className="h-5 w-5 text-green-600" />
                <span className="text-lg md:text-xl">
                  Disponibilidad y Citas del Día
                </span>
              </CardTitle>
              
              {!isMobile && (
                <div className="w-full max-w-xs">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nombre u hora (ej. 09:00)"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              )}
            </div>
            
            {isMobile && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre u hora..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-9"
                  
                />
                {busqueda && (
                  <button
                    onClick={() => setBusqueda("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                <p className="text-sm text-gray-600">Cargando citas...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Búsqueda global en móvil - Mostrar siempre que haya término */}
              {busqueda.trim() && (
                <div className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold flex items-center gap-2 text-blue-800">
                    <Search className="h-4 w-4" />
                    Coincidencias en todas las fechas
                  </p>

                  {buscandoGlobal ? (
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Buscando en todas las fechas...
                    </div>
                  ) : errorGlobal ? (
                    <p className="text-sm text-red-600">{errorGlobal}</p>
                  ) : resultadosGlobales.length === 0 ? (
                    <p className="text-sm text-blue-600">No hay citas con ese término.</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {resultadosGlobales.map((cita) => (
                        <div
                          key={cita.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between rounded-md border border-blue-200 bg-white px-3 py-2"
                        >
                          <div className="flex items-center gap-2 text-sm mb-2 sm:mb-0">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                              {cita.hora}
                            </Badge>
                            <span className="font-medium truncate">{cita.nombre_cliente}</span>
                          </div>
                          <span className="text-xs text-gray-500 self-end sm:self-center">
                            {cita.fecha}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Controles de pestañas en móvil */}
              {isMobile && (
                <div className="flex border-b">
                  <button
                    onClick={() => setShowDisponibilidad(true)}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                      showDisponibilidad
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Disponibilidad
                  </button>
                  <button
                    onClick={() => setShowDisponibilidad(false)}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                      !showDisponibilidad
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Citas ({filteredCitas.length})
                  </button>
                </div>
              )}

              {/* Sección de disponibilidad */}
              {(showDisponibilidad || !isMobile) && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700">
                      Horarios disponibles ({timeSlots.filter(s => !slotOcupado(s)).length}/{timeSlots.length})
                    </p>
                    {!isMobile && busqueda.trim() && (
                      <p className="text-xs text-blue-600">
                        Las citas que coinciden con la búsqueda están resaltadas
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {timeSlots.map((slot) => {
                      const cita = citas.find((c) => c.hora === slot);
                      const coincideBusqueda =
                        !!busqueda.trim() &&
                        !!cita &&
                        (cita.nombre_cliente
                          .toLowerCase()
                          .includes(busqueda.trim().toLowerCase()) ||
                          cita.hora.toLowerCase().includes(busqueda.trim().toLowerCase()));
                      
                      return (
                        <div
                          key={slot}
                          className={`border rounded-lg p-3 transition-all duration-200 ${
                            cita
                              ? "bg-green-50 border-green-200 hover:bg-green-100"
                              : "bg-white border-gray-200 hover:bg-gray-50"
                          } ${
                            coincideBusqueda
                              ? "ring-2 ring-blue-300 shadow-md transform -translate-y-0.5"
                              : "hover:shadow"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                              <Clock3 className={`h-4 w-4 ${cita ? 'text-green-600' : 'text-gray-600'}`} />
                              <span>{slot}</span>
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                cita
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : "bg-gray-100 text-gray-700 border-gray-200"
                              }`}
                            >
                              {cita ? "Reservado" : "Disponible"}
                            </Badge>
                          </div>
                          
                          {cita ? (
                            <div className="text-sm">
                              <div className="flex items-center gap-2 text-gray-800 mb-1">
                                <User className="h-4 w-4 text-gray-500" />
                                <span className="font-medium truncate">{cita.nombre_cliente}</span>
                              </div>
                              <Badge
                                variant="outline"
                                className={`text-xs ${getEstadoBadge(cita.estado)}`}
                              >
                                {getEstadoLabel(cita.estado)}
                              </Badge>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 italic">
                              Libre para reservar
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sección de citas agendadas */}
              {((showCitasAgendadas || !isMobile) && filteredCitas.length > 0) && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700">
                      Citas agendadas ({filteredCitas.length})
                    </p>
                    {isMobile && (
                      <button
                        onClick={() => setShowCitasAgendadas(false)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Cerrar
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {filteredCitas.map((cita) => (
                      <div
                        key={cita.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border bg-white p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start sm:items-center gap-3 mb-3 sm:mb-0">
                          <Badge
                            variant="secondary"
                            className="bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {cita.hora}
                          </Badge>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{cita.nombre_cliente}</span>
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-xs ${getEstadoBadge(cita.estado)}`}
                            >
                              {getEstadoLabel(cita.estado)}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between sm:justify-end gap-2">
                          <span className="text-xs text-gray-500">
                            {isMobile ? `Fecha: ${cita.fecha}` : cita.fecha}
                          </span>
                          {cita.estado === 'programada' && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 text-xs border-blue-300 text-blue-600 hover:bg-blue-50"
                                onClick={() => {
                                  setEditandoCita(cita);
                                  setNuevoFecha(cita.fecha);
                                  setNuevoHora(cita.hora);
                                }}
                              >
                                Reagendar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 text-xs border-red-300 text-red-600 hover:bg-red-50"
                                onClick={() => handleCancelar(cita.id)}
                              >
                                Cancelar
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {busqueda.trim() && filteredCitas.length === 0 && !isMobile && (
                <div className="text-center py-8">
                  <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    No se encontraron citas con ese criterio para este día
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de Reagendar - Responsive */}
      {editandoCita && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md mx-auto shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Reagendar cita
                </CardTitle>
                <button
                  onClick={() => {
                    setEditandoCita(null);
                    setNuevoFecha("");
                    setNuevoHora("");
                    setError(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600">
                {editandoCita.nombre_cliente} - {editandoCita.fecha} {editandoCita.hora}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nueva fecha</label>
                <Input
                  type="date"
                  value={nuevoFecha}
                  onChange={(e) => setNuevoFecha(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Nueva hora</label>
                <Select value={nuevoHora} onValueChange={setNuevoHora}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una hora" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {timeSlots.map((slot) => {
                      const otrosEnNuevaFecha = citas.filter(
                        (c) =>
                          c.fecha === nuevoFecha &&
                          c.estado === 'programada' &&
                          c.id !== editandoCita.id
                      );
                      const ocupado = otrosEnNuevaFecha.some((c) => c.hora === slot);
                      return (
                        <SelectItem
                          key={slot}
                          value={slot}
                          disabled={ocupado}
                        >
                          <div className="flex items-center justify-between">
                            <span>{slot}</span>
                            {ocupado && (
                              <span className="text-xs text-gray-500">Ocupado</span>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditandoCita(null);
                    setNuevoFecha("");
                    setNuevoHora("");
                    setError(null);
                  }}
                  className="flex-1"
                  size={isMobile ? "lg" : "default"}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleReagendar}
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  size={isMobile ? "lg" : "default"}
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </span>
                  ) : (
                    'Guardar cambios'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}