// Every document Sakshi can ask a seller for. She picks which ones each vendor sees in the link maker.
// To add a new document, add it to DOCUMENTS with a short, unique id (lowercase letters and dashes).
// Keep ids the same once links have been sent, as saved links refer to them.

import type { Industry } from './content'

export type DocGroup = 'financials' | 'staff' | 'premises' | 'assets' | 'licences' | 'other'

export const GROUPS: Record<DocGroup, string> = {
  financials: 'Financials',
  staff: 'Staff and wages',
  premises: 'Premises',
  assets: 'Equipment and stock',
  licences: 'Licences and agreements',
  other: 'Anything else',
}

export type Doc = { id: string; label: string; hint?: string; group: DocGroup }

export const DOCUMENTS: Doc[] = [
  { id: 'financial-statements', group: 'financials', label: 'Financial statements (last 2 years)', hint: 'The annual accounts your accountant prepares.' },
  { id: 'profit-loss', group: 'financials', label: 'Profit and loss for this year so far', hint: 'From your accounting software, such as Xero or MYOB.' },
  { id: 'gst-returns', group: 'financials', label: 'GST returns (last 2 years)', hint: 'Screenshots or PDFs from myIR or your accountant are fine.' },
  { id: 'pos-reports', group: 'financials', label: 'POS sales reports (last 12 months)', hint: 'Monthly sales totals from your till system.' },
  { id: 'bank-statements', group: 'financials', label: 'Business bank statements (last 12 months)' },
  { id: 'owner-wages', group: 'financials', label: 'Owner wages and drawings', hint: 'What you and any family members take out of the business each year.' },
  { id: 'tax-returns', group: 'financials', label: 'Income tax returns (last 2 years)' },

  { id: 'staff-list', group: 'staff', label: 'Staff list with hours and pay rates', hint: 'Role, hours per week, hourly rate and how long they’ve worked there. Names aren’t needed yet.' },
  { id: 'wage-summary', group: 'staff', label: 'Staff wage summary', hint: 'Total wages paid over the last 12 months, from your payroll.' },
  { id: 'employment-agreements', group: 'staff', label: 'Employment agreements for key staff' },

  { id: 'lease', group: 'premises', label: 'Lease agreement', hint: 'Include any renewals, variations and rent reviews.' },
  { id: 'outgoings', group: 'premises', label: 'Rent and outgoings breakdown' },
  { id: 'council-consents', group: 'premises', label: 'Council permits or consents', hint: 'For example, outdoor seating or signage permits.' },

  { id: 'plant-equipment', group: 'assets', label: 'Plant and equipment list', hint: 'Main equipment, roughly how old it is, and whether it’s owned or leased.' },
  { id: 'chattels', group: 'assets', label: 'Chattels list', hint: 'Furniture, fittings and smaller items that come with the business.' },
  { id: 'stock', group: 'assets', label: 'Stock on hand (rough value)' },
  { id: 'vehicles', group: 'assets', label: 'Vehicles used in the business' },
  { id: 'finance-agreements', group: 'assets', label: 'Finance or hire purchase agreements', hint: 'Anything owed on equipment or vehicles.' },

  { id: 'franchise', group: 'licences', label: 'Franchise agreement' },
  { id: 'liquor-licence', group: 'licences', label: 'Liquor licence' },
  { id: 'food-licence', group: 'licences', label: 'Food licence or food control plan registration' },
  { id: 'supplier-agreements', group: 'licences', label: 'Key supplier agreements' },
  { id: 'client-contracts', group: 'licences', label: 'Client contracts', hint: 'A list of regular contracts and their value. Client names aren’t needed yet.' },
  { id: 'insurance', group: 'licences', label: 'Business insurance policy' },
]

const CORE = ['financial-statements', 'profit-loss', 'gst-returns', 'owner-wages', 'staff-list', 'wage-summary', 'lease', 'plant-equipment', 'chattels']

// What gets pre-ticked in the link maker for each type of business
export const PRESETS: Record<Industry | 'default', string[]> = {
  default: CORE,
  cafe: [...CORE, 'pos-reports', 'stock', 'food-licence', 'liquor-licence'],
  hospitality: [...CORE, 'pos-reports', 'stock', 'food-licence', 'liquor-licence'],
  cleaning: [...CORE.filter(d => d !== 'chattels'), 'vehicles', 'finance-agreements', 'client-contracts'],
  retail: [...CORE, 'pos-reports', 'stock', 'supplier-agreements'],
  service: [...CORE, 'client-contracts', 'vehicles'],
  other: CORE,
}

// Sakshi can type her own documents; they're saved as "custom:<text>"
export const CUSTOM_PREFIX = 'custom:'
export const isCustom = (id: string) => id.startsWith(CUSTOM_PREFIX)

// Turns saved ids into documents, in library order, with custom ones at the end
export function resolveDocs(ids: string[]): Doc[] {
  const known = DOCUMENTS.filter(d => ids.includes(d.id))
  const custom: Doc[] = ids.filter(isCustom).map(id => ({ id, label: id.slice(CUSTOM_PREFIX.length), group: 'other' }))
  return [...known, ...custom]
}

export function presetFor(industry?: Industry | ''): string[] {
  return PRESETS[industry || 'default'] ?? PRESETS.default
}
