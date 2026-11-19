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

// Cards in different colours slide in from the right as you scroll, tilting as they pass
const LOOKS = [
  { card: 'bg-navy text-white', sub: 'text-white/60', star: 'text-accent' },
  { card: 'bg-accent text-ink', sub: 'text-ink/60', star: 'text-gold' },
  { card: 'bg-card text-ink ring-1 ring-ink/10', sub: 'text-muted-foreground', star: 'text-gold' },
  { card: 'bg-gold-soft text-ink', sub: 'text-ink/60', star: 'text-gold' },
  { card: 'bg-ink text-background', sub: 'text-background/60', star: 'text-accent' },
]

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
  // Each card fills the screen when it reaches the middle
  const cardW = small ? vw - 32 : Math.min(vw - 160, 1100)
  const gap = small ? 24 : 80
  const step = cardW + gap
  const trackW = reviews.length * step - gap
  // The first card starts part-way in from the right; the strip ends with the last card in view
  const startX = vw * 0.55
  const endX = (vw - cardW) / 2 - (trackW - cardW)

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0.03, 0.97], [startX, endX])

  if (reduce) {
    return (
      <div className="flex snap-x gap-5 overflow-x-auto px-4 py-16">
        {reviews.map((r, i) => (
          <div key={r.name} className="snap-start">
            <CardBody r={r} i={i} width={cardW} match={isMatch(r, vendor)} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div ref={ref} style={{ height: `${Math.round(reviews.length * 100 + 40)}vh` }} className="relative">
      <div className="sticky top-0 flex h-dvh items-center overflow-hidden">
        <motion.div style={{ x, width: trackW }} className="relative flex shrink-0 items-center" aria-label="Reviews">
          {reviews.map((r, i) => (
            <SlideCard key={r.name} r={r} i={i} x={x} left={i * step} cardW={cardW} gap={gap} vw={vw} small={small} match={isMatch(r, vendor)} />
          ))}
        </motion.div>
      </div>
    </div>
  )
}

function SlideCard({ r, i, x, left, cardW, gap, vw, small, match }: {
  r: Review; i: number; x: MotionValue<number>; left: number; cardW: number; gap: number; vw: number; small: boolean; match: boolean
}) {
  // -1 at the left edge of the screen, 0 in the middle, 1 at the right edge
  const pos = useTransform(x, v => Math.max(-1.5, Math.min(1.5, (left + v + cardW / 2 - vw / 2) / (vw / 2))))
  const rotateY = useTransform(pos, p => p * -26)
  const rotate = useTransform(pos, p => p * (small ? 3 : 5))
  const scale = useTransform(pos, p => 1 - Math.min(Math.abs(p), 1.5) * 0.07)
  return (
    <motion.div
      style={{ rotateY, rotate, scale, transformPerspective: 1100, marginRight: gap }}
      className="shrink-0 last:!mr-0"
    >
      <CardBody r={r} i={i} width={cardW} match={match} />
    </motion.div>
  )
}

function CardBody({ r, i, width, match }: { r: Review; i: number; width: number; match: boolean }) {
  const look = LOOKS[i % LOOKS.length]
  const words = (
    <>
      {match && (
        <p className="mb-4 inline-block rounded-full bg-background px-3 py-1 text-xs font-semibold text-ink">From an owner in a similar position</p>
      )}
      <p className={cn('text-base sm:text-lg', look.star)} aria-label={`${r.rating} out of 5 stars`}>{'★'.repeat(r.rating)}</p>
      <blockquote className="display mt-5 text-[2.1rem] leading-[1.05] text-balance sm:text-5xl lg:text-6xl">“{r.pull}”</blockquote>
    </>
  )
  const caption = (
    <figcaption className="mt-8 text-sm sm:text-base">
      <span className="block text-base font-semibold sm:text-lg">{r.name}</span>
      <span className={look.sub}>{describe(r)}</span>
    </figcaption>
  )

  if (r.photo) {
    return (
      <figure style={{ width }} className="overflow-hidden rounded-[30px] bg-card shadow-xl shadow-ink/10">
        <img src={`${import.meta.env.BASE_URL}photos/reviews/${r.photo}`} alt={r.name} loading="lazy" className="h-[38dvh] w-full object-cover" />
        <div className={cn('relative -mt-10 mx-3 mb-3 rounded-[24px] p-6 sm:p-10', look.card)}>
          {words}
          {caption}
        </div>
      </figure>
    )
  }

  return (
    <figure style={{ width }} className={cn('flex h-[calc(100dvh-140px)] max-h-[720px] min-h-[420px] flex-col justify-between rounded-[30px] p-7 shadow-xl shadow-ink/10 sm:rounded-[40px] sm:p-14', look.card)}>
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
