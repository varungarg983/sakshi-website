import { Check, Copy, ExternalLink, Loader2, Share2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { INDUSTRIES, SITUATIONS } from '@/data/content'
import { API, store } from '@/lib/vendor'
import { cn } from '@/lib/utils'

const field = 'mt-1.5 w-full rounded-xl border border-input bg-card px-3.5 py-3 text-base outline-none focus:border-gold focus:ring-3 focus:ring-gold/25'
const label = 'block text-sm font-semibold'

// Private page for Sakshi: makes a personal link to send a vendor after a call
export function LinkMaker() {
  const [form, setForm] = useState({
    passcode: store.get('vendor-passcode', ''),
    firstName: '',
    business: '',
    industry: '',
    situation: '',
    note: '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [link, setLink] = useState('')
  const [copied, setCopied] = useState<'link' | 'message' | ''>('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const message = `Hi ${form.firstName.trim() || 'there'}, great talking with you today. As promised, here's a page with what other owners say about working with me, and the documents I'll need when you're ready: ${link}\n\nSakshi`

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not make the link. Please try again.')
      store.set('vendor-passcode', form.passcode)
      setLink(`${location.origin}/v/${data.id}`)
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
    setForm(f => ({ ...f, firstName: '', business: '', industry: '', situation: '', note: '' }))
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">Private</p>
      <h1 className="mt-2 font-heading text-3xl font-bold">Make a vendor link</h1>
      <p className="mt-2 text-muted-foreground">Fill this in after a call. The vendor gets a short private link with their name and your note on it.</p>

      {link ? (
        <div className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
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
          <button onClick={reset} className="text-sm font-semibold text-navy underline decoration-gold underline-offset-4">Make another link</button>
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
              <select className={field} value={form.industry} onChange={set('industry')}>
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
            <textarea className={cn(field, 'min-h-32')} value={form.note} onChange={set('note')} maxLength={800}
              placeholder="e.g. I know timing matters because you want to retire next year. Here's what other owners say…" />
          </label>
          <label className={label}>Passcode
            <input className={field} type="password" value={form.passcode} onChange={set('passcode')} required autoComplete="current-password" />
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
