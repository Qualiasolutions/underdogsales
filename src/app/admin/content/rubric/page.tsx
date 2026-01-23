import Link from 'next/link'
import { ArrowLeft, Info } from 'lucide-react'
import { SCORING_RUBRIC } from '@/config/rubric'
import { RubricDisplay } from '@/components/admin/RubricDisplay'

const dimensionLabels: Record<string, string> = {
  opener: 'Opener',
  pitch: 'Pitch',
  discovery: 'Discovery',
  objection_handling: 'Objection Handling',
  closing: 'Closing',
  communication: 'Communication',
}

const dimensionColors: Record<string, string> = {
  opener: '#3B82F6',
  pitch: '#10B981',
  discovery: '#F59E0B',
  objection_handling: '#EF4444',
  closing: '#8B5CF6',
  communication: '#EC4899',
}

function getDimensionColor(dimension: string): string {
  return dimensionColors[dimension] || '#6B7280'
}

export default function RubricPage() {
  const totalWeight = SCORING_RUBRIC.reduce((sum, d) => sum + d.weight, 0)

  return (
    <div>
      <Link
        href="/admin/content"
        className="inline-flex items-center text-muted-foreground hover:text-navy mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Content
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">Scoring Rubric</h1>
        <p className="text-muted-foreground mt-1">
          Evaluation criteria for sales call performance analysis
        </p>
      </div>

      {/* Explainer Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">How scoring works</p>
          <p>
            Each practice session and call analysis is scored across 6 dimensions.
            The overall score is a weighted average based on the dimension weights shown below.
            Each dimension has multiple criteria that contribute to its score.
          </p>
        </div>
      </div>

      {/* Weights Summary */}
      <div className="bg-white rounded-xl border shadow-sm p-4 mb-6">
        <h2 className="font-semibold text-navy mb-3">Dimension Weights</h2>
        <div className="flex flex-wrap gap-4">
          {SCORING_RUBRIC.map(d => (
            <div key={d.dimension} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getDimensionColor(d.dimension) }}
              />
              <span className="text-sm">
                {dimensionLabels[d.dimension]}: {Math.round(d.weight * 100)}%
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Total: {Math.round(totalWeight * 100)}%
          {totalWeight !== 1 && (
            <span className="text-amber-600 ml-2">
              (should be 100%)
            </span>
          )}
        </p>
      </div>

      <RubricDisplay rubric={SCORING_RUBRIC} />
    </div>
  )
}
