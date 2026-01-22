"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import { Users, MapPin } from "lucide-react"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix Leaflet Default Icon
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

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

interface LocationMapProps {
    techs: TechLocation[]
    mapStyleUrl: string
}

export default function LocationMap({ techs, mapStyleUrl }: LocationMapProps) {
    // Logic to Group Techs
    const groupedLocations = techs.reduce((acc, tech) => {
        const key = `${tech.lat},${tech.lng}`
        if (!acc[key]) acc[key] = []
        acc[key].push(tech)
        return acc
    }, {} as Record<string, TechLocation[]>)

    return (
        <div className="w-full h-full min-h-[500px] relative z-0">
            <MapContainer
                center={[12.9716, 77.5946] as any}
                zoom={12}
                style={{ height: '100%', width: '100%', minHeight: '500px' }}
                className="z-0"
            >
                <TileLayer
                    url={mapStyleUrl}
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
        </div>
    )
}
