import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Label, Reveal, btn } from '@/components/common'
import { CONTACT, INDUSTRIES, SITUATIONS, type Industry } from '@/data/content'
import { REVIEWS, type Review } from '@/data/reviews'
import type { Vendor } from '@/lib/vendor'
import { cn } from '@/lib/utils'

const SLIDE = 5
const PAGE = 4

// Reviews from owners in the same industry or situation come first
function score(r: Review, v: Vendor | null) {
  let s = r.role === 'seller' ? 1 : 0
  if (v?.industry && v.industry !== 'other' && r.industry === v.industry) s += 4
  if (v?.situation && r.situation === v.situation) s += 2
  return s
}
const isMatch = (r: Review, v: Vendor | null) =>
  !!v && ((!!v.industry && v.industry !== 'other' && r.industry === v.industry) || (!!v.situation && r.situation === v.situation))

const NOUN: Record<Industry, string> = {
  cafe: 'a café',
  hospitality: 'a restaurant or takeaway',
  cleaning: 'a cleaning business',
  retail: 'a retail business',
  service: 'a service business',
  other: 'a business',
}

function describe(r: Review) {
  const why = r.situation ? ` · ${SITUATIONS[r.situation]}` : ''
  if (!r.role) return r.industry === 'other' ? `Google review${why}` : `${INDUSTRIES[r.industry]}${why}`
  return `${r.role === 'seller' ? 'Sold' : 'Bought'} ${NOUN[r.industry]}${why}`
}

export function Reviews({ vendor }: { vendor: Vendor | null }) {
  const sorted = useMemo(
    () => REVIEWS.map((r, i) => ({ r, i })).sort((a, b) => score(b.r, vendor) - score(a.r, vendor) || a.i - b.i).map(x => x.r),
    [vendor],
  )

  return (
    <section id="reviews" className="scroll-mt-20">
      <div className="mx-auto max-w-4xl px-4 pt-24 text-center sm:pt-36">
        <Reveal>
          <Label>In their words</Label>
          <h2 className="display mt-5 text-5xl text-balance sm:text-7xl">
            What owners say <em>after</em> working with me.
          </h2>
        </Reveal>
      </div>

      {sorted.length > 0 && <ReviewSlide reviews={sorted.slice(0, SLIDE)} vendor={vendor} />}
      <AllReviews reviews={sorted} />
    </section>
  )
}

// Cards in different colours travel along a curved 3D path as you scroll (the same motion as wisprflow.ai):
// each one rises from the lower right, sits flat in the middle, then tips back and leaves to the upper left
const LOOKS = [
  { card: 'bg-navy text-white', sub: 'text-white/60', star: 'text-accent' },
  { card: 'bg-accent text-ink', sub: 'text-ink/60', star: 'text-gold' },
  { card: 'bg-card text-ink ring-1 ring-ink/10', sub: 'text-muted-foreground', star: 'text-gold' },
  { card: 'bg-gold-soft text-ink', sub: 'text-ink/60', star: 'text-gold' },
  { card: 'bg-ink text-background', sub: 'text-background/60', star: 'text-accent' },
]
// Wide and square cards, in the same rhythm as Wispr's
const WIDE = [true, false, false, true, false]
const MAX_TILT = 50

function useViewportWidth() {
  const [vw, setVw] = useState(() => window.innerWidth)
  useEffect(() => {
    const on = () => setVw(window.innerWidth)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return vw
}

function ReviewSlide({ reviews, vendor }: { reviews: Review[]; vendor: Vendor | null }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const vw = useViewportWidth()
  const small = vw < 640

  // Sizes taken from Wispr: 416 × 460 and 740 × 460 on desktop, screen width less 52px on phones
  const widths = reviews.map((_, i) => (small ? vw - 52 : WIDE[i % WIDE.length] ? Math.min(740, vw - 48) : 416))
  const gap = small ? 108 : 140
  const centres: number[] = []
  widths.forEach((w, i) => centres.push(i === 0 ? 0 : centres[i - 1] + widths[i - 1] / 2 + gap + w / 2))
  const distance = centres[centres.length - 1] ?? 0
  const path = small ? { radius: 220, reach: 360, perspective: 840 } : { radius: 480, reach: 800, perspective: 1900 }

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const travelled = useTransform(scrollYProgress, [0, 1], [0, distance])

  if (reduce) {
    return (
      <div className="flex snap-x gap-5 overflow-x-auto px-4 py-16">
        {reviews.map((r, i) => (
          <div key={r.name} className="snap-start">
            <CardBody r={r} i={i} width={widths[i]} small={small} match={isMatch(r, vendor)} />
          </div>
        ))}
      </div>
    )
  }

  return (
    // Cards move about one pixel for each pixel scrolled, as on Wispr
    <div ref={ref} style={{ height: `calc(100dvh + ${Math.round(distance)}px)` }} className="relative">
      <div className="sticky top-0 h-dvh overflow-hidden" style={{ perspective: path.perspective }} aria-label="Reviews">
        {reviews.map((r, i) => (
          <PathCard key={r.name} centre={centres[i]} travelled={travelled} path={path}>
            <CardBody r={r} i={i} width={widths[i]} small={small} match={isMatch(r, vendor)} />
          </PathCard>
        ))}
      </div>
    </div>
  )
}

function PathCard({ centre, travelled, path, children }: {
  centre: number
  travelled: MotionValue<number>
  path: { radius: number; reach: number }
  children: React.ReactNode
}) {
  const transform = useTransform(travelled, t => {
    const x = centre - t // >0: still to come (right), <0: gone past (left)
    const tilt = MAX_TILT * Math.tanh(Math.abs(x) / path.reach)
    const rad = (tilt * Math.PI) / 180
    const up = x < 0 ? -1 : 1
    const y = up * path.radius * Math.sin(rad)
    const z = -path.radius * (1 - Math.cos(rad))
    return `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateX(${(-up * tilt).toFixed(2)}deg)`
  })
  const zIndex = useTransform(travelled, t => 100 - Math.round(Math.abs(centre - t) / 50))
  return (
    <motion.div
      style={{ transform, zIndex, transformStyle: 'preserve-3d', backfaceVisibility: 'hidden', willChange: 'transform' }}
      className="absolute top-1/2 left-1/2"
    >
      {children}
    </motion.div>
  )
}

function CardBody({ r, i, width, small, match }: { r: Review; i: number; width: number; small: boolean; match: boolean }) {
  const look = LOOKS[i % LOOKS.length]
  const words = (
    <>
      {match && (
        <p className="mb-4 inline-block rounded-full bg-background px-3 py-1 text-xs font-semibold text-ink">From an owner in a similar position</p>
      )}
      <p className={cn('text-sm', look.star)} aria-label={`${r.rating} out of 5 stars`}>{'★'.repeat(r.rating)}</p>
      <blockquote className="display mt-4 text-[1.75rem] leading-[0.98] text-balance sm:text-[2rem]">“{r.pull}”</blockquote>
    </>
  )
  const caption = (
    <figcaption className="mt-6 text-sm">
      <span className="block font-semibold">{r.name}</span>
      <span className={look.sub}>{describe(r)}</span>
    </figcaption>
  )
  const size = { width, height: small ? undefined : 460 }

  if (r.photo) {
    const src = `${import.meta.env.BASE_URL}photos/reviews/${r.photo}`
    return (
      <figure style={size} className={cn('flex gap-4 overflow-hidden rounded-[48px] p-4', look.card, width > 600 ? 'flex-row' : 'flex-col')}>
        <div className="flex flex-1 flex-col justify-between p-4">
          <div>{words}</div>
          {caption}
        </div>
        <img src={src} alt={r.name} loading="lazy" className={cn('rounded-[36px] object-cover', width > 600 ? 'h-full w-[44%]' : 'h-56 w-full')} />
      </figure>
    )
  }

  return (
    <figure style={size} className={cn('flex min-h-[352px] flex-col justify-between rounded-[48px] p-8', look.card)}>
      <div>{words}</div>
      {caption}
    </figure>
  )
}

function AllReviews({ reviews }: { reviews: Review[] }) {
  const [shown, setShown] = useState(PAGE)
  const googleLink = (
    <a href={CONTACT.googleReviews} target="_blank" rel="noopener noreferrer" className={cn(btn.base, btn.ghost)}>
      Read them on Google <ArrowUpRight />
    </a>
  )
  return (
    <div className="mx-auto max-w-5xl px-4 pt-16 pb-8">
      <Reveal className="flex flex-col items-start justify-between gap-4 border-t border-ink/15 pt-8 sm:flex-row sm:items-end">
        <h3 className="display text-4xl">Every review, <em>in full.</em></h3>
        {googleLink}
      </Reveal>
      {reviews.length === 0 ? (
        <p className="mt-8 text-muted-foreground">My reviews are all on my Google profile.</p>
      ) : (
        <>
          <div className="mt-10 gap-10 sm:columns-2">
            <AnimatePresence initial={false}>
              {reviews.slice(0, shown).map(r => (
                <motion.figure
                  key={r.name}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-10 break-inside-avoid border-t border-border pt-5"
                >
                  <p className="text-sm text-gold" aria-label={`${r.rating} out of 5 stars`}>{'★'.repeat(r.rating)}</p>
                  <blockquote className="mt-3 text-[1.05rem] leading-relaxed whitespace-pre-line text-foreground/85">{r.text}</blockquote>
                  <figcaption className="mt-4 text-sm">
                    <span className="font-semibold">{r.name}</span>
                    <span className="text-muted-foreground"> · {describe(r)}</span>
                  </figcaption>
                </motion.figure>
              ))}
            </AnimatePresence>
          </div>
          {reviews.length > shown && (
            <button onClick={() => setShown(reviews.length)} className={cn(btn.base, btn.ghost, 'w-full')}>
              Show all reviews
            </button>
          )}
        </>
      )}
    </div>
  )
}
