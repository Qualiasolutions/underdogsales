'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { DailyMetric } from '@/lib/actions/admin'

interface UsageChartsProps {
  data: DailyMetric[]
}

export function UsageCharts({ data }: UsageChartsProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="font-semibold text-navy mb-4">Activity Trend</h3>
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground text-center">
            No activity data yet.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <h3 className="font-semibold text-navy mb-4">Activity Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            className="text-muted-foreground"
          />
          <YAxis
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
          />
          <Area
            type="monotone"
            dataKey="sessions"
            name="Sessions"
            stroke="var(--underdog-navy)"
            fill="var(--underdog-navy)"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="calls"
            name="Calls"
            stroke="var(--underdog-gold)"
            fill="var(--underdog-gold)"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: 'var(--underdog-navy)' }}
          />
          <span className="text-muted-foreground">Sessions</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: 'var(--underdog-gold)' }}
          />
          <span className="text-muted-foreground">Calls</span>
        </div>
      </div>
    </div>
  )
}
