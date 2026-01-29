import type { Metadata } from 'next'
import { IndustrySelector } from './industry-selector'

export const metadata: Metadata = {
  title: 'Select Your Industry | Underdog AI Sales Coach',
  description: 'Choose your selling industry to customize roleplay scenarios with relevant objections and context',
}

export default function CreatePage() {
  return <IndustrySelector />
}
