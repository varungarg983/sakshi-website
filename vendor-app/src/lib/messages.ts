import { COMMISSION_TERMS, COMMISSION_TITLE, CONTACT } from '@/data/content'
import { GROUPS, resolveDocs } from '@/data/documents'

// "VARUN GARG" or "varun garg" → "Varun". Leaves names like "McKenzie" alone.
export function displayName(raw?: string) {
  const first = (raw ?? '').trim().split(/\s+/)[0] ?? ''
  if (!first) return ''
  const shouty = first === first.toUpperCase() || first === first.toLowerCase()
  return shouty ? first.charAt(0).toUpperCase() + first.slice(1).toLowerCase() : first
}

export type MessageKind = 'text' | 'whatsapp' | 'email'

export type MessageDetails = {
  name?: string
  business?: string
  link: string
  docs: string[]
  // Personal opening, written by Sakshi or drafted by the AI from her notes
  opening?: string
  withCommission: boolean
}

const DEFAULT_OPENING = 'It was lovely speaking with you today.'

// Follows the message Sakshi sends after meeting an owner. Only the opening is personal;
// the document list and commission wording always come from fixed text.
export function buildMessage(kind: MessageKind, d: MessageDetails) {
  const who = displayName(d.name) || 'there'
  const biz = d.business?.trim()
  // WhatsApp shows *text* in bold
  const heading = (t: string) => (kind === 'whatsapp' ? `*${t}*` : t)

  const docLines: string[] = []
  const picked = resolveDocs(d.docs)
  for (const [group, label] of Object.entries(GROUPS)) {
    const inGroup = picked.filter(doc => doc.group === group)
    if (!inGroup.length) continue
    docLines.push(heading(label), '')
    for (const doc of inGroup) docLines.push(`• ${doc.label}`)
    docLines.push('')
  }

  const commission = d.withCommission
    ? [heading(COMMISSION_TITLE), '', ...COMMISSION_TERMS.flatMap(p => [p, ''])]
    : []

  const body = [
    `Hi ${who},`,
    '',
    d.opening?.trim() || DEFAULT_OPENING,
    '',
    `As discussed, please find the link below. I’ve put together a page where you can read reviews and testimonials from other business owners and purchasers I’ve successfully worked with, and learn more about how I maintain confidentiality throughout the sale process.`,
    '',
    d.link,
    '',
    ...(docLines.length
      ? [`Could you please arrange the following documents and email them to me at ${CONTACT.email} as soon as possible?`, '', ...docLines]
      : []),
    ...commission,
    `If you have any questions or need clarification on anything, please feel free to call or text me on ${CONTACT.phoneDisplay}.`,
    '',
    'Looking forward to working with you.',
    '',
    'Kind regards,',
    CONTACT.firstName,
    'Clyth MacLeod Business Sales',
  ].join('\n')

  const subject = `${biz ? `${biz}: ` : ''}documents and next steps`
  return {
    body,
    subject: subject.charAt(0).toUpperCase() + subject.slice(1),
  }
}

export const mailtoDraft = (subject: string, body: string) =>
  `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

export const whatsappShare = (body: string) => `https://wa.me/?text=${encodeURIComponent(body)}`
