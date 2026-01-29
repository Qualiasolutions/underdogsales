import type { Metadata } from 'next'
import { ICPBuilder } from './icp-builder'

export const metadata: Metadata = {
  title: 'Create Persona | Underdog AI Sales Coach',
  description: 'Build a custom AI roleplay persona based on your ideal customer profile',
}

export default function CreatePage() {
  return <ICPBuilder />
}
