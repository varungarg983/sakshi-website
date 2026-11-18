import { motion, useScroll, useSpring } from 'motion/react'
import { BadgeCheck, EyeOff, FileLock2, Lock, MessageCircleWarning, UserCheck } from 'lucide-react'
import { useRef } from 'react'
import { Portrait, Reveal, Section } from '@/components/common'
import { CONFIDENTIALITY, CONTACT, DEAL_STORIES, HONEST_PROMISES, JOURNEY, LANGUAGES } from '@/data/content'

const CONF_ICONS = [FileLock2, UserCheck, EyeOff, Lock]

export function Confidential() {
  return (
    <div className="bg-navy text-white">
      <Section
        eyebrow="Your sale stays private"
        title="Nobody finds out until you’re ready"
        intro={<span className="text-white/75">Most owners worry about staff, customers or competitors hearing they’re selling. Here’s how I keep it quiet.</span>}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {CONFIDENTIALITY.map((c, i) => {
            const Icon = CONF_ICONS[i % CONF_ICONS.length]
            return (
              <Reveal key={c.title} delay={i * 0.07}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-5">
                  <Icon className="size-6 text-gold" />
                  <h3 className="mt-3 text-lg font-semibold">{c.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-white/70">{c.text}</p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </Section>
    </div>
  )
}

export function Stories() {
  return (
    <Section eyebrow="Recent results" title="A couple of recent sales" intro="Names left out, for the same reason I’d keep yours out.">
      <div className="grid gap-4 sm:grid-cols-2">
        {DEAL_STORIES.map((d, i) => (
          <Reveal key={d.business} delay={i * 0.08}>
            <article className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm">
              <p className="inline-block rounded-full bg-gold-soft px-3 py-1 text-xs font-semibold text-gold">{d.highlight}</p>
              <h3 className="mt-4 font-heading text-2xl font-bold">{d.business}</h3>
              <dl className="mt-3 space-y-3 text-sm leading-relaxed">
                <div>
                  <dt className="font-semibold">The worry</dt>
                  <dd className="text-muted-foreground">{d.worry}</dd>
                </div>
                <div>
                  <dt className="font-semibold">What happened</dt>
                  <dd className="text-muted-foreground">{d.result}</dd>
                </div>
              </dl>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

export function Honest() {
  return (
    <div className="bg-gold-soft">
      <Section
        eyebrow="Straight talk"
        title="What I’ll tell you that other brokers won’t"
        intro="Honesty isn’t always comfortable, but it’s what gets businesses sold at the right price."
      >
        <ul className="space-y-3">
          {HONEST_PROMISES.map((p, i) => (
            <Reveal key={p} delay={i * 0.06}>
              <li className="flex gap-4 rounded-2xl bg-card p-5 shadow-sm">
                <MessageCircleWarning className="mt-0.5 size-5 shrink-0 text-gold" />
                <span className="text-lg leading-snug">{p}</span>
              </li>
            </Reveal>
          ))}
        </ul>
      </Section>
    </div>
  )
}

export function Journey() {
  const ref = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] })
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  return (
    <Section
      eyebrow="My journey"
      title="From cars, to houses, to businesses"
      intro="Every step taught me something I now use to sell businesses like yours."
    >
      <ol ref={ref} className="relative ml-3 space-y-10 border-l-2 border-border pl-8">
        <motion.span
          aria-hidden
          className="absolute top-0 -left-[2px] h-full w-[2px] origin-top bg-gold"
          style={{ scaleY: fill }}
        />
        {JOURNEY.map((step, i) => (
          <li key={step.title} className="relative">
            <motion.span
              aria-hidden
              className="absolute top-1 -left-[41px] grid size-5 place-items-center rounded-full border-2 border-gold bg-background"
              initial={{ scale: 0.4, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, margin: '-30% 0px' }}
            >
              <span className="size-2 rounded-full bg-gold" />
            </motion.span>
            <Reveal delay={0.05}>
              <p className="text-xs font-semibold tracking-[0.16em] text-gold uppercase">
                {step.year ?? `Step ${i + 1}`}
              </p>
              <h3 className="mt-1 font-heading text-2xl font-bold">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{step.text}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  )
}

export function Credentials() {
  return (
    <Section eyebrow="Who you’re dealing with" title="Licensed, accountable and easy to check">
      <Reveal>
        <div className="flex flex-col gap-6 rounded-3xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:p-8">
          <Portrait className="size-24 shrink-0" />
          <div>
            <h3 className="font-heading text-2xl font-bold">{CONTACT.name}</h3>
            <p className="text-muted-foreground">{CONTACT.role}, {CONTACT.company}</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex gap-2"><BadgeCheck className="size-5 shrink-0 text-gold" /> Licensed Salesperson under the Real Estate Agents Act 2008</li>
              <li className="flex gap-2"><BadgeCheck className="size-5 shrink-0 text-gold" /> Bachelor of Business in Accounting, AUT</li>
              <li className="flex gap-2"><BadgeCheck className="size-5 shrink-0 text-gold" /> Speaks {LANGUAGES.join(', ')}</li>
            </ul>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
              <a className="text-navy underline decoration-gold underline-offset-4" href={CONTACT.licenceRegister} target="_blank" rel="noopener noreferrer">
                Check my licence on the public register
              </a>
              <a className="text-navy underline decoration-gold underline-offset-4" href={CONTACT.profile} target="_blank" rel="noopener noreferrer">
                My Clyth McLeod profile
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
