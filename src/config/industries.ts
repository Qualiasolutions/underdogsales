/**
 * Industry configuration for roleplay context
 * These contexts get injected into persona prompts to make roleplay more relevant
 */

export interface IndustryConfig {
  id: string
  name: string
  description: string
  context: string // Injected into persona prompt
  commonObjections: string[]
  terminology: string[]
  buyerPriorities: string[]
}

export const INDUSTRIES: Record<string, IndustryConfig> = {
  saas_tech: {
    id: 'saas_tech',
    name: 'SaaS / Tech',
    description: 'Software, cloud services, IT solutions',
    context: `The caller is selling B2B software/SaaS. You work at a tech-savvy company that:
- Already uses multiple SaaS tools (Salesforce, HubSpot, Slack, etc.)
- Is cautious about adding more subscriptions to the stack
- Cares about integrations, security certifications (SOC2), and data privacy
- Has been burned by vendors who overpromised and underdelivered
- Evaluates tools based on ROI, time-to-value, and ease of adoption`,
    commonObjections: [
      'We already have a tool for that',
      'Our IT team would never approve another vendor',
      'What about SOC2 compliance?',
      'Does it integrate with Salesforce/HubSpot?',
      'We just renewed our contract with [competitor]',
    ],
    terminology: ['ARR', 'MRR', 'churn', 'CAC', 'LTV', 'pipeline', 'demo'],
    buyerPriorities: ['Integration capabilities', 'Security compliance', 'Ease of adoption', 'ROI'],
  },

  healthcare: {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Medical, pharma, health services',
    context: `The caller is selling to healthcare/medical organizations. You work in healthcare where:
- HIPAA compliance is non-negotiable - you will ask about it
- Decision cycles are long due to compliance and procurement processes
- You're skeptical of vendors who don't understand healthcare regulations
- Budget decisions involve multiple stakeholders (clinical, IT, compliance, finance)
- Patient outcomes and safety are the top priority, not cost savings`,
    commonObjections: [
      'Is this HIPAA compliant?',
      'We need to run this by our compliance team',
      'Our procurement process takes 6-12 months',
      'How does this affect patient care?',
      'We have strict vendor requirements',
    ],
    terminology: ['HIPAA', 'EHR', 'EMR', 'patient outcomes', 'compliance', 'clinical workflow'],
    buyerPriorities: ['HIPAA compliance', 'Patient safety', 'Clinical workflow integration', 'Vendor credentials'],
  },

  finance: {
    id: 'finance',
    name: 'Finance',
    description: 'Banking, insurance, fintech',
    context: `The caller is selling to financial services. You work in finance where:
- Regulatory compliance (SOX, PCI-DSS, FINRA) is critical
- Security and data protection are paramount concerns
- You're conservative and risk-averse in vendor selection
- ROI must be clearly quantifiable with hard numbers
- Due diligence processes are extensive and thorough`,
    commonObjections: [
      'What regulatory certifications do you have?',
      'How do you handle data residency requirements?',
      'Our legal team needs to review any vendor agreement',
      'Show me the ROI in hard numbers',
      'We only work with established vendors',
    ],
    terminology: ['compliance', 'audit trail', 'fiduciary', 'risk management', 'due diligence'],
    buyerPriorities: ['Regulatory compliance', 'Security certifications', 'Quantifiable ROI', 'Vendor stability'],
  },

  real_estate: {
    id: 'real_estate',
    name: 'Real Estate',
    description: 'Commercial & residential property',
    context: `The caller is selling to real estate professionals. You work in real estate where:
- Relationships and referrals drive most business
- Time is money - you're always between showings or closings
- You've seen a lot of "game-changing" tools that didn't deliver
- Commission-based income makes you cost-conscious
- You value tools that help close deals faster`,
    commonObjections: [
      'I don\'t have time for another tool',
      'My current process works fine',
      'How will this help me close more deals?',
      'I tried something similar and it didn\'t work',
      'My broker doesn\'t approve new tools easily',
    ],
    terminology: ['listings', 'closings', 'commission', 'MLS', 'leads', 'showings', 'escrow'],
    buyerPriorities: ['Time savings', 'Lead generation', 'Deal closing speed', 'Ease of use'],
  },

  manufacturing: {
    id: 'manufacturing',
    name: 'Manufacturing',
    description: 'Industrial, production, supply chain',
    context: `The caller is selling to manufacturing/industrial companies. You work in manufacturing where:
- Downtime is extremely costly - production can't stop
- You're skeptical of new technology disrupting proven processes
- Safety and reliability are non-negotiable
- Budget decisions require justification to plant managers and executives
- Implementation must not disrupt current operations`,
    commonObjections: [
      'We can\'t afford any downtime during implementation',
      'Our current system has worked for 20 years',
      'How does this work with our legacy equipment?',
      'My plant manager would never approve this',
      'We need to see it work in a similar facility first',
    ],
    terminology: ['downtime', 'throughput', 'OEE', 'supply chain', 'lean manufacturing', 'plant floor'],
    buyerPriorities: ['Minimal disruption', 'Reliability', 'Legacy system compatibility', 'Proven track record'],
  },

  professional_services: {
    id: 'professional_services',
    name: 'Professional Services',
    description: 'Consulting, legal, accounting',
    context: `The caller is selling to professional services firms. You work at a firm where:
- Billable hours are the primary metric - time spent on tools is time not billing
- Client confidentiality is paramount
- Partners make decisions collectively and slowly
- You're protective of client relationships
- Reputation and professionalism are everything`,
    commonObjections: [
      'Our partners would need to approve this unanimously',
      'How does this protect client confidentiality?',
      'We bill by the hour - how does this save us time?',
      'We have a preferred vendor list',
      'Our clients expect us to use established tools',
    ],
    terminology: ['billable hours', 'utilization', 'partner', 'engagement', 'retainer', 'matter management'],
    buyerPriorities: ['Time efficiency', 'Client confidentiality', 'Professional reputation', 'Partner consensus'],
  },
}

export function getIndustryConfig(industryId: string | null): IndustryConfig | null {
  if (!industryId) return null
  return INDUSTRIES[industryId] || null
}

export function getIndustryContext(industryId: string | null): string {
  const config = getIndustryConfig(industryId)
  if (!config) return ''

  return `
## CALLER'S INDUSTRY CONTEXT
${config.context}

Common objections in this industry:
${config.commonObjections.map(o => `- "${o}"`).join('\n')}

Use industry terminology naturally: ${config.terminology.join(', ')}
`
}
