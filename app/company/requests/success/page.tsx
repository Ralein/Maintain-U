"use client"

import { useRouter } from "next/navigation"

export default function RequestSuccessPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 mx-auto backdrop-blur-md bg-green-500/20 border border-green-400/50 flex items-center justify-center rounded-full mb-6">
          <span className="text-4xl">✓</span>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Request Submitted</h1>
        <p className="text-slate-400 mb-2">Your maintenance request has been created successfully</p>

        <div className="backdrop-blur-md bg-blue-500/10 border border-blue-400/50 rounded-2xl mb-8 py-4">
          <p className="text-xs text-slate-400 mb-1">Request ID</p>
          <p className="text-2xl font-bold text-blue-300">REQ-00125</p>
        </div>

        <p className="text-sm text-slate-400 mb-8">
          Your request is now in our system. Our team will review it and assign technicians shortly.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/company/requests/REQ-00125")}
            className="flex-1 backdrop-blur-sm bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-3 px-4 rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-blue-500/30"
          >
            Track Request
          </button>
          <button
            onClick={() => router.push("/company/dashboard")}
            className="flex-1 backdrop-blur-sm bg-white/5 border border-white/20 text-white font-semibold py-3 px-4 rounded-xl hover:bg-white/10 hover:border-white/30 transition-all"
          >
            Back Home
          </button>
        </div>
      </div>
    </div>
  )
}
