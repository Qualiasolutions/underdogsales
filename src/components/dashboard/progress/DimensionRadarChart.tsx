'use client'

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { cn } from '@/lib/utils'
import type { ScoreDimension } from '@/types'

interface DimensionRadarChartProps {
  data: Record<ScoreDimension, number>
  className?: string
}

const dimensionLabels: Record<ScoreDimension, string> = {
  opener: 'Opener',
  pitch: 'Pitch',
  discovery: 'Discovery',
  objection_handling: 'Objections',
  closing: 'Closing',
  communication: 'Communication',
}

export function DimensionRadarChart({ data, className }: DimensionRadarChartProps) {
  // Check if all scores are 0 (no data)
  const hasData = Object.values(data).some((score) => score > 0)

  if (!hasData) {
    return (
      <div className={cn('flex items-center justify-center h-[300px]', className)}>
        <p className="text-muted-foreground text-center px-4">
          Complete practice sessions to see your skills breakdown.
        </p>
      </div>
    )
  }

  // Transform Record to array format for recharts
  const chartData = (Object.keys(dimensionLabels) as ScoreDimension[]).map((dimension) => ({
    dimension: dimensionLabels[dimension],
    score: data[dimension],
    fullMark: 10,
  }))

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid className="stroke-muted" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
            formatter={(value) => [`${value}/10`, 'Score']}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="var(--underdog-navy)"
            fill="var(--underdog-gold)"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
