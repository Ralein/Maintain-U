"use client"

import { useState, useEffect } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import {
  Zap,
  Wrench,
  ArrowRight,
  Bell,
  MapPin,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Calendar
} from "lucide-react"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { formatTicketId } from "@/lib/utils"

export default function TechnicianJobsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"invitations" | "my-jobs" | "calendar">("my-jobs")
  const [invitations, setInvitations] = useState<any[]>([])
  const [myJobs, setMyJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<number>(new Date().getDate())

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.getJobs()
        const allJobs = res.jobs || []

        // Separating Pending (Invitations) from Assigned/Active (My Jobs)
        // Note: In current simple logic, invitations might be jobs with status 'Pending' 
        // assigned to them but not yet accepted.
        const pending = allJobs.filter((j: any) => j.status === 'Pending')
        const accepted = allJobs.filter((j: any) =>
          ['Accepted', 'In Progress', 'In_Progress', 'Completed', 'Team_Confirmed', 'Dispatched'].includes(j.status)
        )

        setInvitations(pending)
        setMyJobs(accepted)
      } catch (error) {
        console.error("Failed to fetch jobs")
        toast.error("Failed to fetch jobs")
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const handleAccept = async (jobId: string) => {
    try {
      await api.acceptJob(jobId)
      toast.success("Job accepted successfully")
      // Quick refresh logic
      const res = await api.getJobs()
      const allJobs = res.jobs || []
      setInvitations(allJobs.filter((j: any) => j.status === 'Pending'))
      setMyJobs(allJobs.filter((j: any) => ['Accepted', 'In Progress', 'In_Progress'].includes(j.status)))
    } catch (e) {
      toast.error("Failed to accept job")
    }
  }

  // Calendar Helpers
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const now = new Date();
  const currentMonthNum = now.getMonth();
  const currentYear = now.getFullYear();
  const monthName = now.toLocaleString('default', { month: 'long' });

  // Map jobs to calendar dates
  const jobDates = myJobs.reduce((acc: any, job: any) => {
    if (job.date) {
      const d = new Date(job.date).getDate();
      if (!acc[d]) acc[d] = [];
      acc[d].push(job);
    }
    return acc;
  }, {});

  return (
    <div className="min-h-screen pb-32 app-gradient">
      {/* Header */}
      <header className="sticky top-0 z-30 px-6 py-4 glass border-b-0 mb-6 flex items-center justify-between transition-all shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Worker Portal</h1>
          <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Manage Your Schedule
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => router.push("/technician/notifications")}
            className="w-10 h-10 flex items-center justify-center hover:bg-muted/80 rounded-xl transition-colors ring-1 ring-border/50 active:scale-95 bg-background/50 shadow-sm"
          >
            <Bell className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </header>

      <main className="px-6 space-y-8">

        {/* Custom Tab Switcher */}
        <div className="flex p-1.5 glass-card rounded-2xl gap-1 overflow-x-auto select-none">
          {(["invitations", "my-jobs", "calendar"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[100px] py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === tab
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 translate-y-[-1px]"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
            >
              {tab === "invitations" ? "Alerts" : tab === "my-jobs" ? "Jobs" : "Calendar"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <p className="text-sm font-bold text-muted-foreground animate-pulse">Syncing jobs...</p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Invitations Tab */}
            {activeTab === "invitations" && (
              <div className="space-y-4">
                {invitations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-10 text-center glass-card rounded-3xl border-dashed border-2">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 transition-transform hover:rotate-12 duration-300">
                      <Zap className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <p className="font-bold text-muted-foreground">No New Invitations</p>
                    <p className="text-xs text-muted-foreground/70 mt-1 uppercase tracking-tight">Check back later for available assignments</p>
                  </div>
                ) : (
                  invitations.map((inv) => (
                    <div
                      key={inv.id}
                      className="glass-card p-6 rounded-3xl border-l-4 border-l-primary hover:translate-x-1 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-primary" strokeWidth={2} />
                          </div>
                          <div>
                            <p className="font-black text-lg leading-none">{inv.company}</p>
                            <p className="text-xs font-bold text-primary mt-1 uppercase tracking-wider">{inv.service}</p>
                          </div>
                        </div>
                        <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase">NEW</span>
                      </div>

                      <div className="space-y-2.5 mb-6">
                        <div className="flex items-center gap-2 text-sm text-foreground/80 font-medium">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{inv.location || "Site Address"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-foreground/80 font-medium">
                          <Briefcase className="w-4 h-4 text-muted-foreground" />
                          <span>{inv.duration || "Single Visit"} • {inv.rate || "Fixed Pay"}</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button className="flex-1 py-3.5 rounded-2xl glass font-black text-xs uppercase tracking-widest hover:bg-muted/50 transition-all active:scale-95">Decline</button>
                        <button
                          onClick={() => handleAccept(inv.id)}
                          className="flex-[2] py-3.5 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95"
                        >
                          Accept Job
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* My Jobs Tab */}
            {activeTab === "my-jobs" && (
              <div className="space-y-4">
                {myJobs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-10 text-center glass-card rounded-3xl border-dashed border-2">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Wrench className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <p className="font-bold text-muted-foreground">You Have No Active Jobs</p>
                    <p className="text-xs text-muted-foreground/70 mt-1 uppercase tracking-tight">Accepted invitations will appear here</p>
                  </div>
                ) : (
                  myJobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => router.push(`/technician/jobs/${job.id}`)}
                      className="glass-card p-6 rounded-3xl group cursor-pointer hover:border-primary/50 transition-all duration-300 relative overflow-hidden active:scale-[0.99]"
                    >
                      <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl -mr-12 -mt-12 transition-colors duration-500 ${(job.status === 'In_Progress' || job.status === 'In Progress') ? 'bg-orange-500/10' : 'bg-primary/10'}`} />

                      <div className="flex items-start justify-between mb-4 relative z-10">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${(job.status === 'In_Progress' || job.status === 'In Progress') ? 'bg-orange-500/10 text-orange-600' : 'bg-primary/10 text-primary'}`}>
                            <Zap className="w-6 h-6" strokeWidth={2} />
                          </div>
                          <div>
                            <p className="font-black text-lg leading-none group-hover:text-primary transition-colors">{job.company}</p>
                            <p className="text-[10px] font-mono font-bold text-muted-foreground mt-1 tracking-tighter uppercase">{formatTicketId(job.id)}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest border transition-colors ${(job.status === 'In_Progress' || job.status === 'In Progress')
                          ? 'bg-orange-500/10 text-orange-600 border-orange-500/20'
                          : job.status === 'Completed'
                            ? 'bg-green-500/10 text-green-600 border-green-500/20'
                            : 'bg-primary/10 text-primary border-primary/20'
                          }`}>
                          {job.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50 relative z-10">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs font-bold text-foreground/80">{job.date ? new Date(job.date).toLocaleDateString() : "No Date Set"}</span>
                        </div>

                        {(job.status === 'Accepted' || job.status === 'Team_Confirmed' || job.status === 'Dispatched') ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/technician/jobs/${job.id}`);
                            }}
                            className="bg-primary text-primary-foreground text-[10px] font-black px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95 uppercase tracking-widest"
                          >
                            Check In
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 text-primary text-xs font-black uppercase tracking-widest group-hover:gap-2 transition-all">
                            Details <ArrowRight className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Calendar Tab */}
            {activeTab === "calendar" && (
              <div className="animate-in zoom-in-95 duration-500">
                <div className="glass-card p-8 rounded-[2rem] shadow-xl border-t border-white/20">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="font-black text-2xl tracking-tight">{monthName}</h2>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{currentYear}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="w-10 h-10 glass rounded-xl flex items-center justify-center hover:bg-muted/50 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                      <button className="w-10 h-10 glass rounded-xl flex items-center justify-center hover:bg-muted/50 transition-colors"><ChevronRight className="w-5 h-5" /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                      <div key={i} className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                        {day}
                      </div>
                    ))}

                    {/* Empty cells before month start */}
                    {Array.from({ length: getFirstDayOfMonth(currentYear, currentMonthNum) }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square" />
                    ))}

                    {/* Real Month Days */}
                    {Array.from({ length: getDaysInMonth(currentYear, currentMonthNum) }).map((_, i) => {
                      const dayNum = i + 1;
                      const hasJobs = jobDates[dayNum] && jobDates[dayNum].length > 0;
                      const isDayToday = dayNum === now.getDate();
                      const isDaySelected = dayNum === selectedDate;

                      return (
                        <div
                          key={dayNum}
                          onClick={() => setSelectedDate(dayNum)}
                          className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-all relative group cursor-pointer
                              ${isDaySelected
                              ? "bg-primary text-primary-foreground shadow-xl shadow-primary/30 z-10 scale-105"
                              : isDayToday
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : hasJobs
                                  ? "bg-muted/50 text-foreground border border-border/50 hover:border-primary/50"
                                  : "hover:bg-muted/30 text-foreground"
                            }`}
                        >
                          <span className="text-sm font-bold relative z-10">{dayNum}</span>
                          {hasJobs && (
                            <div className="mt-0.5 flex flex-col items-center gap-0.5 w-full px-1 overflow-hidden">
                              <span className={`text-[7px] font-black uppercase truncate w-full text-center ${isDaySelected ? 'text-primary-foreground/80' : 'text-primary'}`}>
                                {jobDates[dayNum][0].service}
                              </span>
                              {!isDaySelected && <div className="w-1 h-1 rounded-full bg-primary" />}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-10 grid grid-cols-2 gap-4">
                    <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Today</span>
                    </div>
                    <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary/20 ring-2 ring-primary/40" />
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Scheduled Job</span>
                    </div>
                  </div>
                </div>

                {/* Active Jobs for Selected Date */}
                {jobDates[selectedDate] && (
                  <div className="mt-8 animate-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between mb-4 px-2">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                        {selectedDate === now.getDate() ? "Scheduled Today" : `Scheduled for Jan ${selectedDate}`}
                      </h3>
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">
                        {jobDates[selectedDate].length} {jobDates[selectedDate].length === 1 ? 'Job' : 'Jobs'}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {jobDates[selectedDate].map((j: any) => (
                        <div key={j.id} onClick={() => router.push(`/technician/jobs/${j.id}`)} className="glass-card p-5 rounded-3xl flex items-center justify-between border-l-4 border-l-primary hover:translate-x-1 transition-all group cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-sm shadow-inner group-hover:bg-primary group-hover:text-white transition-colors">
                              {j.company.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-base leading-none group-hover:text-primary transition-colors">{j.company}</p>
                              <p className="text-[10px] font-bold text-muted-foreground tracking-tight mt-1 flex items-center gap-1.5 uppercase">
                                <span className="w-1 h-1 rounded-full bg-primary" />
                                {j.service}
                              </p>
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded-2xl glass flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                            <ArrowRight className="w-5 h-5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </main>
      <BottomNav active="jobs" role="technician" />
    </div>
  )
}
