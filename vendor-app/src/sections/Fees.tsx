import { AnimatePresence, motion, useSpring, useTransform } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Label, Reveal } from '@/components/common'
import { COMMISSION_TERMS, COMMISSION_TITLE, FEES, calculateFee } from '@/data/content'
import { cn } from '@/lib/utils'

const money = (n: number) =>
  n.toLocaleString('en-NZ', { style: 'currency', currency: 'NZD', maximumFractionDigits: 0 })
const pct = (n: number) => `${Math.round(n * 100)}%`

const MIN_PRICE = 100_000
const MAX_PRICE = 3_000_000
const STEP = 25_000

// A dollar figure that rolls smoothly to its new value
function Money({ value, className }: { value: number; className?: string }) {
  const spring = useSpring(value, { stiffness: 120, damping: 24 })
  const text = useTransform(spring, v => money(Math.round(v)))
  useEffect(() => spring.set(value), [spring, value])
  return <motion.span className={className}>{text}</motion.span>
}

export function Fees() {
  const [price, setPrice] = useState<number | null>(null)
  const [typed, setTyped] = useState('')
  const [showTerms, setShowTerms] = useState(false)
  const fee = price ? calculateFee(price) : null

  const onType = (raw: string) => {
    const digits = raw.replace(/[^\d]/g, '').slice(0, 9)
    const n = Number(digits)
    setTyped(digits ? n.toLocaleString('en-NZ') : '')
    setPrice(n > 0 ? n : null)
  }
  const onSlide = (n: number) => {
    setPrice(n)
    setTyped(n.toLocaleString('en-NZ'))
  }

  const rows = fee && [
    { label: 'Upfront fee', note: 'Paid when you sign the agency agreement. Covers AML/CFT checks and starts your marketing. Non-refundable.', value: FEES.upfront },
    { label: `${pct(FEES.firstRate)} of the first ${money(FEES.firstBand)}`, value: fee.first },
    ...(fee.second > 0 ? [{ label: `${pct(FEES.secondRate)} of the amount above ${money(FEES.firstBand)}`, value: fee.second }] : []),
    ...(fee.minimumApplied
      ? [{ label: 'Minimum fee top-up', note: `The ${pct(FEES.firstRate)} and ${pct(FEES.secondRate)} parts together have a minimum of ${money(FEES.minimumSuccessFee)}.`, value: fee.successFee - fee.first - fee.second }]
      : []),
  ]

  return (
    <section className="mx-auto grid max-w-5xl gap-12 px-4 py-24 sm:py-32 md:grid-cols-[1fr_1.2fr]">
      <Reveal>
        <div className="md:sticky md:top-28">
          <Label>No surprises</Label>
          <h2 className="display mt-5 text-5xl text-balance sm:text-7xl">
            How my fee <em>works.</em>
          </h2>
          <p className="mt-6 max-w-sm text-lg leading-relaxed text-muted-foreground">
            Clear from day one. Type in a sale price to see what the commission would be. You only pay the main fee when your business sells.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="overflow-hidden rounded-[28px] border-[1.5px] border-ink/15 bg-card">
          <div className="p-6">
            <label htmlFor="sale-price" className="text-sm font-semibold">If your business sold for</label>
            <div className="mt-2 flex items-center rounded-2xl border-[1.5px] border-ink/15 px-4 focus-within:border-ink">
              <span className="font-heading text-3xl text-muted-foreground">$</span>
              <input
                id="sale-price"
                inputMode="numeric"
                autoComplete="off"
                placeholder="Sale price"
                value={typed}
                onChange={e => onType(e.target.value)}
                className="w-full bg-transparent px-2 py-3 font-heading text-3xl outline-none placeholder:text-muted-foreground/50"
              />
            </div>
            <input
              type="range"
              min={MIN_PRICE}
              max={MAX_PRICE}
              step={STEP}
              value={Math.min(Math.max(price ?? MIN_PRICE, MIN_PRICE), MAX_PRICE)}
              onChange={e => onSlide(Number(e.target.value))}
              aria-label="Sale price"
              className="mt-5 w-full accent-[var(--foreground)]"
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>{money(MIN_PRICE)}</span>
              <span>{money(MAX_PRICE)}+</span>
            </div>
          </div>

          {fee && rows ? (
            <>
              <ul className="border-t border-border">
                {rows.map(r => (
                  <li key={r.label} className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
                    <span>
                      <span className="block">{r.label}</span>
                      {'note' in r && r.note && <span className="mt-0.5 block text-sm text-muted-foreground">{r.note}</span>}
                    </span>
                    <Money value={r.value} className="shrink-0 tabular-nums" />
                  </li>
                ))}
                <li className="flex justify-between gap-4 border-b border-border px-6 py-4 font-semibold">
                  <span>Total, excluding GST</span>
                  <Money value={fee.totalExGst} className="tabular-nums" />
                </li>
                <li className="flex justify-between gap-4 px-6 py-4 text-muted-foreground">
                  <span>GST ({pct(FEES.gst)})</span>
                  <Money value={fee.gst} className="tabular-nums" />
                </li>
              </ul>
              <div className="flex items-baseline justify-between gap-4 bg-navy px-6 py-6 text-white">
                <span className="font-semibold">Total, including GST</span>
                <Money value={fee.totalIncGst} className="font-heading text-4xl tabular-nums" />
              </div>
            </>
          ) : (
            <p className="border-t border-border px-6 py-8 text-muted-foreground">Type a price or move the slider to see the breakdown.</p>
          )}

          <p className={cn('px-6 py-4 text-xs leading-relaxed text-muted-foreground', fee && 'bg-muted/50')}>
            An estimate only, based on the sale price in the Sale and Purchase Agreement. The exact fee is set out in your agency agreement with Clyth MacLeod Business Sales. The minimum total commission is {money(FEES.upfront + FEES.minimumSuccessFee)} plus GST.
          </p>

          <div className="border-t border-border">
            <button
              type="button"
              aria-expanded={showTerms}
              onClick={() => setShowTerms(v => !v)}
              className="flex w-full items-center justify-between gap-3 px-6 py-4 text-left text-sm font-semibold hover:bg-muted/60"
            >
              Read the full commission wording
              <ChevronDown className={cn('size-4 shrink-0 transition-transform duration-300', showTerms && 'rotate-180')} />
            </button>
            <AnimatePresence initial={false}>
              {showTerms && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 px-6 pb-6 text-sm leading-relaxed">
                    <p className="font-semibold">{COMMISSION_TITLE}</p>
                    {COMMISSION_TERMS.map(t => <p key={t} className="text-foreground/80">{t}</p>)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
