"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Info, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useLanguage } from "@/contexts/language-context"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"

interface MetricsCardProps {
  title: string
  value: string | number
  trend?: string
  trendUp?: boolean
  description?: string
  chartData?: Array<{ name: string; value: number }>
  type?: "bar" | "text" | "chart"
  variant?: "default" | "tinted"
}

export function MetricsCard({ title, value, trend, trendUp, description, chartData, type = "text", variant = "default" }: MetricsCardProps) {
  const { isRTL } = useLanguage()

  return (
    <Card className={`rounded-2xl transition-all ${variant === "tinted"
        ? "bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 shadow-sm"
        : "bg-gradient-to-br from-muted/50 to-muted/20 border-muted"
      } ${isRTL ? "rtl" : ""}`}>
      <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2 ${isRTL ? "flex-row-reverse" : ""}`}>
        <CardTitle className={`text-sm font-medium ${isRTL ? "text-right" : ""}`}>{title}</CardTitle>
        {description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>{description}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardHeader>
      <CardContent>
        {type === "text" ? (
          <div className={`flex items-baseline gap-2 ${isRTL ? "flex-row-reverse justify-start" : ""}`}>
            <div className={`text-2xl font-bold ${isRTL ? "text-right" : ""}`}>{value}</div>
            {trend && (
              <div className={`flex items-center text-xs font-medium ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
                {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {trend}
              </div>
            )}
          </div>
        ) : (
          Array.isArray(chartData) && chartData.length > 0 ? (
            <div className="h-[120px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="var(--muted-foreground)"
                    style={{ fontSize: "10px" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis hide />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[120px] flex items-center justify-center text-muted-foreground text-xs italic">
              No data available
            </div>
          )
        )}
      </CardContent>
    </Card>
  )
}
