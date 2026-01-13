"use client"

import { useRouter } from "next/navigation"
import { MapPin, User, Phone } from "lucide-react"

export default function JobDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()

  return (
    <div className="min-h-screen px-6 pt-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">{params.id}</h1>
        <div className="w-6" />
      </div>

      {/* Company Info */}
      <div className="p-4 rounded-lg bg-card border border-border mb-6">
        <p className="text-xs text-muted-foreground mb-1">Company</p>
        <p className="text-xl font-bold mb-4">ABC Industries</p>
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
          <div>
            <p className="text-sm">Industrial Area, Block A</p>
            <p className="text-xs text-muted-foreground">10.2 km away</p>
          </div>
        </div>
        <button className="w-full py-2 px-3 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium">
          Open in Maps
        </button>
      </div>

      {/* Service Details */}
      <div className="p-4 rounded-lg bg-card border border-border mb-6">
        <div className="mb-4 pb-4 border-b border-border">
          <p className="text-xs text-muted-foreground mb-1">Service</p>
          <p className="text-lg font-bold">Electrical Maintenance</p>
        </div>
        <div className="mb-4 pb-4 border-b border-border">
          <p className="text-xs text-muted-foreground mb-1">Duration (Estimated)</p>
          <p className="font-semibold">4 hours</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Description</p>
          <p className="text-sm">Main switchboard inspection and circuit breaker replacement</p>
        </div>
      </div>

      {/* Supervisor */}
      <div className="p-4 rounded-lg bg-card border border-border mb-6">
        <p className="text-xs text-muted-foreground mb-3">Supervisor</p>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-semibold">John Smith</p>
            <p className="text-xs text-muted-foreground">Project Manager</p>
          </div>
        </div>
        <button className="w-full py-2 px-3 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium flex items-center justify-center gap-2">
          <Phone className="w-4 h-4" strokeWidth={1.5} />
          Call Supervisor
        </button>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button className="w-full py-3 px-6 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors">
          Accept Job
        </button>
        <button className="w-full py-3 px-6 rounded-lg border border-border hover:bg-muted transition-colors font-semibold">
          Decline Job
        </button>
      </div>
    </div>
  )
}
