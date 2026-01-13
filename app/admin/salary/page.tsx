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
    <div className="min-h-screen px-6 pt-6 pb-32">
      {/* Header */}
      <h1 className="text-2xl font-bold text-white mb-2">Salary Management</h1>
      <p className="text-slate-400 text-sm mb-6">{period}</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="backdrop-blur-md bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-white/20 rounded-2xl p-5 text-center">
          <div className="text-3xl font-bold text-blue-300 mb-1">₹52.45K</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">Total Payable</div>
        </div>
        <div className="backdrop-blur-md bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-white/20 rounded-2xl p-5 text-center">
          <div className="text-3xl font-bold text-purple-300 mb-1">3</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">Technicians</div>
        </div>
        <div className="backdrop-blur-md bg-gradient-to-br from-green-500/20 to-green-600/20 border border-white/20 rounded-2xl p-5 text-center">
          <div className="text-3xl font-bold text-green-300 mb-1">66</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">Work Days</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-6">
        <button className="backdrop-blur-sm bg-white/5 border border-white/20 text-white font-semibold flex-1 py-3 text-sm rounded-xl hover:bg-white/10 hover:border-white/30 transition-all">
          Select All
        </button>
        <button className="backdrop-blur-sm bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold flex-1 py-3 text-sm rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-blue-500/30">
          Process
        </button>
      </div>

      {/* Salary Table */}
      <div className="space-y-3">
        {salaryData.map((tech, idx) => (
          <div
            key={idx}
            className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-5 cursor-pointer group hover:bg-white/15 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="font-semibold text-white group-hover:text-blue-300 transition-colors">{tech.name}</p>
                <p className="text-xs text-slate-400">{tech.netDays} net days</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-300">₹{tech.net.toLocaleString()}</p>
                <p className="text-xs text-slate-400">Net payable</p>
              </div>
            </div>
            <div className="text-xs text-slate-400 flex justify-between">
              <span>Rate: ₹{tech.rate}/day</span>
              <span>Deductions: ₹{tech.deductions}</span>
            </div>
          </div>
        ))}
      </div>

      <BottomNav active="salary" role="admin" />
    </div>
  )
}
