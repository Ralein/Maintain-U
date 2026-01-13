"use client"

import { useState } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"

export default function AdminTechniciansPage() {
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "active">("all")

  const technicians = {
    all: [
      { id: "T-001", name: "Raj Kumar", skill: "Electrical", rating: 4.8, status: "Available" },
      { id: "T-002", name: "Priya Singh", skill: "Mechanical", rating: 4.6, status: "Available" },
      { id: "T-003", name: "Amit Patel", skill: "HVAC", rating: 4.9, status: "Busy" },
    ],
    pending: [
      { id: "T-004", name: "Rohan Verma", skill: "Electrical", rating: 0, status: "Pending" },
      { id: "T-005", name: "Deepak Rao", skill: "Plumbing", rating: 0, status: "Pending" },
    ],
    active: [
      { id: "T-001", name: "Raj Kumar", skill: "Electrical", rating: 4.8, status: "Available" },
      { id: "T-003", name: "Amit Patel", skill: "HVAC", rating: 4.9, status: "Busy" },
    ],
  }

  return (
    <div className="min-h-screen px-6 pt-6 pb-32">
      {/* Header */}
      <h1 className="text-2xl font-bold text-white mb-6">Technicians</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(["all", "pending", "active"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all relative ${
              activeTab === tab
                ? "backdrop-blur-md bg-blue-500/30 border border-blue-400/50 text-blue-300"
                : "backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/15 text-slate-400"
            }`}
          >
            {tab === "all" && "All"}
            {tab === "pending" && "Pending"}
            {tab === "active" && "Active"}
            {tab === "pending" && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                2
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Technicians Grid */}
      <div className="space-y-3">
        {technicians[activeTab].map((tech: any) => (
          <div
            key={tech.id}
            className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-5 group cursor-pointer hover:bg-white/15 transition-all"
          >
            <div className="flex items-start gap-4 mb-3">
              <div className="w-12 h-12 backdrop-blur-md bg-white/10 border border-white/20 rounded-lg flex items-center justify-center text-xl">
                👤
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white group-hover:text-blue-300 transition-colors">{tech.name}</p>
                <p className="text-xs text-slate-400">{tech.skill}</p>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                  tech.status === "Available"
                    ? "bg-green-500/30 text-green-300"
                    : tech.status === "Busy"
                      ? "bg-yellow-500/30 text-yellow-300"
                      : "bg-slate-500/30 text-slate-300"
                }`}
              >
                {tech.status}
              </span>
            </div>
            {tech.rating > 0 && (
              <div className="flex items-center gap-1 mb-3">
                <span className="text-yellow-400">★</span>
                <span className="text-sm text-white font-semibold">{tech.rating}</span>
              </div>
            )}
            <button className="backdrop-blur-sm bg-white/5 border border-white/20 text-white font-semibold py-2 text-xs rounded-xl hover:bg-white/10 hover:border-white/30 transition-all w-full">
              {activeTab === "pending" ? "Review" : "View Profile"}
            </button>
          </div>
        ))}
      </div>

      <BottomNav active="team" role="admin" />
    </div>
  )
}
