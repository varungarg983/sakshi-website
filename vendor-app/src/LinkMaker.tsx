import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { INDUSTRIES, SITUATIONS, type Industry } from '@/data/content'
import { isCustom, presetFor } from '@/data/documents'
import { API, store } from '@/lib/vendor'
import { cn } from '@/lib/utils'
import { DocPicker } from './maker/DocPicker'
import { NotesBox } from './maker/NotesBox'
import { Recent, type RecentLink } from './maker/Recent'
import { Result } from './maker/Result'
import { field, label } from './maker/styles'

const DRAFT_API = '/.netlify/functions/vendor-draft'
const EMPTY = { firstName: '', business: '', industry: '', situation: '', note: '', opening: '' }
type Form = typeof EMPTY

type Made = { id: string; form: Form; docs: string[] }

// Private page for Sakshi: makes a personal link and follow-up message for a vendor after a meeting
export function LinkMaker() {
  const [passcode, setPasscode] = useState(() => store.get('vendor-passcode', ''))
  const [notes, setNotes] = useState('')
  const [form, setForm] = useState<Form>(EMPTY)
  const [docs, setDocs] = useState<string[]>(() => presetFor())
  const [busy, setBusy] = useState(false)
  const [drafting, setDrafting] = useState(false)
  const [drafted, setDrafted] = useState(false)
  const [error, setError] = useState('')
  const [draftError, setDraftError] = useState('')
  const [made, setMade] = useState<Made | null>(null)

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  // Picking a type of business pre-ticks its usual documents, keeping any custom ones
  const setIndustry = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const industry = e.target.value as Industry | ''
    setForm(f => ({ ...f, industry }))
    setDocs(d => [...presetFor(industry), ...d.filter(isCustom)])
  }

  async function post(url: string, payload: object) {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, passcode }) })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
    store.set('vendor-passcode', passcode)
    return data
  }

  async function draft() {
    if (!passcode) {
      setDraftError('Enter your passcode at the bottom first.')
      return
    }
    setDrafting(true)
    setDraftError('')
    try {
      const d = await post(DRAFT_API, { notes })
      setForm(f => ({
        firstName: d.firstName || f.firstName,
        business: d.business || f.business,
        industry: d.industry || f.industry,
        situation: d.situation || f.situation,
        note: d.pageNote || f.note,
        opening: d.opening || f.opening,
      }))
      const industry = (d.industry || form.industry) as Industry | ''
      setDocs(cur => [...new Set([...(d.industry ? presetFor(industry) : cur.filter(x => !isCustom(x))), ...(d.extraDocs ?? []), ...cur.filter(isCustom)])])
      setDrafted(true)
    } catch (err) {
      setDraftError(err instanceof Error ? err.message : 'Could not draft from your notes.')
    } finally {
      setDrafting(false)
    }
  }

  async function create(e: React.FormEvent) {
    e.preventDefault()
    if (docs.length === 0) {
      setError('Pick at least one document to ask for.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const data = await post(API, { ...form, docs })
      setMade({ id: data.id, form, docs })
      window.scrollTo({ top: 0 })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not make the link.')
    } finally {
      setBusy(false)
    }
  }

  const openRecent = (l: RecentLink) => {
    setMade({
      id: l.id,
      form: { ...EMPTY, firstName: l.firstName, business: l.business ?? '', opening: l.opening ?? '' },
      docs: l.docs?.length ? l.docs : presetFor(l.industry as Industry),
    })
    window.scrollTo({ top: 0 })
  }

  const startNew = () => {
    setMade(null)
    setNotes('')
    setForm(EMPTY)
    setDocs(presetFor())
    setDrafted(false)
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <p className="text-[0.7rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">Private</p>
      <h1 className="display mt-2 text-5xl">Make a vendor <em>link</em></h1>
      <p className="mt-3 text-muted-foreground">After a meeting, talk through your notes and the AI drafts the rest. The vendor gets a private page and a message with the documents you need.</p>

      {made ? (
        <Result
          name={made.form.firstName}
          details={{ name: made.form.firstName, business: made.form.business, opening: made.form.opening, docs: made.docs, link: `${location.origin}/v/${made.id}` }}
          onNew={startNew}
        />
      ) : (
        <>
          <Recent passcode={passcode} onOpen={openRecent} />

          <form onSubmit={create} className="mt-6 space-y-5">
            <NotesBox notes={notes} setNotes={setNotes} onDraft={draft} drafting={drafting} drafted={drafted} />
            {draftError && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{draftError}</p>}
            {drafted && !draftError && <p className="rounded-lg bg-gold-soft px-3 py-2 text-sm">Drafted from your notes. Check the details below and change anything that’s not right.</p>}

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
            <label className={label}>Opening of your message <span className="font-normal text-muted-foreground">(after “Hi …”)</span>
              <textarea className={cn(field, 'min-h-20')} value={form.opening} onChange={set('opening')} maxLength={500}
                placeholder="e.g. It was lovely meeting you and your husband yesterday at your premises, Alif by Sensational Chicken." />
            </label>
            <label className={label}>Note at the top of their page <span className="font-normal text-muted-foreground">(optional)</span>
              <textarea className={cn(field, 'min-h-24')} value={form.note} onChange={set('note')} maxLength={800}
                placeholder="A short personal note they’ll see when they open the link." />
            </label>

            <DocPicker docs={docs} setDocs={setDocs} />

            <label className={label}>Passcode
              <input className={field} type="password" value={passcode} onChange={e => setPasscode(e.target.value)} required autoComplete="current-password" />
            </label>
            {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
            <Button type="submit" size="lg" className="h-12 w-full text-base" disabled={busy}>
              {busy && <Loader2 className="animate-spin" />} Make link and message
            </Button>
          </form>
        </>
      )}
    </main>
  )
}
