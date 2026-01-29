import type { ScoringRubric } from '@/types'
import { cn } from '@/lib/utils'

interface RubricDisplayProps {
  rubric: ScoringRubric[]
  className?: string
}

const dimensionLabels: Record<string, string> = {
  opener: 'Opener',
  pitch: 'Pitch',
  discovery: 'Discovery',
  objection_handling: 'Objection Handling',
  closing: 'Closing',
  communication: 'Communication',
}

const dimensionDescriptions: Record<string, string> = {
  opener: 'How you start the conversation and grab attention',
  pitch: 'Problem-focused presentation of your solution',
  discovery: 'Uncovering the prospect\'s pain points and needs',
  objection_handling: 'Responding to resistance with curiosity',
  closing: 'Moving toward commitment without pressure',
  communication: 'Voice, pace, and active listening skills',
}

function formatCriterionName(name: string): string {
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getWeightColor(weight: number): string {
  if (weight >= 0.3) return 'text-green-600 bg-green-50'
  if (weight >= 0.2) return 'text-blue-600 bg-blue-50'
  return 'text-gray-600 bg-muted'
}

export function RubricDisplay({ rubric, className }: RubricDisplayProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {rubric.map(dimension => (
        <div
          key={dimension.dimension}
          className="bg-card rounded-xl border shadow-sm overflow-hidden"
        >
          {/* Dimension Header */}
          <div className="p-4 bg-muted/50 flex items-center justify-between border-b">
            <div>
              <h3 className="font-semibold text-foreground">
                {dimensionLabels[dimension.dimension] || dimension.dimension}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {dimensionDescriptions[dimension.dimension]}
              </p>
            </div>
            <span className="text-sm font-medium text-foreground bg-card px-3 py-1 rounded-full border">
              {Math.round(dimension.weight * 100)}% weight
            </span>
          </div>

          {/* Criteria List */}
          <div className="p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b">
                  <th className="text-left py-2 pr-4 font-medium">Criteria</th>
                  <th className="text-left py-2 pr-4 font-medium hidden sm:table-cell">Description</th>
                  <th className="text-right py-2 font-medium w-20">Weight</th>
                </tr>
              </thead>
              <tbody>
                {dimension.criteria.map(criterion => (
                  <tr
                    key={criterion.name}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 pr-4">
                      <span className="font-medium text-foreground">
                        {formatCriterionName(criterion.name)}
                      </span>
                      {/* Show description on mobile */}
                      <p className="text-xs text-muted-foreground mt-1 sm:hidden">
                        {criterion.description}
                      </p>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground hidden sm:table-cell">
                      {criterion.description}
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={cn(
                          'inline-block px-2 py-0.5 rounded text-xs font-medium',
                          getWeightColor(criterion.weight)
                        )}
                      >
                        {Math.round(criterion.weight * 100)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
