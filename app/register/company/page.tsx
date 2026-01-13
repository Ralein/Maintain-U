"use client"

import { Suspense } from "react"
import CompanyRegisterContent from "./content"

export default function CompanyRegisterPage() {
  return (
    <Suspense fallback={null}>
      <CompanyRegisterContent />
    </Suspense>
  )
}
