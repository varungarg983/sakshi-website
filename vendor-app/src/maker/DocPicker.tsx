import { Check, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CUSTOM_PREFIX, DOCUMENTS, GROUPS, isCustom, type DocGroup } from '@/data/documents'
import { cn } from '@/lib/utils'
import { field } from './styles'

const MAX_CUSTOM = 10

export function DocPicker({ docs, setDocs }: { docs: string[]; setDocs: React.Dispatch<React.SetStateAction<string[]>> }) {
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
