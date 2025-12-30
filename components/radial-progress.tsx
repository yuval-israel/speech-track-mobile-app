"use client"

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

interface RadialProgressProps {
  value: number
  max: number
}

export function RadialProgress({ value, max }: RadialProgressProps) {
  const percentage = (value / max) * 100

  const data = [
    { name: "filled", value: percentage },
    { name: "empty", value: 100 - percentage },
  ]

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={48}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
            >
              <Cell fill="#2563eb" />
              <Cell fill="#f1f5f9" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl font-bold text-slate-900">{value.toFixed(1)}</p>
            <p className="text-xs text-slate-600">/{max}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
