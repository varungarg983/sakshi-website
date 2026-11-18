import { AnimatePresence, motion } from 'motion/react'
import { Check, Copy, Mail, MessageCircle, Paperclip, Phone } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Label, Photo, Reveal, btn } from '@/components/common'
import { CONTACT } from '@/data/content'
import { GROUPS, presetFor, resolveDocs, type DocGroup } from '@/data/documents'
import { buildEmail } from '@/lib/email'
import { store, type Vendor } from '@/lib/vendor'
import { cn } from '@/lib/utils'

export function Documents({ vendor, id }: { vendor: Vendor | null; id: string | null }) {
  // The documents Sakshi picked for this vendor, or the usual set for their type of business
  const items = useMemo(() => resolveDocs(vendor?.docs?.length ? vendor.docs : presetFor(vendor?.industry)), [vendor])
  const groups = (Object.entries(GROUPS) as [DocGroup, string][])
    .map(([g, name]) => ({ name, docs: items.filter(d => d.group === g) }))
    .filter(g => g.docs.length)
  const key = `vendor-docs-v2-${id ?? 'general'}`
  const [ticked, setTicked] = useState<Set<string>>(() => new Set(store.get<string[]>(key, [])))
  const [copied, setCopied] = useState(false)

  // Works from the latest state, so quick taps in a row all register
  const toggle = (item: string) =>
    setTicked(prev => {
      const next = new Set(prev)
      if (next.has(item)) next.delete(item)
      else next.add(item)
      store.set(key, [...next])
      return next
    })

  const done = items.filter(d => ticked.has(d.id)).length
  const email = buildEmail(vendor ?? {}, items, ticked)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`To: ${CONTACT.email}\nSubject: ${email.subject}\n\n${email.body}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <section id="documents" className="scroll-mt-20 mx-auto grid max-w-5xl gap-12 px-4 py-24 sm:py-32 md:grid-cols-[1fr_1.2fr]">
      <Reveal>
        <div className="md:sticky md:top-28">
          <Label>When you’re ready</Label>
          <h2 className="display mt-5 text-5xl text-balance sm:text-7xl">
            What to <em>send me.</em>
          </h2>
          <p className="mt-6 max-w-sm text-lg leading-relaxed text-muted-foreground">
            No rush. Tick what you have, tap the button, and your email is written for you. Send what you have now and the rest later.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="overflow-hidden rounded-[28px] border-[1.5px] border-ink/15 bg-card">
          <div className="flex items-baseline justify-between px-6 pt-6">
            <span className="font-heading text-2xl"><span className="italic">{done}</span> of {items.length} ready</span>
            <AnimatePresence>
              {done === items.length && (
                <motion.span initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm font-semibold text-gold">
                  All ready to send
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="mx-6 mt-3 h-1 overflow-hidden rounded-full bg-muted">
            <motion.div className="h-full rounded-full bg-ink" animate={{ width: `${(done / items.length) * 100}%` }} transition={{ type: 'spring', stiffness: 140, damping: 22 }} />
          </div>

          <div className="mt-4">
            {groups.map(g => (
              <div key={g.name}>
                <p className="border-t border-border bg-muted/40 px-6 py-2 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">{g.name}</p>
                <ul>
                  {g.docs.map(d => {
                    const on = ticked.has(d.id)
                    return (
                      <li key={d.id} className="border-t border-border">
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={on}
                          onClick={() => toggle(d.id)}
                          className="flex w-full items-start gap-4 px-6 py-4 text-left transition-colors hover:bg-muted/60"
                        >
                          <span className={cn('mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-[1.5px] transition-all', on ? 'border-ink bg-ink text-background' : 'border-ink/30')}>
                            <motion.span initial={false} animate={{ scale: on ? 1 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 28 }}>
                              <Check className="size-3.5" strokeWidth={3} />
                            </motion.span>
                          </span>
                          <span>
                            <span className={cn('block leading-snug transition-colors', on && 'text-muted-foreground')}>{d.label}</span>
                            {d.hint && <span className="mt-0.5 block text-sm leading-snug text-muted-foreground">{d.hint}</span>}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>

          <div className="space-y-3 border-t border-border bg-muted/50 p-6">
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex gap-2"><Paperclip className="mt-0.5 size-4 shrink-0" />Your email opens with the list written for you. Just attach the files you’ve ticked and press send.</li>
              <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0" />PDFs, screenshots and phone photos are all fine. No need to scan anything.</li>
              <li className="flex gap-2"><Mail className="mt-0.5 size-4 shrink-0" />Lots of files? Send them over a few emails. Each one will show what’s still to come.</li>
            </ul>
            <a href={email.mailto} className={cn(btn.base, btn.accent, 'w-full')}>
              <Mail /> Email {CONTACT.firstName} my documents
            </a>
            <div className="grid grid-cols-2 gap-3">
              <a href={email.gmail} target="_blank" rel="noopener noreferrer" className={cn(btn.base, btn.ghost, 'px-3 text-sm')}>
                Open in Gmail
              </a>
              <button onClick={copy} className={cn(btn.base, btn.ghost, 'px-3 text-sm')}>
                {copied ? <><Check /> Copied</> : <><Copy /> Copy the list</>}
              </button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

export function Contact({ vendor }: { vendor: Vendor | null }) {
  const name = vendor?.firstName?.trim()
  return (
    <div className="pb-3 sm:px-3">
      <div className="overflow-hidden rounded-[28px] bg-navy text-white">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-5 pt-16 pb-16 sm:pt-24 md:grid-cols-[0.8fr_1fr] md:gap-14">
          <Reveal>
            <div className="aspect-[4/5] overflow-hidden rounded-[22px]">
              <Photo name="headshot" alt="Sakshi Aggarwal smiling" className="object-[50%_30%]" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="display text-6xl text-balance sm:text-8xl">
              Talk soon{name ? <>, <em>{name}.</em></> : <em>.</em>}
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-white/70">
              If anything’s worrying you, or you’d just like to talk it through, I’m a phone call away. No question is too small.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href={CONTACT.phoneLink} className={cn(btn.base, btn.accent, 'border-accent')}><Phone /> {CONTACT.phoneDisplay}</a>
              <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className={cn(btn.base, btn.light)}><MessageCircle /> WhatsApp</a>
              <a href={`mailto:${CONTACT.email}`} className={cn(btn.base, btn.light)}><Mail /> Email</a>
            </div>
          </Reveal>
        </div>
        <footer className="mx-auto max-w-4xl border-t border-white/10 px-5 py-8 pb-28 text-center text-xs leading-relaxed text-white/45 sm:pb-8">
          <p>{CONTACT.name}, {CONTACT.role}, {CONTACT.company}. {CONTACT.legalLine}</p>
          <p className="mt-2">This page is just for you. Our conversations are confidential.</p>
        </footer>
      </div>
    </div>
  )
}

// Always-visible bar on phones so getting in touch is one tap away
export function StickyBar() {
  const item = 'flex flex-1 items-center justify-center gap-1.5 rounded-full py-3 text-sm font-semibold active:bg-white/10 [&_svg]:size-4'
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 1.5, type: 'spring', stiffness: 160, damping: 22 }}
      className="fixed inset-x-3 bottom-3 z-50 flex gap-1 rounded-full bg-ink p-1.5 text-background shadow-2xl sm:hidden"
      aria-label="Contact Sakshi"
    >
      <a href={CONTACT.phoneLink} className={cn(item, 'bg-accent text-ink active:bg-accent-strong')}><Phone />Call</a>
      <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className={item}><MessageCircle />WhatsApp</a>
      <a href="#documents" className={item}><Paperclip />Documents</a>
    </motion.nav>
  )
}
