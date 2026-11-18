import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { useRef } from 'react'
import { Label, Photo, Portrait, Reveal } from '@/components/common'
import { CONFIDENTIALITY, CONTACT, DEAL_STORIES, HONEST_PROMISES, JOURNEY, LANGUAGES } from '@/data/content'

// Deep panel that opens out to full width as it scrolls in
export function Confidential() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 25%'] })
  const inset = useTransform(scrollYProgress, [0, 1], ['4%', '0%'])
  const radius = useTransform(scrollYProgress, [0, 1], [48, 28])

  return (
    <div ref={ref} className="py-10 sm:px-3">
      <motion.div style={{ marginInline: inset, borderRadius: radius }} className="bg-navy text-white">
        <div className="mx-auto max-w-4xl px-5 py-24 sm:py-32">
          <Reveal className="text-center">
            <Label className="text-white/50">Your sale stays private</Label>
            <h2 className="display mt-5 text-5xl text-balance sm:text-7xl">
              Nobody finds out <em>until you’re ready.</em>
            </h2>
            <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-white/70">
              Most owners worry about staff, customers or competitors hearing they’re selling. It’s a fair worry, so here’s exactly how I keep it quiet.
            </p>
          </Reveal>
          <ol className="mt-16">
            {CONFIDENTIALITY.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.05}>
                <li className="grid gap-2 border-t border-white/15 py-7 sm:grid-cols-[80px_240px_1fr] sm:gap-6">
                  <span className="font-heading text-xl text-accent italic">0{i + 1}</span>
                  <h3 className="font-heading text-2xl">{c.title}</h3>
                  <p className="leading-relaxed text-white/70">{c.text}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </motion.div>
    </div>
  )
}

export function Stories() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-24 sm:py-32">
      <Reveal>
        <Label>Recent results</Label>
        <h2 className="display mt-5 max-w-2xl text-5xl text-balance sm:text-7xl">
          A couple of <em>recent sales.</em>
        </h2>
        <p className="mt-5 text-lg text-muted-foreground">Names left out, for the same reason I’d keep yours out.</p>
      </Reveal>
      <div className="mt-14 grid gap-12 sm:grid-cols-2 sm:gap-10">
        {DEAL_STORIES.map((d, i) => (
          <Reveal key={d.business} delay={i * 0.1}>
            <article className="border-t border-ink/20 pt-6">
              <p className="display text-[5.5rem] sm:text-[7rem]">{d.stat}</p>
              <h3 className="mt-4 text-lg font-semibold">{d.business}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{d.worry} {d.result}</p>
            </article>
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-16">
        <figure>
          <div className="aspect-[4/3] overflow-hidden rounded-[28px] sm:aspect-[21/9]">
            <Photo name="meeting-room" alt="Sakshi in a meeting around a table" className="object-[60%_center]" />
          </div>
          <figcaption className="mt-3 text-sm text-muted-foreground">At the Clyth McLeod office.</figcaption>
        </figure>
      </Reveal>
    </section>
  )
}

// Each word lights up as you scroll through the paragraph
export function Honest() {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 45%'] })
  const words = HONEST_PROMISES.join(' ').split(' ')

  return (
    <section className="bg-gold-soft">
      <div className="mx-auto max-w-4xl px-4 py-24 sm:py-36">
        <Reveal>
          <Label>Straight talk</Label>
          <h2 className="mt-4 text-lg font-semibold">What I’ll tell you that other brokers won’t.</h2>
        </Reveal>
        <p ref={ref} className="display mt-8 flex flex-wrap text-[2.4rem] leading-[1.1] sm:text-6xl">
          {words.map((w, i) => (
            <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>{w}</Word>
          ))}
        </p>
      </div>
    </section>
  )
}

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.18, 1])
  return <motion.span style={{ opacity }} className="mr-[0.25em]">{children}</motion.span>
}

export function Journey() {
  const ref = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 55%'] })
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  return (
    <section className="mx-auto grid max-w-5xl gap-12 px-4 py-24 sm:py-32 md:grid-cols-[1fr_1.15fr]">
      <div>
        <div className="md:sticky md:top-28">
          <Reveal>
            <Label>My journey</Label>
            <h2 className="display mt-5 text-5xl text-balance sm:text-7xl">
              From cars, to houses, <em>to businesses.</em>
            </h2>
            <p className="mt-6 max-w-sm text-lg leading-relaxed text-muted-foreground">
              Every step taught me something I now use to sell businesses like yours.
            </p>
            <div className="mt-8 aspect-[4/5] max-w-sm overflow-hidden rounded-[28px]">
              <Photo name="table-smile" alt="Sakshi smiling while talking with people at a table" className="object-[50%_35%]" />
            </div>
          </Reveal>
        </div>
      </div>

      <ol ref={ref} className="relative space-y-14 pl-10">
        <span aria-hidden className="absolute top-2 bottom-2 left-[7px] w-px bg-border" />
        <motion.span aria-hidden style={{ scaleY: fill }} className="absolute top-2 bottom-2 left-[7px] w-px origin-top bg-ink" />
        {JOURNEY.map((step, i) => (
          <li key={step.title} className="relative">
            <span aria-hidden className="absolute top-2 -left-10 size-[15px] rounded-full border-[1.5px] border-ink bg-background" />
            <Reveal>
              <p className="font-heading text-xl text-gold italic">{step.year ?? `Chapter ${i + 1}`}</p>
              <h3 className="mt-1 font-heading text-3xl leading-tight">{step.title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{step.text}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function Credentials() {
  const facts = [
    'Licensed Salesperson under the Real Estate Agents Act 2008',
    'Bachelor of Business in Accounting, AUT',
    `Speaks ${LANGUAGES.join(', ')}`,
  ]
  return (
    <section className="mx-auto max-w-5xl px-4 pb-24">
      <Reveal>
        <div className="grid gap-8 border-t border-ink/20 pt-10 sm:grid-cols-[auto_1fr_auto] sm:items-start">
          <Portrait className="size-20 text-2xl" />
          <div>
            <h3 className="display text-4xl">{CONTACT.name}</h3>
            <p className="mt-1 text-muted-foreground">{CONTACT.role}, {CONTACT.company}</p>
            <ul className="mt-5 space-y-1.5">
              {facts.map(f => <li key={f}>{f}</li>)}
            </ul>
          </div>
          <div className="flex flex-col gap-2 text-sm font-semibold">
            <a className="inline-flex items-center gap-1 underline decoration-ink/30 underline-offset-4 hover:decoration-ink" href={CONTACT.licenceRegister} target="_blank" rel="noopener noreferrer">
              Check my licence <ArrowUpRight className="size-4" />
            </a>
            <a className="inline-flex items-center gap-1 underline decoration-ink/30 underline-offset-4 hover:decoration-ink" href={CONTACT.profile} target="_blank" rel="noopener noreferrer">
              Clyth McLeod profile <ArrowUpRight className="size-4" />
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
