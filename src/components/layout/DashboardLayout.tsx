// src/components/layout/DashboardLayout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Users,
  FileText,
  DollarSign,
  Calendar,
  ShieldCheck,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Icon from "@mdi/react";
import { mdiToothOutline } from "@mdi/js";

const ToothIcon = (props: any) => <Icon path={mdiToothOutline} {...props} />;

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: any;
}

export default function DashboardLayout({
  children,
  user,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isAdmin = user?.rol === "admin";

  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Users, label: "Pacientes", href: "/dashboard/pacientes" },
    { icon: FileText, label: "Historias Clínicas", href: "/dashboard/historias" },
    { icon: ToothIcon, label: "Odontograma", href: "/dashboard/odontograma" },
    { icon: DollarSign, label: "Tratamientos y Pagos", href: "/dashboard/tratamientos" },
    { icon: Calendar, label: "Citas", href: "/dashboard/citas" },
    ...(isAdmin
      ? [{ icon: ShieldCheck, label: "Gestión de Usuarios", href: "/dashboard/usuarios" }]
      : []),
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [isMobile, sidebarOpen]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const showHamburger = isMobile && !sidebarOpen;

  const displayName = user?.name || user?.nombre || user?.email || "Usuario";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar para desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-white border-r shadow-sm z-30 flex-col">
        {/* Header del Sidebar */}
        <div className="border-b p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-md text-white flex items-center justify-center">
              <Icon path={mdiToothOutline} className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bold text-base text-gray-900 leading-tight">
                Inturias Odontología
              </h1>
              <p className="text-xs text-gray-500">Sistema Clínico</p>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <div className="flex-1 overflow-y-auto p-3">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
            Navegación
          </p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-xs"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <item.icon
                    className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-gray-500"}`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer del sidebar */}
        <div className="border-t p-4 mt-auto bg-gray-50/50">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="h-9 w-9 border border-gray-200">
                <AvatarFallback className="bg-blue-600 text-white font-semibold text-sm">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm text-gray-900 truncate">
                  {displayName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge
                    variant={isAdmin ? "default" : "secondary"}
                    className="text-[10px] px-1.5 py-0 capitalize"
                  >
                    {isAdmin ? "Admin" : "Dentista"}
                  </Badge>
                  {user?.especialidad && (
                    <span className="text-[11px] text-gray-500 truncate">
                      {user.especialidad}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Cerrar sesión"
              className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Botón móvil para abrir sidebar */}
      {showHamburger && (
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden fixed top-4 right-4 z-50 bg-white shadow-md border-gray-200"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5 text-gray-700" />
        </Button>
      )}

      {/* Sidebar móvil */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />

          <aside className="fixed left-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col z-50">
            {/* Header móvil */}
            <div className="border-b p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg text-white">
                  <Icon path={mdiToothOutline} className="h-6 w-6" />
                </div>
                <span className="font-bold text-gray-900">Inturias Dental</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navegación móvil */}
            <div className="flex-1 overflow-y-auto p-3">
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon
                        className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-gray-500"}`}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Footer móvil */}
            <div className="border-t p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-blue-600 text-white font-semibold">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {isAdmin ? "Administrador" : "Dentista"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  title="Cerrar sesión"
                  className="h-8 w-8 text-gray-500 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex-1 lg:pl-64 min-h-screen flex flex-col min-w-0 overflow-x-hidden">
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto min-w-0 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
