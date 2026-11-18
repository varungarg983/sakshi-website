import { Check, Copy, ExternalLink, Loader2, Plus, Share2, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { INDUSTRIES, SITUATIONS, type Industry } from '@/data/content'
import { CUSTOM_PREFIX, DOCUMENTS, GROUPS, isCustom, presetFor, type DocGroup } from '@/data/documents'
import { API, store } from '@/lib/vendor'
import { cn } from '@/lib/utils'

const field = 'mt-1.5 w-full rounded-xl border border-input bg-card px-3.5 py-3 text-base outline-none focus:border-ink focus:ring-3 focus:ring-ink/10'
const label = 'block text-sm font-semibold'

const EMPTY = { firstName: '', business: '', industry: '', situation: '', note: '' }

// Private page for Sakshi: makes a personal link to send a vendor after a call
export function LinkMaker() {
  const [passcode, setPasscode] = useState(() => store.get('vendor-passcode', ''))
  const [form, setForm] = useState(EMPTY)
  const [docs, setDocs] = useState<string[]>(() => presetFor())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [link, setLink] = useState('')
  const [copied, setCopied] = useState<'link' | 'message' | ''>('')

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  // Picking a type of business pre-ticks its usual documents, keeping any custom ones
  const setIndustry = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const industry = e.target.value as Industry | ''
    setForm(f => ({ ...f, industry }))
    setDocs(d => [...presetFor(industry), ...d.filter(isCustom)])
  }

  const message = `Hi ${form.firstName.trim() || 'there'}, great talking with you today. As promised, here's a page with what other owners say about working with me, and the documents I'll need when you're ready: ${link}\n\nSakshi`

  async function create(e: React.FormEvent) {
    e.preventDefault()
    if (docs.length === 0) {
      setError('Pick at least one document to ask for.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, docs, passcode }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not make the link. Please try again.')
      store.set('vendor-passcode', passcode)
      setLink(`${location.origin}/v/${data.id}`)
      window.scrollTo({ top: 0 })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not make the link.')
    } finally {
      setBusy(false)
    }
  }

  async function copy(what: 'link' | 'message') {
    try {
      await navigator.clipboard.writeText(what === 'link' ? link : message)
      setCopied(what)
      setTimeout(() => setCopied(''), 2000)
    } catch {
      /* clipboard blocked */
    }
  }

  const reset = () => {
    setLink('')
    setForm(EMPTY)
    setDocs(presetFor())
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <p className="text-[0.7rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">Private</p>
      <h1 className="display mt-2 text-5xl">Make a vendor <em>link</em></h1>
      <p className="mt-3 text-muted-foreground">Fill this in after a call. The vendor gets a short private link with their name, your note, and only the documents you pick.</p>

      {link ? (
        <div className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-5">
          <p className="font-semibold">Link ready for {form.firstName || 'your vendor'}</p>
          <p className="rounded-lg bg-muted px-3 py-2.5 font-mono text-sm break-all">{link}</p>
          <div className="grid grid-cols-2 gap-2">
            <Button size="lg" variant="outline" className="h-11" onClick={() => copy('link')}>
              {copied === 'link' ? <Check /> : <Copy />} Copy link
            </Button>
            <Button size="lg" variant="outline" className="h-11" render={<a href={link} target="_blank" rel="noopener noreferrer" />} nativeButton={false}>
              <ExternalLink /> Preview
            </Button>
          </div>
          <div>
            <p className="mb-1.5 text-sm font-semibold">Message to send with it</p>
            <p className="rounded-lg bg-muted px-3 py-2.5 text-sm whitespace-pre-line">{message}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button size="lg" className="h-11" onClick={() => copy('message')}>
                {copied === 'message' ? <Check /> : <Copy />} Copy message
              </Button>
              {'share' in navigator && (
                <Button size="lg" variant="outline" className="h-11" onClick={() => navigator.share({ text: message }).catch(() => {})}>
                  <Share2 /> Share
                </Button>
              )}
            </div>
          </div>
          <button onClick={reset} className="text-sm font-semibold underline decoration-ink/30 underline-offset-4">Make another link</button>
        </div>
      ) : (
        <form onSubmit={create} className="mt-8 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className={label}>Their first name
              <input className={field} value={form.firstName} onChange={set('firstName')} maxLength={40} required />
            </label>
            <label className={label}>Business name <span className="font-normal text-muted-foreground">(optional)</span>
              <input className={field} value={form.business} onChange={set('business')} maxLength={80} />
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className={label}>Type of business
              <select className={field} value={form.industry} onChange={setIndustry}>
                <option value="">Not sure</option>
                {Object.entries(INDUSTRIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label className={label}>Why they’re selling
              <select className={field} value={form.situation} onChange={set('situation')}>
                <option value="">Not sure</option>
                {Object.entries(SITUATIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
          </div>
          <label className={label}>Personal note <span className="font-normal text-muted-foreground">(optional, shown at the top)</span>
            <textarea className={cn(field, 'min-h-28')} value={form.note} onChange={set('note')} maxLength={800}
              placeholder="e.g. I know timing matters because you want to retire next year. Here's what other owners say…" />
          </label>

          <DocPicker docs={docs} setDocs={setDocs} />

          <label className={label}>Passcode
            <input className={field} type="password" value={passcode} onChange={e => setPasscode(e.target.value)} required autoComplete="current-password" />
          </label>
          {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          <Button type="submit" size="lg" className="h-12 w-full text-base" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />} Make link
          </Button>
        </form>
      )}
    </main>
  )
}

const MAX_CUSTOM = 10

function DocPicker({ docs, setDocs }: { docs: string[]; setDocs: React.Dispatch<React.SetStateAction<string[]>> }) {
  const [custom, setCustom] = useState('')
  const toggle = (id: string) => setDocs(d => (d.includes(id) ? d.filter(x => x !== id) : [...d, id]))
  const customs = docs.filter(isCustom)

  const addCustom = () => {
    const text = custom.trim().replace(/\s+/g, ' ').slice(0, 80)
    if (!text || customs.length >= MAX_CUSTOM) return
    const id = CUSTOM_PREFIX + text
    setDocs(d => (d.includes(id) ? d : [...d, id]))
    setCustom('')
  }

  const groups = Object.entries(GROUPS).filter(([g]) => g !== 'other') as [DocGroup, string][]

  return (
    <fieldset className="rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border px-4 py-3">
        <legend className="contents">
          <span className="text-sm font-semibold">Documents to ask for</span>
        </legend>
        <span className="text-sm text-muted-foreground">{docs.length} selected</span>
        <div className="flex w-full gap-3 text-sm font-semibold">
          <button type="button" onClick={() => setDocs([...DOCUMENTS.map(d => d.id), ...customs])} className="underline decoration-ink/30 underline-offset-4">Select all</button>
          <button type="button" onClick={() => setDocs([])} className="underline decoration-ink/30 underline-offset-4">Clear</button>
        </div>
      </div>

      {groups.map(([g, name]) => (
        <div key={g} className="border-b border-border px-4 py-3">
          <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">{name}</p>
          <div className="flex flex-wrap gap-2">
            {DOCUMENTS.filter(d => d.group === g).map(d => {
              const on = docs.includes(d.id)
              return (
                <button
                  key={d.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(d.id)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border-[1.5px] px-3 py-1.5 text-left text-sm transition-colors',
                    on ? 'border-ink bg-ink text-background' : 'border-ink/15 hover:border-ink/40',
                  )}
                >
                  {on && <Check className="size-3.5 shrink-0" strokeWidth={3} />}
                  {d.label}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <div className="px-4 py-3">
        <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">Anything else</p>
        {customs.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {customs.map(id => (
              <span key={id} className="flex items-center gap-1 rounded-full border-[1.5px] border-ink bg-ink py-1.5 pr-1.5 pl-3 text-sm text-background">
                {id.slice(CUSTOM_PREFIX.length)}
                <button type="button" aria-label="Remove" onClick={() => toggle(id)} className="rounded-full p-0.5 hover:bg-white/20">
                  <X className="size-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            className={cn(field, 'mt-0 py-2.5')}
            value={custom}
            onChange={e => setCustom(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
            placeholder="e.g. Kitchen equipment service records"
            maxLength={80}
            disabled={customs.length >= MAX_CUSTOM}
          />
          <Button type="button" variant="outline" className="h-auto px-4" onClick={addCustom} disabled={!custom.trim()}>
            <Plus /> Add
          </Button>
        </div>
      </div>
    </fieldset>
  )
}
