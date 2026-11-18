import { COMMISSION_TERMS, COMMISSION_TITLE, CONTACT } from '@/data/content'
import { GROUPS, resolveDocs } from '@/data/documents'

// "VARUN GARG" or "varun garg" → "Varun". Leaves names like "McKenzie" alone.
export function displayName(raw?: string) {
  const first = (raw ?? '').trim().split(/\s+/)[0] ?? ''
  if (!first) return ''
  const shouty = first === first.toUpperCase() || first === first.toLowerCase()
  return shouty ? first.charAt(0).toUpperCase() + first.slice(1).toLowerCase() : first
}

type Details = { name?: string; business?: string; link: string; docs: string[] }

// The chosen documents as a grouped, bulleted list
function docList(docs: string[]): string[] {
  const list: string[] = []
  const picked = resolveDocs(docs)
  for (const [group, label] of Object.entries(GROUPS)) {
    const inGroup = picked.filter(d => d.group === group)
    if (!inGroup.length) continue
    list.push(label)
    for (const d of inGroup) list.push(`• ${d.label}`)
    list.push('')
  }
  return list
}

const commission = (): string[] => [COMMISSION_TITLE, '', ...COMMISSION_TERMS.flatMap(p => [p, ''])]

// For a text or WhatsApp message. Complete on its own, so it works even if the link isn't opened.
export function textMessage({ name, business, link, docs }: Details) {
  const who = displayName(name) || 'there'
  const biz = business?.trim()
  const list = docList(docs)
  return [
    `Hi ${who}, thanks for your time on the phone today${biz ? ` about ${biz}` : ''}.`,
    '',
    `As promised, here's a page I've put together for you, with reviews from other owners I've worked with and how I keep your sale confidential: ${link}`,
    '',
    `Everything you need is also written below, in case the link doesn't open.`,
    '',
    ...(list.length ? [`When you're ready, these are the documents I'll need:`, '', ...list] : []),
    `Photos, screenshots or PDFs are all fine. No rush, send them through whenever you're ready.`,
    '',
    ...commission(),
    `Any questions, just call or text me on ${CONTACT.phoneDisplay}.`,
    '',
    CONTACT.firstName,
  ].join('\n')
}

// Fuller version for email, listing the exact documents picked
export function emailMessage({ name, business, link, docs }: Details, withCommission: boolean) {
  const who = displayName(name)
  const biz = business?.trim()
  const subject = `Great talking today${who ? `, ${who}` : ''}: next steps for ${biz || 'your business'}`
  const list = docList(docs)

  const body = [
    `Hi ${who || 'there'},`,
    '',
    `Thanks for taking the time to talk with me today about ${biz || 'your business'}. As promised, here's a page I've put together just for you:`,
    link,
    '',
    `On it you'll find:`,
    '• what other business owners say about working with me',
    '• how I keep your sale confidential',
    '• how my fee works',
    '• the documents I’ll need, with a button that writes the email for you',
    '',
    `In case the link doesn't open, everything you need is also written below.`,
    '',
    ...(list.length ? [`When you're ready, these are the documents I'll need:`, '', ...list] : []),
    `Photos, screenshots or PDFs are all fine, and you can send them over a few emails if that's easier. There's no rush.`,
    '',
    ...(withCommission ? commission() : []),
    `Everything you share with me stays confidential. If you have any questions at all, call or text me on ${CONTACT.phoneDisplay}, or just reply to this email.`,
    '',
    'Kind regards,',
    '',
    CONTACT.name,
    `${CONTACT.role} | ${CONTACT.company}`,
    `${CONTACT.phoneDisplay} | ${CONTACT.email}`,
  ].join('\n')

  return { subject, body, mailto: `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` }
}
