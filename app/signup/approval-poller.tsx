"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

export function ApprovalPoller({ phone, role }: { phone: string, role: string }) {
    const router = useRouter()

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                // We rely on the cookie set by sendOTP
                const res = await api.refreshSession()

                // If user is now ACTIVE (Admin approved)
                // OR if user is PENDING but we want to let them fill form? 
                // Wait, request said: "wait admin to verify. On admin allow user to enter in"
                // So status must be ACTIVE or something indicating approval?
                // Actually, if we use the SAME 'pending' status for "Registered but waiting" vs "New phone waiting",
                // we need to distinguish.
                // IF we use 'active' => they can proceed to Register Form.
                // BUT Register Form usually creates the pending user? 
                // Ah, the flow is:
                // 1. Phone -> Pending (Waiting).
                // 2. Admin Approves -> Active.
                // 3. Auto-Redirect -> Registration Form.
                // 4. Submit Registration -> ?? Status stays Active? Or goes back to Pending?
                // Re-reading request: "after entering ph ... show a pending screen wait admin to verify. On admin allow user to enter in (automate OTP fill)"

                if (res.success && res.status === 'active') { // Admin approved
                    if (role === "company") {
                        router.push(`/register/company?phone=${phone}`)
                    } else {
                        router.push(`/register/technician?phone=${phone}`)
                    }
                }
            } catch (e) {
                // ignore
            }
        }, 3000)
        return () => clearInterval(interval)
    }, [router, phone, role])

    return null
}
