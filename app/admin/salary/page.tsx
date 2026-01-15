"use client"

import { useState } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"

export default function AdminSalaryPage() {
  const [period, setPeriod] = useState("January 2025")

  const salaryData = [
    {
      name: "Raj Kumar",
      days: 24,
      substituted: 0,
      netDays: 24,
      rate: 800,
      deductions: 0,
      net: 19200,
    },
    {
      name: "Priya Singh",
      days: 22,
      substituted: 1,
      netDays: 21,
      rate: 750,
      deductions: 500,
      net: 15250,
    },
    {
      name: "Amit Patel",
      days: 20,
      substituted: 0,
      netDays: 20,
      rate: 900,
      deductions: 0,
      net: 18000,
    },
  ]

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <header className="sticky top-0 z-20 px-6 py-4 glass border-b-0 flex items-center justify-between transition-all">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Salary Management</h1>
          <p className="text-xs text-muted-foreground font-medium">{period}</p>
        </div>
      </header>

      <main className="px-6 py-6 transition-all">

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="glass-card bg-blue-500/10 border-blue-500/20 p-4 rounded-2xl text-center">
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-1">₹52.45K</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Total Payable</div>
          </div>
          <div className="glass-card bg-purple-500/10 border-purple-500/20 p-4 rounded-2xl text-center">
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-1">3</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Technicians</div>
          </div>
          <div className="glass-card bg-green-500/10 border-green-500/20 p-4 rounded-2xl text-center">
            <div className="text-xl font-bold text-green-600 dark:text-green-400 mb-1">66</div>
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
