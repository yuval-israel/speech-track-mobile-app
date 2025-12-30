"use client"

import { LineChart, Line, ResponsiveContainer } from "recharts"

export function Sparkline() {
  const data = [{ value: 45 }, { value: 52 }, { value: 48 }, { value: 61 }, { value: 55 }, { value: 67 }, { value: 72 }]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={2} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
