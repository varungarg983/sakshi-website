import { CONTACT } from '@/data/content'
import { GROUPS, type Doc } from '@/data/documents'
import type { Vendor } from './vendor'

export function buildEmail(vendor: Vendor, docs: Doc[], ticked: Set<string>) {
  const who = vendor.firstName?.trim()
  const biz = vendor.business?.trim()
  const subject = ['Documents', biz && `for ${biz}`, who && `– ${who}`].filter(Boolean).join(' ')

  // Grouped like the page, so a long list is easy to read
  const lines: string[] = []
  for (const [group, name] of Object.entries(GROUPS)) {
    const inGroup = docs.filter(d => d.group === group)
    if (!inGroup.length) continue
    lines.push(name.toUpperCase())
    for (const d of inGroup) lines.push(ticked.has(d.id) ? `✅ ${d.label} – attached` : `⬜ ${d.label} – I'll send this soon`)
    lines.push('')
  }

  const body = [
    `Hi ${CONTACT.firstName},`,
    '',
    'Here are the documents we talked about:',
    '',
    ...lines,
    'Thanks,',
    who || '',
  ].join('\n')

  return {
    subject,
    body,
    mailto: `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    gmail: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CONTACT.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  }
}
