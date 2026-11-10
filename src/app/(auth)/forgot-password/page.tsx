// src/app/(auth)/forgot-password/page.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, ArrowLeft, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-blue-100">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Recuperar Contraseña
          </CardTitle>
          <CardDescription className="text-gray-600">
            Instrucciones para restablecer tu acceso
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert className="bg-blue-50 border-blue-200 text-blue-900">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-xs leading-relaxed">
              Por motivos de seguridad en el sistema clínico, si olvidaste tu contraseña
              por favor solicita el restablecimiento al <strong>Administrador de la clínica</strong> desde el panel de control o contacta al soporte técnico.
            </AlertDescription>
          </Alert>

          <div className="pt-2 text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-blue-600 hover:underline font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver al inicio de sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
