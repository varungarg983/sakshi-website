import { CONTACT } from '@/data/content'
import type { Vendor } from './vendor'

export function buildEmail(vendor: Vendor, items: string[], ticked: Set<string>) {
  const who = vendor.firstName?.trim()
  const biz = vendor.business?.trim()
  const subject = ['Documents', biz && `for ${biz}`, who && `– ${who}`].filter(Boolean).join(' ')

  const lines = items.map(item =>
    ticked.has(item) ? `✅ ${item} – attached` : `⬜ ${item} – I'll send this soon`,
  )

  const body = [
    `Hi ${CONTACT.firstName},`,
    '',
    'Here are the documents we talked about:',
    '',
    ...lines,
    '',
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
