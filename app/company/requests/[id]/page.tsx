"use client"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { CheckCircle2, Loader2, ArrowLeft, Clock, Calendar, MapPin, User, Phone, AlertTriangle, FileText, Briefcase, Star, MessageSquare } from "lucide-react"
import { toast } from "sonner"
import { useEffect, useState, use } from "react"
import { api, Request } from "@/lib/api"
import { useRouter } from "next/navigation"
import { formatTicketId } from "@/lib/utils"

export default function RequestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [request, setRequest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [review, setReview] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getRequestById(id)
        if (res.request) {
          setRequest(res.request)
        }
      } catch (error) {
        console.error("Failed to fetch request", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleRate = async () => {
    if (rating === 0) return
    setSubmitting(true)
    try {
      const res = await api.submitRating(request.jobId, request.technicianId, rating, review)
      if (res.success) {
        toast.success("Thank you for your feedback!")
        const updated = await api.getRequestById(id)
        if (updated.request) setRequest(updated.request)
      } else {
        toast.error("Failed to submit rating")
      }
    } catch (e) {
      toast.error("An error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <p className="text-muted-foreground">Request not found</p>
        <button onClick={() => router.back()} className="text-primary hover:underline font-medium">Go Back</button>
      </div>
    )
  }

  const steps = ["New", "Assigned", "In Progress", "Completed"]

  // Map backend status to timeline steps
  const getStepIndex = (status: string) => {
    switch (status) {
      case "Requested":
      case "Reviewing":
      case "New":
        return 0;
      case "Team_Forming":
      case "Invites_Sent":
      case "Team_Confirmed":
      case "Dispatched":
      case "Assigned":
        return 1;
      case "On_The_Way":
      case "Arrived":
      case "Work_Started":
      case "In_Progress":
      case "Sign_Pending":
      case "Work_Completed":
        return 2;
      case "Completed":
      case "Invoiced":
      case "Paid":
        return 3;
      default:
        return 0;
    }
  }

  const currentStepIndex = getStepIndex(request.status)
  const isCancelled = request.status === "Cancelled"

  return (
    <div className="min-h-screen bg-background pb-32 relative">
      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Header */}
      <div className="relative pt-8 px-6 pb-6">
        <button
          onClick={() => router.back()}
          className="mb-6 p-2.5 -ml-2 hover:bg-muted/50 rounded-full transition-colors flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary uppercase tracking-wider border border-primary/20">
              {request.type} Service
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${request.priority === 'Urgent' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
              request.priority === 'Emergency' ? 'bg-red-600/10 text-red-600 border-red-600/20' :
                'bg-blue-500/10 text-blue-500 border-blue-500/20'
              }`}>
              {request.priority}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mt-2">{request.description}</h1>
          <p className="text-muted-foreground font-mono text-xs">Ticket: {formatTicketId(request.id)}</p>
        </div>
      </div>

      <div className="px-6 space-y-6 relative z-10">

        {/* Progress Card */}
        <section className="glass-card p-6 rounded-3xl shadow-xl shadow-black/5 dark:shadow-black/20 border-t border-white/10">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Request Timeline
          </h2>

          <div className="relative pl-8 space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-muted/50">
            {steps.map((step, idx) => {
              const isCompleted = currentStepIndex >= idx
              const isCurrent = currentStepIndex === idx
              return (
                <div key={step} className="relative flex items-center gap-4 group">
                  <div className={`
                                 absolute left-[-21px] w-4 h-4 rounded-full border-2 transition-all duration-500 z-10
                                 ${isCompleted || isCurrent ? 'bg-primary border-primary shadow-[0_0_10px_rgba(var(--primary),0.4)]' : 'bg-background border-muted group-hover:border-primary/50'}
                             `}>
                    {isCompleted && <CheckCircle2 className="w-full h-full text-primary-foreground p-[1px]" />}
                  </div>
                  <div className={`transition-all duration-300 ${isCurrent ? 'translate-x-1' : ''}`}>
                    <p className={`text-sm font-bold ${isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>{step}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      {isCompleted ? "Completed" : isCurrent ? "Current Stage" : "Pending"}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Details Grid */}
        <section className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4 rounded-2xl flex flex-col gap-2 hover:bg-muted/30 transition-colors">
            <Calendar className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Date</p>
              <p className="font-semibold text-sm">{request.date}</p>
            </div>
          </div>
          <div className="glass-card p-4 rounded-2xl flex flex-col gap-2 hover:bg-muted/30 transition-colors">
            <Clock className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Time Slot</p>
              <p className="font-semibold text-sm">{request.timeSlot || "Anytime"}</p>
            </div>
          </div>
          <div className="glass-card p-4 rounded-2xl flex flex-col gap-2 hover:bg-muted/30 transition-colors col-span-2">
            <FileText className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Description</p>
              <p className="text-sm leading-relaxed text-muted-foreground text-foreground/80">{request.description}</p>
            </div>
          </div>
        </section>

        {/* Reference Photos */}
        {request.photos && (request.photos as string[]).filter((url: string) => url?.trim() !== "").length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-bold mb-4 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full" />
                <span>Issue Photos</span>
              </div>
              <span className="text-[10px] font-black bg-muted px-2 py-1 rounded-full text-muted-foreground uppercase tracking-widest leading-none">
                {(request.photos as string[]).filter((url: string) => url?.trim() !== "").length} Total
              </span>
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {(request.photos as string[]).filter((url: string) => url?.trim() !== "").map((url: string, idx: number) => (
                <div
                  key={idx}
                  className="aspect-video relative rounded-2xl overflow-hidden glass border border-border/50 group cursor-pointer shadow-xl shadow-black/5 hover:shadow-primary/10 transition-all border-white/20 active:scale-[0.98]"
                  onClick={() => window.open(url, '_blank')}
                >
                  <img
                    src={url}
                    alt={`Ticket photo ${idx + 1}`}
                    className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/600x400/f1f5f9/94a3b8?text=Broken+Link"
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-[8px] font-black text-white uppercase tracking-[0.2em]">View Image</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Assigned Team (Supervisor) */}
        {
          request.supervisor && (
            <section className="glass-card p-6 rounded-3xl">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Assigned Team
              </h2>
              <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-2xl border border-border/50">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {request.supervisor.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{request.supervisor}</p>
                  <p className="text-xs text-muted-foreground">Site Supervisor</p>
                </div>
                {request.supervisorPhone && (
                  <a href={`tel:${request.supervisorPhone}`} className="p-2.5 bg-green-500/10 text-green-600 rounded-xl hover:bg-green-500/20 transition-colors">
                    <Phone className="w-5 h-5" />
                  </a>
                )}
              </div>
            </section>
          )
        }

        {/* Ratings (Client Feedback) */}
        {
          request.status === "Completed" && !request.isRated && request.technicianId && (
            <section className="relative overflow-hidden p-[2px] rounded-3xl group animate-in slide-in-from-bottom-4 duration-700">
              {/* Grading Border Animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 opacity-50 animate-gradient-xy" />

              <div className="relative bg-background/90 backdrop-blur-xl rounded-[22px] p-6 lg:p-8">
                {/* Action Badge */}
                <div className="absolute top-4 right-4 animate-pulse">
                  <span className="bg-yellow-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-yellow-500/30">
                    Action Required
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center text-center mb-8 mt-2">
                  <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-500 mb-4 shadow-inner ring-4 ring-yellow-500/10">
                    <Star className="w-8 h-8 fill-current" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight">Verification & Feedback</h2>
                  <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                    Please rate <span className="text-foreground font-bold">{request.technicianName}</span>'s work to finalize this ticket.
                  </p>
                </div>

                <div className="flex justify-center gap-3 mb-8">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      onClick={() => setRating(star)}
                      className="group/star relative focus:outline-none transition-transform active:scale-95"
                    >
                      <Star
                        className={`w-12 h-12 transition-all duration-300 ${star <= (hover || rating)
                          ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)] scale-110'
                          : 'text-muted-foreground/20 hover:text-yellow-400/50'
                          }`}
                        strokeWidth={1.5}
                      />
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-yellow-500 opacity-0 group-hover/star:opacity-100 transition-opacity uppercase tracking-widest whitespace-nowrap">
                        {star === 1 ? "Poor" : star === 5 ? "Excellent" : ""}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <textarea
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder="Share your experience (optional)..."
                      className="w-full p-4 pl-5 rounded-2xl bg-muted/40 border-2 border-transparent focus:border-yellow-500/20 focus:bg-background outline-none text-sm min-h-[120px] transition-all resize-none placeholder:text-muted-foreground/50 shadow-inner"
                    />
                    <MessageSquare className="absolute top-4 right-4 w-4 h-4 text-muted-foreground/30" />
                  </div>

                  <button
                    onClick={handleRate}
                    disabled={rating === 0 || submitting}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Star className="w-5 h-5 fill-current" />}
                    <span className="uppercase tracking-widest text-xs">{submitting ? "Submitting..." : "Submit Review"}</span>
                  </button>
                </div>
              </div>
            </section>
          )
        }

        {
          request.isRated && (
            <section className="glass-card p-6 rounded-3xl bg-green-500/5 border-green-500/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-green-600 dark:text-green-400">Feedback Submitted</p>
              </div>
            </section>
          )
        }
      </div >

      <BottomNav active="requests" role="company" />
    </div >
  )
}
