import { motion } from 'motion/react'
import { Phone } from 'lucide-react'
import { Marquee, Photo, Portrait, QuoteRibbon, btn } from '@/components/common'
import { CONTACT, LANGUAGES } from '@/data/content'
import { REVIEWS } from '@/data/reviews'
import { displayName } from '@/lib/messages'
import type { Vendor } from '@/lib/vendor'
import { cn } from '@/lib/utils'

const DEFAULT_NOTE =
  'As promised, here’s what other owners say about working with me, how I keep your sale private, and what I’ll need from you when you’re ready. Read it in your own time.'

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as const },
})

export function TopBar() {
  return (
    <div className="sticky top-3 z-40 mx-auto w-[calc(100%-24px)] max-w-5xl">
      <div className="flex items-center justify-between rounded-2xl border border-border bg-background/85 py-2 pr-2 pl-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <Portrait className="size-8 text-sm" />
          <span className="text-sm font-semibold">{CONTACT.name}</span>
          <span className="hidden text-sm text-muted-foreground sm:inline">· {CONTACT.company}</span>
        </div>
        <a href={CONTACT.phoneLink} className={cn(btn.base, btn.accent, 'h-9 px-4 text-sm')}>
          <Phone /> Call me
        </a>
      </div>
    </div>
  )
}

export function Hero({ vendor }: { vendor: Vendor | null }) {
  const name = displayName(vendor?.firstName)
  const note = vendor?.note?.trim() || DEFAULT_NOTE
  const allFive = REVIEWS.length > 0 && REVIEWS.every(r => r.rating === 5)

  const proof = [
    'Businesses sold before listing',
    allFive ? 'Five-star Google reviews' : 'Real Google reviews',
    `Speaks ${LANGUAGES.join(', ')}`,
    'Accounting degree, AUT',
    'Licensed under REAA 2008',
  ]

  return (
    <header className="relative">
      <div className="mx-auto max-w-4xl px-4 pt-16 text-center sm:pt-24">
        <motion.div {...rise(0)}>
          <p className="text-[0.7rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">A note after our call</p>
        </motion.div>
        <motion.h1 {...rise(0.08)} className="display mt-6 text-[3.6rem] text-balance sm:text-[6.5rem]">
          {name ? <>Hi {name}, <em>thanks for</em> your time.</> : <>Thanks for <em>your time</em> today.</>}
        </motion.h1>
        <motion.p {...rise(0.2)} className="mx-auto mt-8 max-w-xl text-lg leading-relaxed font-medium whitespace-pre-line text-foreground/80 sm:text-xl">
          {note}
        </motion.p>
        <motion.p {...rise(0.28)} className="mt-5 font-heading text-3xl italic">Sakshi</motion.p>
        <motion.div {...rise(0.36)} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="#reviews" className={cn(btn.base, btn.accent)}>Read what owners say</a>
          <a href="#documents" className={cn(btn.base, btn.ghost)}>What to send me</a>
        </motion.div>
      </div>

      <div className="relative mt-14 sm:mt-20">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto aspect-[4/5] w-[calc(100%-32px)] max-w-5xl overflow-hidden rounded-[28px] sm:aspect-[16/9]"
        >
          <Photo name="meeting-table" eager alt="Sakshi smiling across the table during a meeting" className="object-[62%_center]" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1.2 }}
          className="relative -mt-[90px] h-[150px] overflow-hidden sm:-mt-[150px] sm:h-[230px]"
        >
          <QuoteRibbon className="absolute inset-0 h-full" phrases={REVIEWS.slice(0, 6).map(r => `“${r.pull}”`)} />
        </motion.div>
      </div>

      <div className="mt-6">
        <Marquee items={proof} />
      </div>
    </header>
  )
}
