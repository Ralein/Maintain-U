interface RequestCardProps {
  id: string
  company: string
  type: string
  date: string
  status: string
  icon: string
}

export function RequestCard({ id, company, type, date, status, icon }: RequestCardProps) {
  const statusColors: Record<string, string> = {
    "In Progress": "bg-blue-500/30 text-blue-300 border-blue-400/50",
    Completed: "bg-green-500/30 text-green-300 border-green-400/50",
    Pending: "bg-yellow-500/30 text-yellow-300 border-yellow-400/50",
  }

  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-5 shadow-2xl shadow-black/20 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-2xl">{icon}</span>
          <div>
            <p className="font-semibold text-white group-hover:text-blue-300 transition-colors">{company}</p>
            <p className="text-xs text-slate-400">{id}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-semibold border ${statusColors[status]}`}>{status}</span>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{type}</span>
        <span>{date}</span>
      </div>
    </div>
  )
}
