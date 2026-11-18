import { motion } from 'motion/react'
import { Star } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

// Fades content up as it scrolls into view
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function Section({ id, eyebrow, title, intro, children, className }: {
  id?: string
  eyebrow: string
  title: ReactNode
  intro?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section id={id} className={cn('mx-auto w-full max-w-3xl scroll-mt-6 px-4 py-14 sm:px-6 sm:py-20', className)}>
      <Reveal>
        <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-gold uppercase">{eyebrow}</p>
        <h2 className="font-heading text-3xl leading-tight font-bold text-balance sm:text-4xl">{title}</h2>
        {intro && <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{intro}</p>}
      </Reveal>
      <div className="mt-9">{children}</div>
    </section>
  )
}

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn('flex gap-0.5', className)} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} className={cn('size-4', n <= rating ? 'fill-gold text-gold' : 'text-border')} />
      ))}
    </div>
  )
}

// Uses /vendor/sakshi.jpg if it has been added, otherwise shows her initials
export function Portrait({ className }: { className?: string }) {
  const [failed, setFailed] = useState(false)
  return (
    <div className={cn('relative overflow-hidden rounded-full bg-gold/20 ring-2 ring-gold/60', className)}>
      {!failed ? (
        <img
          src={`${import.meta.env.BASE_URL}sakshi.jpg`}
          alt="Sakshi Aggarwal"
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="grid size-full place-items-center font-heading text-2xl font-bold text-gold">SA</span>
      )}
    </div>
  )
}

export const linkButton =
  'inline-flex items-center justify-center gap-2 rounded-full px-5 h-12 text-sm font-semibold transition-all active:translate-y-px focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-4'
