'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { cn } from '@/lib/utils'

interface ScoreTrendChartProps {
  data: Array<{ date: string; score: number }>
  className?: string
}

export function ScoreTrendChart({ data, className }: ScoreTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-[300px]', className)}>
        <p className="text-muted-foreground text-center">
          No practice sessions yet.
          <br />
          <span className="text-sm">Complete a practice session to see your progress.</span>
        </p>
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            className="text-muted-foreground"
          />
          <YAxis
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            className="text-muted-foreground"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}
            itemStyle={{ color: 'var(--underdog-navy)' }}
            formatter={(value) => [`${value}/10`, 'Score']}
          />
          <ReferenceLine
            y={7}
            stroke="var(--underdog-gold)"
            strokeDasharray="5 5"
            strokeWidth={1.5}
            label={{
              value: 'Target',
              position: 'right',
              fill: 'var(--underdog-gold)',
              fontSize: 11,
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="var(--underdog-navy)"
            strokeWidth={2.5}
            dot={{ fill: 'var(--underdog-navy)', strokeWidth: 0, r: 4 }}
            activeDot={{
              fill: 'var(--underdog-gold)',
              stroke: 'var(--underdog-navy)',
              strokeWidth: 2,
              r: 6,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
