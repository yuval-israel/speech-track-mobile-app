"use client"

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Info } from "lucide-react"

interface GaugeChartProps {
    value: number
    max: number
    label: string
    color: string
    subtext: string
    icon?: React.ReactNode
}

export function GaugeChart({
    value,
    max,
    label,
    color,
    subtext,
    icon
}: GaugeChartProps) {
    const data = [
        { name: "value", value: value },
        { name: "remainder", value: Math.max(0, max - value) }
    ]

    // Calculate percentage for display or just use raw value
    // Prompt asks for "A thick colored arc for the value, a gray track for the remainder."

    return (
        <Card className="border-none shadow-sm bg-slate-50/50 dark:bg-slate-900/50">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                    {label}
                </CardTitle>
                {icon && <div className="text-slate-400 bg-slate-200/50 p-2 rounded-full dark:bg-slate-800">{icon}</div>}
            </CardHeader>
            <CardContent className="flex flex-col items-center pb-6">
                <div className="relative w-full h-[180px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="70%" // Push it down to make it half-circle-ish appearance at top
                                startAngle={180}
                                endAngle={0}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={0}
                                dataKey="value"
                                stroke="none"
                            >
                                <Cell key="value" fill={color} />
                                <Cell key="remainder" fill="#e2e8f0" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Centered Value */}
                    <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                        <span className="text-4xl font-bold text-slate-700 dark:text-slate-200">
                            {value.toFixed(1)}
                        </span>
                    </div>
                </div>

                <div className="text-center mt-[-20px] px-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {subtext}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
