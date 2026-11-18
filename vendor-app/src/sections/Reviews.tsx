import { AnimatePresence, motion } from 'motion/react'
import { ExternalLink, Quote } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Section, Stars, Reveal, linkButton } from '@/components/common'
import { CONTACT, GOOGLE_STATS, INDUSTRIES, SITUATIONS, type Industry } from '@/data/content'
import { REVIEWS, type Review } from '@/data/reviews'
import type { Vendor } from '@/lib/vendor'
import { cn } from '@/lib/utils'

type Filter = 'all' | 'seller' | 'buyer' | Industry
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

export function Reviews({ vendor }: { vendor: Vendor | null }) {
  const [filter, setFilter] = useState<Filter>('all')
  const [shown, setShown] = useState(PAGE)

  const sorted = useMemo(
    () => REVIEWS.map((r, i) => ({ r, i })).sort((a, b) => score(b.r, vendor) - score(a.r, vendor) || a.i - b.i).map(x => x.r),
    [vendor],
  )
  const industries = useMemo(() => [...new Set(REVIEWS.map(r => r.industry))], [])
  const featured = sorted.find(r => isMatch(r, vendor)) ?? sorted[0]
  const rest = sorted.filter(r => r !== featured)
  const filtered = rest.filter(r => filter === 'all' || r.role === filter || r.industry === filter)

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'seller', label: 'Sellers' },
    { key: 'buyer', label: 'Buyers' },
    ...industries.filter(i => i !== 'other').map(i => ({ key: i as Filter, label: INDUSTRIES[i] })),
  ]

  const googleLink = (
    <a href={CONTACT.googleReviews} target="_blank" rel="noopener noreferrer"
      className={cn(linkButton, 'border border-border bg-card text-foreground hover:bg-muted')}>
      Read every review on Google <ExternalLink />
    </a>
  )

  return (
    <Section
      id="reviews"
      eyebrow="In their words"
      title="What other business owners say"
      intro="Real reviews from people I’ve helped buy and sell businesses. Don’t just take my word for it: you can read my reviews on Google too."
    >
      {GOOGLE_STATS.rating && (
        <Reveal className="mb-8 flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
          <span className="font-heading text-5xl font-bold">{GOOGLE_STATS.rating.toFixed(1)}</span>
          <div>
            <Stars rating={Math.round(GOOGLE_STATS.rating)} className="[&_svg]:size-5" />
            <p className="mt-1 text-sm text-muted-foreground">
              Google rating{GOOGLE_STATS.count ? `, ${GOOGLE_STATS.count} reviews` : ''}
            </p>
          </div>
        </Reveal>
      )}

      {featured ? (
        <>
          <Reveal>
            <figure className="relative overflow-hidden rounded-3xl bg-gold-soft p-7 sm:p-10">
              <Quote className="absolute top-5 right-6 size-16 text-gold/20" />
              {isMatch(featured, vendor) && (
                <p className="mb-4 inline-block rounded-full bg-gold px-3 py-1 text-xs font-semibold text-navy">
                  From an owner in a similar position
                </p>
              )}
              <Stars rating={featured.rating} />
              <blockquote className={cn('mt-4 font-heading leading-snug whitespace-pre-line', featured.text.length > 350 ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl')}>“{featured.text}”</blockquote>
              <figcaption className="mt-5 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{featured.name}</span> · {describe(featured)}
              </figcaption>
            </figure>
          </Reveal>

          {rest.length > 0 && (
            <>
              <div className="-mx-4 mt-10 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
                {filters.map(f => (
                  <button
                    key={f.key}
                    onClick={() => { setFilter(f.key); setShown(PAGE) }}
                    className={cn(
                      'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                      filter === f.key ? 'border-navy bg-navy text-white' : 'border-border bg-card hover:bg-muted',
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <motion.div layout className="mt-5 grid gap-4 sm:grid-cols-2">
                <AnimatePresence mode="popLayout">
                  {filtered.slice(0, shown).map(r => (
                    <motion.figure
                      layout
                      key={r.name + r.text.slice(0, 20)}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm"
                    >
                      <Stars rating={r.rating} />
                      <blockquote className="mt-3 flex-1 leading-relaxed whitespace-pre-line">“{r.text}”</blockquote>
                      <figcaption className="mt-4 text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{r.name}</span> · {describe(r)}
                      </figcaption>
                    </motion.figure>
                  ))}
                </AnimatePresence>
              </motion.div>
              {filtered.length === 0 && <p className="mt-5 text-muted-foreground">No reviews in this group yet.</p>}

              {filtered.length > shown && (
                <button onClick={() => setShown(s => s + PAGE)}
                  className="mt-6 w-full rounded-full border border-border py-3 text-sm font-semibold hover:bg-muted">
                  Show more reviews ({filtered.length - shown} more)
                </button>
              )}
            </>
          )}
          <div className="mt-8">{googleLink}</div>
        </>
      ) : (
        <Reveal className="rounded-2xl border border-border bg-card p-6">
          <p className="mb-5 text-muted-foreground">My reviews are all on my Google profile, where you can read them in full.</p>
          {googleLink}
        </Reveal>
      )}
    </Section>
  )
}

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
