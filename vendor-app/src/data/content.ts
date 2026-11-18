// Everything written on the page lives here, so it can be changed without touching the layout.

export const CONTACT = {
  name: 'Sakshi Aggarwal',
  firstName: 'Sakshi',
  role: 'Business Broker',
  company: 'Clyth McLeod',
  phoneDisplay: '027 268 4023',
  phoneLink: 'tel:+64272684023',
  whatsapp: 'https://wa.me/64272684023',
  email: 'sakshi@cmbusiness.co.nz',
  profile: 'https://www.cmbusiness.co.nz/consultant/131/sakshi-aggarwal',
  googleReviews: 'https://search.google.com/local/reviews?placeid=ChIJ1fqxSJ1IDW0RVqo-Axc4_dg',
  licenceRegister: 'https://www.rea.govt.nz/',
  legalLine: 'Business brokerage services are provided through Clyth MacLeod 2018 Limited, Licensed Agent REAA 2008.',
}

// Fill these in from the Google profile so the numbers match what vendors see there.
// Leave as null to hide them.
export const GOOGLE_STATS: { rating: number | null; count: number | null } = {
  rating: null,
  count: null,
}

export const INDUSTRIES = {
  cafe: 'Café',
  hospitality: 'Restaurant or takeaway',
  cleaning: 'Cleaning',
  retail: 'Retail',
  service: 'Service business',
  other: 'Other',
} as const
export type Industry = keyof typeof INDUSTRIES

export const SITUATIONS = {
  retiring: 'Retiring',
  'moving-on': 'Ready for something new',
  health: 'Health or family reasons',
  relocating: 'Moving away',
  'first-sale': 'Selling for the first time',
} as const
export type Situation = keyof typeof SITUATIONS

export const CONFIDENTIALITY = [
  {
    title: 'Buyers sign first',
    text: 'Serious buyers sign a confidentiality agreement before they see your business name or numbers.',
  },
  {
    title: 'Buyers are checked',
    text: 'I talk to buyers before introducing them, so tyre-kickers and competitors don’t get your details.',
  },
  {
    title: 'No signs, no surprises',
    text: 'Your staff, customers, suppliers and landlord don’t find out until you decide they should.',
  },
  {
    title: 'Your documents stay with me',
    text: 'What you send me is only shared with buyers when you’re comfortable, and only what’s needed.',
  },
]

export const HONEST_PROMISES = [
  'If your price is too high, I’ll tell you, along with why.',
  'I’ll tell you what buyers will question in your accounts before they do.',
  'If now isn’t the right time to sell, I’ll say so.',
  'You’ll always know where things stand. No chasing me for updates.',
]

// Sakshi's journey, in order. Add a year to any step to show it on the timeline.
export const JOURNEY: { year?: string; title: string; text: string }[] = [
  {
    title: 'Studied accounting at AUT',
    text: 'A Bachelor of Business in Accounting. It’s why I can read your financials the way a buyer’s accountant will.',
  },
  {
    title: 'Started out selling cars',
    text: 'Where I learnt to read people, handle tough negotiations and earn trust quickly.',
  },
  {
    title: 'Moved into selling houses',
    text: 'Bigger decisions, bigger emotions. I learnt how to guide people through one of the biggest moves of their lives.',
  },
  {
    title: 'Now selling businesses with Clyth McLeod',
    text: 'Bringing sales energy and accounting know-how together, helping owners across New Zealand sell what they’ve built.',
  },
  {
    title: 'Building a pool of ready buyers',
    text: 'I’ve made more than 1,500 videos about buying and selling businesses. Buyers come to me, so I often have one in mind before a business is listed.',
  },
]

export const LANGUAGES = ['English', 'Hindi', 'Punjabi']

// Documents to ask for. Sakshi can change this list at any time.
export const DOCUMENTS_BASE = [
  'Last 2 years of financial statements',
  'This year’s profit and loss so far',
  'Current lease agreement',
  'List of equipment and fit-out',
  'Staff roles and hours (no names needed)',
]

export const DOCUMENTS_BY_INDUSTRY: Partial<Record<Industry, string[]>> = {
  cafe: ['Food control plan or registration', 'Alcohol licence (if you have one)'],
  hospitality: ['Food control plan or registration', 'Alcohol licence (if you have one)'],
  cleaning: ['List of regular contracts (no client names needed)', 'Vehicles used by the business'],
  retail: ['Rough value of current stock', 'Any supplier or franchise agreements'],
  service: ['List of regular contracts (no client names needed)'],
}

// Clyth McLeod commission, all amounts excluding GST. Update here if the agency's fees change.
export const FEES = {
  upfront: 800, // AML/CFT compliance, admin and marketing; paid on signing, non-refundable
  firstRate: 0.08, // on the first $1,000,000 of the sale price
  firstBand: 1_000_000,
  secondRate: 0.06, // on the sale price above $1,000,000
  minimumSuccessFee: 18_750, // minimum for the 8% and 6% parts combined
  gst: 0.15,
}

export type FeeBreakdown = {
  first: number
  second: number
  minimumApplied: boolean
  successFee: number
  totalExGst: number
  gst: number
  totalIncGst: number
}

export function calculateFee(price: number): FeeBreakdown {
  const first = FEES.firstRate * Math.min(price, FEES.firstBand)
  const second = FEES.secondRate * Math.max(0, price - FEES.firstBand)
  const minimumApplied = first + second < FEES.minimumSuccessFee
  const successFee = Math.max(first + second, FEES.minimumSuccessFee)
  const totalExGst = FEES.upfront + successFee
  const gst = totalExGst * FEES.gst
  return { first, second, minimumApplied, successFee, totalExGst, gst, totalIncGst: totalExGst + gst }
}
