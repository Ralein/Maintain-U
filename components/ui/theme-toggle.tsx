"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { BiMoon, BiSun } from "react-icons/bi"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className="w-10 h-10" /> // Placeholder to prevent layout shift
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-10 h-10 rounded-xl bg-background/50 backdrop-blur-md border border-border/50 flex items-center justify-center text-foreground transition-all hover:bg-muted active:scale-95 shadow-sm"
            aria-label="Toggle theme"
        >
            {theme === "dark" ? (
                <BiMoon className="w-5 h-5 transition-all text-blue-400" />
            ) : (
                <BiSun className="w-5 h-5 transition-all text-amber-500" />
            )}
        </button>
    )
}
