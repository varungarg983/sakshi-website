import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Label, Reveal, btn } from '@/components/common'
import { CONTACT, INDUSTRIES, SITUATIONS, type Industry } from '@/data/content'
import { REVIEWS, type Review } from '@/data/reviews'
import type { Vendor } from '@/lib/vendor'
import { cn } from '@/lib/utils'

const STORY = 5
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
  const story = sorted.slice(0, STORY)

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

      {story.length > 0 && <ReviewStory story={story} vendor={vendor} />}
      <AllReviews reviews={sorted} />
    </section>
  )
}

// The section pins in place while you scroll, and the quote changes with each step
function ReviewStory({ story, vendor }: { story: Review[]; vendor: Vendor | null }) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', p => setActive(Math.min(story.length - 1, Math.max(0, Math.floor(p * story.length)))))

  const jump = (i: number) => {
    const el = ref.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    const span = el.offsetHeight - window.innerHeight
    window.scrollTo({ top: top + (span * (i + 0.5)) / story.length, behavior: 'smooth' })
  }

  const r = story[active]
  return (
    <div ref={ref} style={{ height: `${story.length * 75 + 25}vh` }} className="relative">
      <div className="sticky top-0 flex h-dvh items-center">
        <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 md:grid-cols-[220px_1fr] md:gap-12">
          <ol className="hidden flex-col justify-center gap-1 md:flex">
            {story.map((s, i) => (
              <li key={s.name}>
                <button
                  onClick={() => jump(i)}
                  className={cn(
                    'w-full border-l-2 py-2 pl-4 text-left font-heading text-xl transition-colors',
                    i === active ? 'border-ink text-ink' : 'border-border text-muted-foreground hover:text-ink',
                  )}
                >
                  {s.name}
                </button>
              </li>
            ))}
          </ol>

          <div className="relative flex min-h-[460px] flex-col overflow-hidden rounded-[28px] bg-navy p-7 text-white sm:min-h-[520px] sm:p-12">
            <div className="flex gap-1.5 md:hidden">
              {story.map((_, i) => (
                <button key={i} onClick={() => jump(i)} aria-label={`Review ${i + 1}`} className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
                  <span className={cn('block h-full bg-accent transition-all duration-500', i <= active ? 'w-full' : 'w-0')} />
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.figure
                key={active}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-1 flex-col justify-between pt-8 md:pt-0"
              >
                <div>
                  {isMatch(r, vendor) && (
                    <p className="mb-6 inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold text-ink">
                      From an owner in a similar position
                    </p>
                  )}
                  <p className="text-accent" aria-label="5 out of 5 stars">{'★'.repeat(r.rating)}</p>
                  <blockquote className="display mt-5 text-[2.1rem] leading-[1.05] text-balance sm:text-5xl">“{r.pull}”</blockquote>
                </div>
                <figcaption className="mt-8 flex items-end justify-between gap-4 text-sm">
                  <span>
                    <span className="block text-base font-semibold">{r.name}</span>
                    <span className="text-white/60">{describe(r)}</span>
                  </span>
                  <span className="font-heading text-lg text-white/50 italic">{active + 1} / {story.length}</span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
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
              Show all {reviews.length} reviews
            </button>
          )}
        </>
      )}
    </div>
  )
}
