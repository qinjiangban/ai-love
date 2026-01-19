'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function AuthBroadcastListener() {
  const router = useRouter()

  useEffect(() => {
    function refresh() {
      router.refresh()
    }

    let ch: BroadcastChannel | null = null
    try {
      ch = new BroadcastChannel('auth')
      ch.onmessage = (e) => {
        if (e?.data?.type === 'confirmed') refresh()
      }
    } catch {}

    function onStorage(e: StorageEvent) {
      if (e.key === 'auth:confirmed') refresh()
    }

    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('storage', onStorage)
      if (ch) ch.close()
    }
  }, [router])

  return null
}

