import { motion } from 'motion/react'
import { Check, Copy, Mail, MessageCircle, Paperclip, Phone } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Reveal, Section, linkButton } from '@/components/common'
import { CONTACT, DOCUMENTS_BASE, DOCUMENTS_BY_INDUSTRY } from '@/data/content'
import { buildEmail } from '@/lib/email'
import { store, type Vendor } from '@/lib/vendor'
import { cn } from '@/lib/utils'

export function Documents({ vendor, id }: { vendor: Vendor | null; id: string | null }) {
  const items = useMemo(
    () => [...DOCUMENTS_BASE, ...((vendor?.industry && DOCUMENTS_BY_INDUSTRY[vendor.industry]) || [])],
    [vendor],
  )
  const key = `vendor-docs-${id ?? 'general'}`
  const [ticked, setTicked] = useState<Set<string>>(() => new Set(store.get<string[]>(key, [])))
  const [copied, setCopied] = useState(false)

  const toggle = (item: string, on: boolean) => {
    const next = new Set(ticked)
    if (on) next.add(item)
    else next.delete(item)
    setTicked(next)
    store.set(key, [...next])
  }

  const done = items.filter(i => ticked.has(i)).length
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
    <Section
      id="documents"
      eyebrow="When you’re ready"
      title="What to send me"
      intro="No rush. Tick off what you have, and tap the button. Your email will be written for you with this list already in it. Send what you have now, and the rest later."
    >
      <Reveal>
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="border-b border-border p-5 sm:p-6">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-semibold">{done} of {items.length} ready</span>
              {done === items.length && <span className="font-semibold text-gold">All ready to send</span>}
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-gold"
                animate={{ width: `${(done / items.length) * 100}%` }}
                transition={{ type: 'spring', stiffness: 140, damping: 22 }}
              />
            </div>
          </div>

          <ul className="divide-y divide-border">
            {items.map(item => {
              const on = ticked.has(item)
              return (
                <li key={item}>
                  <label className={cn('flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors sm:px-6', on && 'bg-gold-soft/60')}>
                    <Checkbox checked={on} onCheckedChange={v => toggle(item, !!v)} className="size-5" />
                    <span className={cn('leading-snug', on && 'text-muted-foreground line-through decoration-gold/60')}>{item}</span>
                  </label>
                </li>
              )
            })}
          </ul>

          <div className="space-y-3 bg-muted/50 p-5 sm:p-6">
            <p className="flex gap-2 text-sm text-muted-foreground">
              <Paperclip className="mt-0.5 size-4 shrink-0" />
              Your email app will open with everything written. Just attach the files you’ve ticked and press send.
            </p>
            <a href={email.mailto} className={cn(linkButton, 'w-full bg-navy text-white hover:bg-navy/90')}>
              <Mail /> Email {CONTACT.firstName} my documents
            </a>
            <div className="grid grid-cols-2 gap-3">
              <a href={email.gmail} target="_blank" rel="noopener noreferrer"
                className={cn(linkButton, 'border border-border bg-card px-3 hover:bg-muted')}>
                Open in Gmail
              </a>
              <button onClick={copy} className={cn(linkButton, 'border border-border bg-card px-3 hover:bg-muted')}>
                {copied ? <><Check /> Copied</> : <><Copy /> Copy the list</>}
              </button>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}

export function Contact() {
  return (
    <div className="bg-navy text-white">
      <Section
        eyebrow="Any questions?"
        title="I’m a phone call away"
        intro={<span className="text-white/75">If anything is worrying you, or you’d just like to talk it through, get in touch. No question is too small.</span>}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <a href={CONTACT.phoneLink} className={cn(linkButton, 'bg-gold text-navy hover:bg-gold/90')}><Phone /> Call {CONTACT.phoneDisplay}</a>
          <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className={cn(linkButton, 'border border-white/25 hover:bg-white/10')}><MessageCircle /> WhatsApp</a>
          <a href={`mailto:${CONTACT.email}`} className={cn(linkButton, 'border border-white/25 hover:bg-white/10')}><Mail /> Email</a>
        </div>
      </Section>
      <footer className="mx-auto max-w-3xl border-t border-white/10 px-4 py-8 pb-28 text-xs leading-relaxed text-white/50 sm:px-6 sm:pb-8">
        <p>{CONTACT.name}, {CONTACT.role}, {CONTACT.company}. {CONTACT.legalLine}</p>
        <p className="mt-2">This page is just for you. Our conversations are confidential.</p>
      </footer>
    </div>
  )
}

// Always-visible bar on phones so getting in touch is one tap away
export function StickyBar() {
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 1.2, type: 'spring', stiffness: 160, damping: 22 }}
      className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-3 gap-1 rounded-2xl border border-white/10 bg-navy/95 p-1.5 text-white shadow-xl backdrop-blur sm:hidden"
      aria-label="Contact Sakshi"
    >
      <a href={CONTACT.phoneLink} className="flex flex-col items-center gap-0.5 rounded-xl py-2 text-xs font-medium active:bg-white/10"><Phone className="size-5 text-gold" />Call</a>
      <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-0.5 rounded-xl py-2 text-xs font-medium active:bg-white/10"><MessageCircle className="size-5 text-gold" />WhatsApp</a>
      <a href="#documents" className="flex flex-col items-center gap-0.5 rounded-xl py-2 text-xs font-medium active:bg-white/10"><Paperclip className="size-5 text-gold" />Documents</a>
    </motion.nav>
  )
}
