'use client'

import { useEffect } from 'react'

const SW_URL = '/sw.js'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register(SW_URL, { scope: '/' })
        registration.onupdatefound = () => {
          const installing = registration.installing
          if (!installing) return
          installing.onstatechange = () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              console.info('[PWA] Nueva versión lista, recarga para actualizar.')
            }
          }
        }
      } catch (error) {
        console.error('[PWA] Error registrando el Service Worker', error)
      }
    }

    register()
  }, [])

  return null
}
