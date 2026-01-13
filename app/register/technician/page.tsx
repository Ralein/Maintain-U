"use client"

import { Suspense } from "react"
import TechnicianRegisterContent from "./content"

export default function TechnicianRegisterPage() {
  return (
    <Suspense fallback={null}>
      <TechnicianRegisterContent />
    </Suspense>
  )
}
