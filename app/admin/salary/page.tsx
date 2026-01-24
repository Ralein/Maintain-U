"use client"

import { useEffect, useState } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Download, RefreshCw } from "lucide-react"
import { api } from "@/lib/api"

export default function AdminSalaryPage() {
  const [period, setPeriod] = useState("January 2025")

  const [salaryData, setSalaryData] = useState<any[]>([])
  const [summary, setSummary] = useState({ totalPayable: 0, totalTechs: 0, totalWorkDays: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [period])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await api.getSalaryData(period)
      setSalaryData(res.technicians || [])
      setSummary(res.summary || { totalPayable: 0, totalTechs: 0, totalWorkDays: 0 })
    } catch (e) {
      console.error("Failed to fetch salary data")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <header className="sticky top-0 z-20 px-6 py-4 glass border-b-0 flex items-center justify-between transition-all">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Salary</h1>
          <p className="text-xs text-muted-foreground font-medium">{period}</p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />

        </div>
      </header>

      <main className="px-6 py-6 transition-all">

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="glass-card bg-blue-500/10 border-blue-500/20 p-4 rounded-2xl text-center">
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              ₹{summary.totalPayable > 1000 ? (summary.totalPayable / 1000).toFixed(1) + 'K' : summary.totalPayable}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Total Payable</div>
          </div>
          <div className="glass-card bg-purple-500/10 border-purple-500/20 p-4 rounded-2xl text-center">
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-1">{summary.totalTechs}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Technicians</div>
          </div>
          <div className="glass-card bg-green-500/10 border-green-500/20 p-4 rounded-2xl text-center">
            <div className="text-xl font-bold text-green-600 dark:text-green-400 mb-1">{summary.totalWorkDays}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Work Days</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button className="glass-card flex-1 py-3 text-sm font-bold rounded-xl hover:bg-muted/50 transition-all text-muted-foreground hover:text-foreground">
            Select All
          </button>
          <button className="bg-primary text-primary-foreground font-bold flex-1 py-3 text-sm rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20">
            Process Payment
          </button>
        </div>

        {/* Salary Table */}
        <div className="space-y-3">
          {salaryData.map((tech, idx) => (
            <div
              key={idx}
              className="glass-card p-4 rounded-2xl cursor-pointer group hover:border-primary/30 transition-all border-white/20"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-bold text-foreground group-hover:text-primary transition-colors">{tech.name}</p>
                  <p className="text-xs text-muted-foreground">{tech.netDays} net days</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600 dark:text-green-400">₹{tech.net.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Net payable</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground flex justify-between pt-2 border-t border-border/30">
                <span className="font-medium bg-muted/50 px-2 py-0.5 rounded">Rate: ₹{tech.rate}/day</span>
                <span className="font-medium bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 rounded">Ded: ₹{tech.deductions}</span>
              </div>
            </div>
          ))}
        </div>

      </main>
      <BottomNav active="salary" role="admin" />
    </div>
  )
}
