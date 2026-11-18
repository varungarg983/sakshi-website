import type { Industry, Situation } from '@/data/content'

export type Vendor = {
  firstName?: string
  business?: string
  industry?: Industry
  situation?: Situation
  note?: string
  // Documents Sakshi picked for this vendor (ids from documents.ts, or "custom:<text>")
  docs?: string[]
}

export const API = '/.netlify/functions/vendor-link'

// Links look like /v/abc123 (short) or /vendor/?v=abc123
export function linkId(): string | null {
  const fromPath = location.pathname.match(/^\/v\/([A-Za-z0-9]{6,20})\/?$/)
  if (fromPath) return fromPath[1]
  const fromQuery = new URLSearchParams(location.search).get('v')
  return fromQuery && /^[A-Za-z0-9]{6,20}$/.test(fromQuery) ? fromQuery : null
}

export async function loadVendor(id: string): Promise<Vendor | null> {
  try {
    const res = await fetch(`${API}?id=${encodeURIComponent(id)}`)
    if (!res.ok) return null
    return (await res.json()) as Vendor
  } catch {
    return null
  }
}

// Browser storage can be blocked (private mode), so every call is wrapped
export const store = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : fallback
    } catch {
      return fallback
    }
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* not saved, that's fine */
    }
  },
}
