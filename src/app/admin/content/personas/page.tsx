import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getAllPersonas, PERSONA_PROMPTS } from '@/config/personas'
import { PersonaCard } from '@/components/admin/PersonaCard'

export default function PersonasPage() {
  const personas = getAllPersonas()

  return (
    <div>
      <Link
        href="/admin/content"
        className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Content
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">AI Personas</h1>
        <span className="text-muted-foreground">{personas.length} personas</span>
      </div>

      <p className="text-muted-foreground mb-8">
        These AI personas simulate different prospect personalities for sales practice.
        Each persona has unique objection patterns and conversation styles.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {personas.map(persona => (
          <PersonaCard
            key={persona.id}
            persona={persona}
            prompt={PERSONA_PROMPTS[persona.id]}
          />
        ))}
      </div>
    </div>
  )
}
