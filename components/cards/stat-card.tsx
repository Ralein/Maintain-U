interface StatCardProps {
  label: string
  value: string
  color: string
}

export function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div
      className={`backdrop-blur-md bg-gradient-to-br ${color}/20 border border-white/20 rounded-2xl p-5 shadow-2xl shadow-black/20 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300`}
    >
      <div className="text-3xl font-bold text-blue-300 mb-1">{value}</div>
      <div className="text-xs text-slate-400 uppercase tracking-wider">{label}</div>
    </div>
  )
}
