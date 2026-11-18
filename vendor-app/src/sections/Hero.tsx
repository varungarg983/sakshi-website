import { motion } from 'motion/react'
import { ArrowDown, FileCheck2, Languages, ShieldCheck, Zap } from 'lucide-react'
import { Portrait, linkButton } from '@/components/common'
import { CONTACT, GOOGLE_STATS, LANGUAGES } from '@/data/content'
import type { Vendor } from '@/lib/vendor'
import { cn } from '@/lib/utils'

const DEFAULT_NOTE =
  'As promised, I’ve put together a few things for you to look through in your own time: what other business owners say about working with me, how I keep your sale confidential, and the documents I’ll need when you’re ready.'

export function Hero({ vendor }: { vendor: Vendor | null }) {
  const name = vendor?.firstName?.trim()
  const note = vendor?.note?.trim() || DEFAULT_NOTE

  const highlights = [
    GOOGLE_STATS.rating && { icon: '★', text: `${GOOGLE_STATS.rating.toFixed(1)} on Google${GOOGLE_STATS.count ? ` from ${GOOGLE_STATS.count} reviews` : ''}` },
    { icon: <Zap />, text: 'Café sold in one week' },
    { icon: <ShieldCheck />, text: 'Businesses sold before listing' },
    { icon: <Languages />, text: LANGUAGES.join(', ') },
  ].filter(Boolean) as { icon: React.ReactNode; text: string }[]

  return (
    <header className="relative overflow-hidden bg-navy text-white">
      <div className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-gold/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 size-80 rounded-full bg-white/5 blur-3xl" />

      <div className="relative mx-auto max-w-3xl px-4 pt-8 pb-14 sm:px-6 sm:pt-12 sm:pb-20">
        <div className="flex items-center gap-3">
          <Portrait className="size-12" />
          <div className="leading-tight">
            <p className="font-semibold">{CONTACT.name}</p>
            <p className="text-sm text-white/65">{CONTACT.role}, {CONTACT.company}</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mt-12 text-xs font-semibold tracking-[0.18em] text-gold uppercase">Following up from our call</p>
          <h1 className="mt-3 font-heading text-4xl leading-[1.1] font-bold text-balance sm:text-6xl">
            {name ? <>Hi {name}, thanks for your time today.</> : <>Thanks for your time today.</>}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed whitespace-pre-line text-white/80">{note}</p>
          <p className="mt-5 font-heading text-xl text-gold italic">— {CONTACT.firstName}</p>
        </motion.div>

        <motion.ul
          className="mt-10 flex flex-wrap gap-2"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.4 } } }}
        >
          {highlights.map(h => (
            <motion.li
              key={h.text}
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white/90 [&_svg]:size-4 [&_svg]:text-gold"
            >
              <span className="text-gold">{h.icon}</span>
              {h.text}
            </motion.li>
          ))}
        </motion.ul>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a href="#reviews" className={cn(linkButton, 'bg-gold text-navy hover:bg-gold/90')}>
            Read what clients say <ArrowDown />
          </a>
          <a href="#documents" className={cn(linkButton, 'border border-white/25 text-white hover:bg-white/10')}>
            <FileCheck2 /> Send me your documents
          </a>
        </div>
      </div>
    </header>
  )
}
