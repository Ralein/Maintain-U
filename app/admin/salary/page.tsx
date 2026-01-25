"use client"

import { useEffect, useState } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Download, RefreshCw, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

export default function AdminSalaryPage() {
  const [period, setPeriod] = useState("January 2025")

  const [salaryData, setSalaryData] = useState<any[]>([])
  const [summary, setSummary] = useState({ totalPayable: 0, totalTechs: 0, totalWorkDays: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [period])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await api.getSalaryData(period)
      setSalaryData(res.technicians || [])
      setSummary(res.summary || { totalPayable: 0, totalTechs: 0, totalWorkDays: 0 })
      setSelectedIds([]) // Reset selection on period change
    } catch (e) {
      toast.error("Failed to fetch salary data")
    } finally {
      setLoading(false)
    }
  }

  const handleProcessPayment = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one technician")
      return
    }

    setProcessing(true)
    try {
      const res = await api.processSalaryPayment(selectedIds, period)
      if (res.success) {
        toast.success(res.message)
        fetchData() // Refresh
      } else {
        toast.error(res.message)
      }
    } catch (e) {
      toast.error("Payment processing failed")
    } finally {
      setProcessing(false)
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selectedIds.length === salaryData.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(salaryData.map(t => t.id))
    }
  }

  const changePeriod = (dir: "prev" | "next") => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const [m, y] = period.split(" ")
    let mIdx = months.indexOf(m)
    let year = parseInt(y)

    if (dir === "prev") {
      mIdx--
      if (mIdx < 0) { mIdx = 11; year-- }
    } else {
      mIdx++
      if (mIdx > 11) { mIdx = 0; year++ }
    }
    setPeriod(`${months[mIdx]} ${year}`)
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
          <div className="flex bg-muted/50 rounded-xl p-1 items-center border border-border/50">
            <button onClick={() => changePeriod("prev")} className="p-1.5 hover:bg-background rounded-lg transition-all active:scale-90"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-[10px] font-black uppercase px-2 tracking-tighter min-w-[100px] text-center">{period}</span>
            <button onClick={() => changePeriod("next")} className="p-1.5 hover:bg-background rounded-lg transition-all active:scale-90"><ChevronRight className="w-4 h-4" /></button>
          </div>
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
          <button
            onClick={selectAll}
            className={`glass-card flex-1 py-3 text-sm font-bold rounded-xl transition-all ${selectedIds.length === salaryData.length && salaryData.length > 0 ? 'bg-primary/20 text-primary border-primary/30' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
          >
            {selectedIds.length === salaryData.length && salaryData.length > 0 ? "Deselect All" : "Select All"}
          </button>
          <button
            onClick={handleProcessPayment}
            disabled={processing || selectedIds.length === 0}
            className="bg-primary text-primary-foreground font-bold flex-[2] py-3 text-sm rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {processing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Process {selectedIds.length > 0 ? `${selectedIds.length} Payments` : "Payment"}
          </button>
        </div>

        {/* Salary List */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Calculating Payroll...</p>
            </div>
          ) : salaryData.length === 0 ? (
            <div className="glass-card p-12 rounded-[2.5rem] text-center border-dashed border-2 flex flex-col items-center gap-4">
              <div className="p-4 bg-muted/50 rounded-full text-muted-foreground/30">
                <AlertCircle className="w-10 h-10" />
              </div>
              <div>
                <p className="text-foreground font-black text-base">No Unpaid Salary</p>
                <p className="text-xs text-muted-foreground mt-1">All attendance for {period} has been settled or no records exist.</p>
              </div>
            </div>
          ) : (
            salaryData.map((tech, idx) => (
              <div
                key={tech.id}
                onClick={() => toggleSelect(tech.id)}
                className={`glass-card p-5 rounded-[2rem] cursor-pointer group transition-all relative overflow-hidden active:scale-[0.99] border-2 ${selectedIds.includes(tech.id) ? 'border-primary bg-primary/5 shadow-xl shadow-primary/5 scale-[1.02]' : 'border-transparent shadow-lg shadow-black/5 hover:border-primary/20'}`}
              >
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-colors ${selectedIds.includes(tech.id) ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                      {tech.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-foreground text-base tracking-tight leading-tight">{tech.name}</h3>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{tech.netDays} days present</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-xl tracking-tighter ${selectedIds.includes(tech.id) ? 'text-primary' : 'text-foreground'}`}>₹{tech.net.toLocaleString()}</p>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Net payable</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center relative z-10">
                  <div className="flex gap-2">
                    <span className="text-[10px] font-black uppercase bg-muted/50 px-3 py-1 rounded-full text-muted-foreground">Rate: ₹{tech.rate}</span>
                    <span className="text-[10px] font-black uppercase bg-red-500/10 px-3 py-1 rounded-full text-red-600">Ded: ₹{tech.deductions}</span>
                  </div>
                  {selectedIds.includes(tech.id) && (
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white animate-in zoom-in duration-300">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </main>
      <BottomNav active="salary" role="admin" />
    </div>
  )
}
