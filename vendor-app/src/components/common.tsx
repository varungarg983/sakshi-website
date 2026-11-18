import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

// Fades content up as it scrolls into view
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-[0.7rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase', className)}>{children}</p>
}

// Sakshi's face, cropped from a photo; falls back to her initials
export function Portrait({ className }: { className?: string }) {
  const [failed, setFailed] = useState(false)
  return (
    <div className={cn('relative overflow-hidden rounded-full bg-accent', className)}>
      {!failed ? (
        <img src={`${import.meta.env.BASE_URL}photos/portrait.jpg`} alt="Sakshi Aggarwal" className="size-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <span className="grid size-full place-items-center font-heading text-[1.1em] italic">SA</span>
      )}
    </div>
  )
}

// Pill buttons: dark-bordered accent, like a printed label
export const btn = {
  base: 'inline-flex items-center justify-center gap-2 rounded-full h-12 px-6 text-[0.95rem] font-semibold transition-all active:translate-y-px focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 [&_svg]:size-4',
  accent: 'border-[1.5px] border-ink bg-accent text-ink hover:bg-accent-strong',
  ghost: 'border-[1.5px] border-ink/15 text-ink hover:border-ink/40',
  light: 'border-[1.5px] border-white/25 text-white hover:border-white/60',
}

// A dark ribbon along a curve with words drifting along it
export function QuoteRibbon({ phrases, className }: { phrases: string[]; className?: string }) {
  const id = useId().replace(/:/g, '')
  const textRef = useRef<SVGTextPathElement>(null)
  const unitRef = useRef<SVGTSpanElement>(null)
  const reduce = useReducedMotion()
  const line = phrases.join('   ·   ') + '   ·   '

  useEffect(() => {
    if (reduce) return
    let frame = 0
    let offset = 0
    let last = performance.now()
    const tick = (now: number) => {
      const unit = unitRef.current?.getComputedTextLength() || 1
      offset = (offset + (now - last) * 0.045) % unit
      last = now
      textRef.current?.setAttribute('startOffset', String(-offset))
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [reduce])

  const d = 'M -40 150 C 260 40, 520 40, 760 120 S 1180 230, 1480 70'
  return (
    <svg viewBox="0 0 1440 240" className={cn('w-full overflow-visible', className)} aria-hidden preserveAspectRatio="xMidYMid slice">
      <path id={`ribbon-${id}`} d={d} fill="none" />
      <path d={d} fill="none" stroke="var(--foreground)" strokeWidth="38" strokeLinecap="round" />
      <text className="fill-background font-sans text-[17px] font-medium" dy="6">
        <textPath ref={textRef} href={`#ribbon-${id}`}>
          <tspan ref={unitRef}>{line}</tspan>
          {line}
          {line}
          {line}
        </textPath>
      </text>
    </svg>
  )
}

export function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items]
  return (
    <div className="overflow-hidden border-y border-border py-5 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
      <div className="marquee flex w-max gap-12">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-12 font-heading text-2xl whitespace-nowrap italic sm:text-3xl">
            {t}
            <span className="text-gold not-italic">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// A photo with a smaller WebP version for browsers that support it
export function Photo({ name, alt, className, eager }: { name: string; alt: string; className?: string; eager?: boolean }) {
  const base = `${import.meta.env.BASE_URL}photos/${name}`
  return (
    <picture>
      <source srcSet={`${base}.webp`} type="image/webp" />
      <img src={`${base}.jpg`} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" className={cn('size-full object-cover', className)} />
    </picture>
  )
}
