"use client"

import { useState, useEffect } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { api, Request } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Loader2, Bell, Search, Wrench, Clock, MapPin, Calendar, ArrowRight, Trash2 } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function AdminRequestsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"new" | "assigned" | "in-progress" | "completed">("new")
  const [requests, setRequests] = useState<{ [key: string]: Request[] }>({
    new: [],
    assigned: [],
    "in-progress": [],
    completed: []
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getRequests()
        if (res.requests) {
          // Map new statuses to tabs
          const newRequests = res.requests.filter((r: any) => ["Requested", "Reviewing"].includes(r.status)) as Request[]

          const assignedRequests = res.requests.filter((r: any) =>
            ["Team_Forming", "Invites_Sent", "Team_Confirmed", "Dispatched"].includes(r.status)
          ) as Request[]

          const inProgressRequests = res.requests.filter((r: any) =>
            ["On_The_Way", "Arrived", "Work_Started", "In_Progress", "Work_Completed", "Sign_Pending"].includes(r.status)
          ) as Request[]

          const completedRequests = res.requests.filter((r: any) =>
            ["Completed", "Invoiced", "Paid"].includes(r.status)
          ) as Request[]

          setRequests({
            new: newRequests,
            assigned: assignedRequests,
            "in-progress": inProgressRequests,
            completed: completedRequests
          })
        }
      } catch (error) {
        console.error("Failed to fetch requests", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const tabs: Array<"new" | "assigned" | "in-progress" | "completed"> = ["new", "assigned", "in-progress", "completed"]

  const currentList = requests[activeTab].filter(r =>
    (r.companyName || "").toLowerCase().includes(search.toLowerCase()) ||
    r.id.toLowerCase().includes(search.toLowerCase()) ||
    (r.serviceType || "").toLowerCase().includes(search.toLowerCase())
  )

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setRequestToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!requestToDelete) return
    try {
      await api.deleteRequest(requestToDelete)
      setRequests(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].filter(r => r.id !== requestToDelete)
      }))
      toast.success("Request deleted")
    } catch (e) {
      console.error(e)
      toast.error("Failed to delete")
    } finally {
      setDeleteDialogOpen(false)
      setRequestToDelete(null)
    }
  }

  return (
    <div className="min-h-screen pb-32 app-gradient">
      {/* Header */}
      <header className="sticky top-0 z-20 px-6 py-4 glass border-b-0 flex items-center justify-between transition-all">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Jobs</h1>
          <p className="text-xs text-muted-foreground font-medium">Manage Maintenance</p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button className="w-10 h-10 flex items-center justify-center hover:bg-muted/80 rounded-xl transition-colors ring-1 ring-border/50 active:scale-95 bg-background/50 shadow-sm">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="px-6 py-6 space-y-6">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-muted-foreground w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card/50 glass focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all border flex items-center gap-2 ${activeTab === tab
                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                : "bg-transparent hover:bg-muted text-muted-foreground border-border"
                }`}
            >
              <span>
                {tab === "new" && "New"}
                {tab === "assigned" && "Assigned"}
                {tab === "in-progress" && "In Progress"}
                {tab === "completed" && "Completed"}
              </span>

              {requests[tab].length > 0 && (
                <span className={`px-2 py-0.5 rounded-md text-xs font-bold transition-all ${activeTab === tab
                  ? "bg-white/20 text-white"
                  : "bg-muted-foreground/10 text-muted-foreground"
                  }`}>
                  {requests[tab].length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          /* Jobs List */
          <div className="space-y-3">
            {currentList.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border border-dashed border-border/60 rounded-2xl bg-muted/5">
                No {activeTab.replace('-', ' ')} jobs found
              </div>
            ) : (
              currentList.map((req: any) => (
                <div
                  key={req.id}
                  onClick={() => router.push(`/admin/requests/${req.id}`)}
                  className="glass-card p-4 rounded-2xl flex flex-col gap-4 group cursor-pointer hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/50 dark:to-blue-900/50 flex items-center justify-center shadow-inner ring-1 ring-border/50">
                        {/* Dynamic Icon based on type if possible, or generic */}
                        <Wrench className="text-primary w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{req.companyName || req.companyId}</p>
                        <p className="text-xs text-muted-foreground font-mono tracking-wider mt-0.5">
                          {req.id}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wider border ${req.priority === "Emergency"
                        ? "bg-red-500/10 text-red-600 border-red-500/20"
                        : req.priority === "Urgent"
                          ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                          : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                        }`}
                    >
                      {req.priority}
                    </span>
                  </div>

                  {/* Info Row */}
                  <div className="grid grid-cols-2 gap-y-2 text-xs text-muted-foreground pt-1 px-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-primary/60" />
                      <span>{req.serviceType || "General"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-primary/60" />
                      <span>{req.preferredDate || (req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "Unknown")}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-border/40">
                    <button className="flex-1 py-2.5 rounded-xl border border-border bg-white/50 dark:bg-black/20 text-sm font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-2">
                      View Details <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    {activeTab === "new" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/admin/jobs/${req.id}/assign`)
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                        Assign Team
                      </button>
                    )}
                    {(activeTab === "assigned" || activeTab === "completed") && (
                      <button
                        onClick={(e) => handleDeleteClick(e, req.id)}
                        className="px-3 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors dark:bg-red-950/30 dark:border-red-900 flex items-center justify-center"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the request and any associated job data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav active="jobs" role="admin" />
    </div>
  )
}
