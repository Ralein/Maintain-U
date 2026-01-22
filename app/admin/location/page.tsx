"use client"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { ArrowLeft, MapPin, Users, Loader2, Layers, Sun, Moon, Globe } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false, loading: () => <div className="h-full w-full bg-muted animate-pulse rounded-3xl" /> }
)
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
)
const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
)
const Popup = dynamic(
    () => import('react-leaflet').then((mod) => mod.Popup),
    { ssr: false }
)

// Fix Leaflet default icon issue
import L from 'leaflet'
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

// Custom Icon for Teams
const teamIcon = L.divIcon({
    className: 'custom-team-icon',
    html: `<div style="background-color: #3b82f6; color: white; border-radius: 9999px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">Team</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
})

interface TechLocation {
    id: string
    name: string
    lat: number
    lng: number
    status: "active"
    locationName: string
}

export default function AdminLocationPage() {
    const router = useRouter()
    const [activeTechs, setActiveTechs] = useState<TechLocation[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Simulate fetching data
        setTimeout(() => {
            setActiveTechs([
                { id: "T1", name: "Raj Kumar", lat: 12.9716, lng: 77.5946, status: "active", locationName: "MG Road, Bangalore" },
                { id: "T2", name: "Amit Singh", lat: 12.9716, lng: 77.5946, status: "active", locationName: "MG Road, Bangalore" }, // Same location (Team)
                { id: "T3", name: "Sara Khan", lat: 12.9352, lng: 77.6245, status: "active", locationName: "Koramangala, Bangalore" },
            ])
            setLoading(false)
        }, 1000)
    }, [])

    // Group technicians by location
    const groupedLocations = activeTechs.reduce((acc, tech) => {
        const key = `${tech.lat},${tech.lng}`
        if (!acc[key]) {
            acc[key] = []
        }
        acc[key].push(tech)
        return acc
    }, {} as Record<string, TechLocation[]>)

    return (
        <div className="min-h-screen bg-background pb-32 flex flex-col">
            {/* Header */}
            <div className="pt-8 px-6 pb-6 bg-background/80 backdrop-blur-md sticky top-0 z-20">
                <button
                    onClick={() => router.back()}
                    className="mb-4 p-2.5 -ml-2 hover:bg-muted/50 rounded-full transition-colors flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">Back to Dashboard</span>
                </button>

                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <MapPin className="w-6 h-6 text-primary" />
                        Technician Locations
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Live tracking of active workforce</p>
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 relative z-0">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <MapContainer
                        center={[12.9716, 77.5946] as any}
                        zoom={12}
                        style={{ height: '100%', width: '100%' }}
                        className="z-0"
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />

                        {Object.values(groupedLocations).map((group, idx) => {
                            const isTeam = group.length > 1
                            const position: [number, number] = [group[0].lat, group[0].lng]

                            return (
                                <Marker
                                    key={idx}
                                    position={position}
                                    icon={isTeam ? teamIcon : icon}
                                >
                                    <Popup className="rounded-xl overflow-hidden shadow-xl border-0">
                                        <div className="p-1 min-w-[200px]">
                                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                                                {isTeam ? <Users className="w-4 h-4 text-blue-500" /> : <MapPin className="w-4 h-4 text-primary" />}
                                                <span className="font-bold text-sm">
                                                    {isTeam ? "Team Location" : "Technician Location"}
                                                </span>
                                            </div>

                                            <p className="text-xs text-gray-500 mb-3 flex items-start gap-1">
                                                <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                                                {group[0].locationName}
                                            </p>

                                            <div className="space-y-2">
                                                {group.map(tech => (
                                                    <div key={tech.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                                            {tech.name.charAt(0)}
                                                        </div>
                                                        <span className="text-sm font-medium">{tech.name}</span>
                                                        <span className="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Active" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            )
                        })}
                    </MapContainer>
                )}
            </div>

            {/* Floating Legend / Info */}
            <div className="absolute bottom-36 left-6 right-6 p-4 glass-card rounded-2xl flex items-center justify-around text-xs font-medium z-10 shadow-lg">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    Team
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary"></span>
                    Single Tech
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                    Active Now
                </div>
            </div>

            <BottomNav active="home" role="admin" />
        </div>
    )
}
