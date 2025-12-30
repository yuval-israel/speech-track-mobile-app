import { ArrowUpRight, ArrowDownRight } from "lucide-react"

interface MetricsCardProps {
  title: string
  value: string
  trend?: string
  trendUp?: boolean
  description?: string
  chartData?: Array<{ name: string; value: number }>
}

export function MetricsCard({ title, value, trend, trendUp, description, chartData }: MetricsCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold">{value}</p>
        {trend && (
          <div className={`flex items-center text-xs font-medium ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
            {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trend}
          </div>
        )}
      </div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}

      {chartData && (
        <div className="h-12 flex items-end gap-1 mt-3">
          {chartData.map((item, index) => (
            <div
              key={index}
              className="flex-1 bg-accent/20 rounded-t"
              style={{ height: `${(item.value / Math.max(...chartData.map((d) => d.value))) * 100}%` }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
