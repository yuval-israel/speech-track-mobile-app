interface MetricsCardProps {
  title: string
  value: string
  description: string
  chartData?: Array<{ name: string; value: number }>
}

export function MetricsCard({ title, value, description, chartData }: MetricsCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{description}</p>

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
