import { ChevronRight, History, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { API } from '@/lib/vendor'
import { displayName } from '@/lib/messages'

export type RecentLink = {
  id: string
  firstName: string
  business?: string
  industry?: string
  situation?: string
  note?: string
  opening?: string
  docs?: string[]
  created: string
}

const when = (iso: string) =>
  new Date(iso).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })

// Links Sakshi has made, so she can reopen one and copy the message again
export function Recent({ passcode, onOpen }: { passcode: string; onOpen: (link: RecentLink) => void }) {
  const [open, setOpen] = useState(false)
  const [links, setLinks] = useState<RecentLink[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setOpen(o => !o)
    if (open || links) return
    if (!passcode) {
      setError('Enter your passcode below first.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'recent', passcode }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not load recent links.')
      setLinks(data.links ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load recent links.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-border bg-card">
      <button type="button" onClick={load} aria-expanded={open} className="flex w-full items-center justify-between gap-2 px-4 py-3 text-sm font-semibold">
        <span className="flex items-center gap-2"><History className="size-4" /> Recent links</span>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <ChevronRight className={`size-4 transition-transform ${open ? 'rotate-90' : ''}`} />}
      </button>
      {open && (
        <div className="border-t border-border">
          {error && <p className="px-4 py-3 text-sm text-destructive">{error}</p>}
          {links && links.length === 0 && <p className="px-4 py-3 text-sm text-muted-foreground">No links yet. Links made from now on will show here.</p>}
          {links && links.length > 0 && (
            <ul className="max-h-80 overflow-y-auto">
              {links.map(l => (
                <li key={l.id} className="border-b border-border last:border-0">
                  <button type="button" onClick={() => onOpen(l)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/60">
                    <span>
                      <span className="block font-medium">{displayName(l.firstName)}{l.business ? ` · ${l.business}` : ''}</span>
                      <span className="text-xs text-muted-foreground">{when(l.created)}</span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
