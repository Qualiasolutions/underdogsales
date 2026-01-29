import type { Persona } from '@/types'
import { cn } from '@/lib/utils'

interface PersonaCardProps {
  persona: Persona
  prompt?: string
  className?: string
}

function WarmthIndicator({ value }: { value: number }) {
  const percentage = Math.round(value * 100)

  // Gradient from cold (blue) to warm (orange)
  const getColor = (val: number) => {
    if (val < 0.25) return 'bg-blue-500'
    if (val < 0.5) return 'bg-blue-300'
    if (val < 0.75) return 'bg-orange-300'
    return 'bg-orange-500'
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Warmth</span>
      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', getColor(value))}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-medium text-foreground">{percentage}%</span>
    </div>
  )
}

export function PersonaCard({ persona, prompt, className }: PersonaCardProps) {
  return (
    <div className={cn('bg-card rounded-xl border shadow-sm p-6', className)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{persona.name}</h3>
          <p className="text-sm text-muted-foreground">{persona.role}</p>
        </div>
        <WarmthIndicator value={persona.warmth} />
      </div>

      {/* Personality */}
      <p className="text-sm mb-4">{persona.personality}</p>

      {/* Objections */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2">Objection Types:</p>
        <div className="flex flex-wrap gap-2">
          {persona.objections.map(obj => (
            <span
              key={obj}
              className="px-2 py-1 bg-muted rounded text-xs capitalize"
            >
              {obj.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Technical IDs */}
      <div className="text-xs text-muted-foreground border-t pt-4 mt-4 space-y-1">
        <p>
          Voice ID: <code className="bg-muted px-1 rounded">{persona.voiceId}</code>
        </p>
        <p>
          Assistant ID: <code className="bg-muted px-1 rounded">{persona.assistantId}</code>
        </p>
      </div>

      {/* Prompt preview (if provided) */}
      {prompt && (
        <details className="mt-4">
          <summary className="text-sm text-foreground cursor-pointer hover:text-foreground/80 transition-colors">
            View System Prompt
          </summary>
          <pre className="mt-2 p-4 bg-muted rounded text-xs overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto">
            {prompt}
          </pre>
        </details>
      )}
    </div>
  )
}
