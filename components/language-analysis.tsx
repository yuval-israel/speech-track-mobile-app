"use client"

import { Lightbulb } from "lucide-react"
import { Card } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"

const posData = [
  { name: "Nouns", value: 40, fill: "#60a5fa" },
  { name: "Verbs", value: 30, fill: "#14b8a6" },
  { name: "Adjectives", value: 20, fill: "#818cf8" },
  { name: "Others", value: 10, fill: "#94a3b8" },
]

const weeklyData = [
  { day: "Mon", units: 45 },
  { day: "Tue", units: 52 },
  { day: "Wed", units: 48 },
  { day: "Thu", units: 61 },
  { day: "Fri", units: 55 },
  { day: "Sat", units: 67 },
  { day: "Sun", units: 72, highlight: true },
]

export function LanguageAnalysis() {
  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-50 px-4 py-6 border-b border-slate-200">
        <h1 className="text-2xl font-semibold text-slate-900">Language Analysis</h1>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Parts of Speech Card */}
        <Card className="bg-white border-0 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Vocabulary Mix</h2>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={posData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value">
                  {posData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 justify-center mt-6">
            {posData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
                <span className="text-sm text-slate-600">
                  {item.name} <span className="font-semibold">{item.value}%</span>
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Weekly Progress Card */}
        <Card className="bg-white border-0 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Weekly Progress</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="units"
                  fill="#60a5fa"
                  radius={[8, 8, 0, 0]}
                  shape={<BarWithHighlight highlight={weeklyData.map((d) => d.highlight)} />}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500 text-center mt-4">Language Units (Last 7 Days)</p>
        </Card>

        {/* Insight Box */}
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-6 h-6 text-blue-600" />
          </div>
          <Card className="bg-blue-50 border-0 shadow-sm rounded-2xl p-4 flex-1">
            <p className="text-sm text-slate-700 leading-relaxed">
              <span className="font-semibold text-blue-900">Insight:</span> Your child used more verbs today compared to
              last week! This indicates a shift towards more active storytelling.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}

function BarWithHighlight({ highlight }: { highlight: (boolean | undefined)[] }) {
  return null
}
