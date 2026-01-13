"use client"

import Link from "next/link"

type NavRole = "company" | "technician" | "admin"

interface BottomNavProps {
  active: string
  role: NavRole
}

const navItems = {
  company: [
    { id: "home", label: "Home", icon: "🏠", href: "/company/dashboard" },
    { id: "requests", label: "Requests", icon: "📋", href: "/company/requests" },
    { id: "alerts", label: "Alerts", icon: "🔔", href: "/company/notifications" },
    { id: "profile", label: "Profile", icon: "👤", href: "/company/profile" },
  ],
  technician: [
    { id: "home", label: "Home", icon: "🏠", href: "/technician/dashboard" },
    { id: "jobs", label: "Jobs", icon: "📋", href: "/technician/jobs" },
    { id: "attendance", label: "Attendance", icon: "📅", href: "/technician/attendance" },
    { id: "profile", label: "Profile", icon: "👤", href: "/technician/profile" },
  ],
  admin: [
    { id: "home", label: "Dashboard", icon: "🏠", href: "/admin/dashboard" },
    { id: "jobs", label: "Jobs", icon: "📋", href: "/admin/requests" },
    { id: "team", label: "Team", icon: "👥", href: "/admin/technicians" },
    { id: "salary", label: "Salary", icon: "💰", href: "/admin/salary" },
    { id: "more", label: "More", icon: "⚙️", href: "/admin/more" },
  ],
}

export function BottomNav({ active, role }: BottomNavProps) {
  const items = navItems[role]

  return (
    <nav className="tab-bar">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={`tab-item ${active === item.id ? "tab-item-active" : "tab-item-inactive"}`}
        >
          <span className="text-xl">{item.icon}</span>
          <span className="text-xs font-medium">{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
