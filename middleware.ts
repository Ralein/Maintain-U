import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Admin Route Protection
    if (pathname.startsWith("/admin")) {
        const adminSession = request.cookies.get("admin_session");

        if (pathname === "/admin") {
            if (adminSession) {
                return NextResponse.redirect(new URL("/admin/dashboard", request.url));
            } else {
                return NextResponse.redirect(new URL("/admin-login", request.url));
            }
        }

        if (!adminSession) {
            return NextResponse.redirect(new URL("/admin-login", request.url));
        }
    }

    // User Session & Pending Check
    const sessionToken = request.cookies.get("session_token");
    const isPendingScreen = pathname === "/onboarding/pending";

    if (sessionToken) {
        try {
            const session = JSON.parse(sessionToken.value);
            // Check status.
            const isPending = session.status === "pending";

            if (isPending) {
                if (!isPendingScreen) {
                    return NextResponse.redirect(new URL("/onboarding/pending", request.url));
                }
            } else {
                // Active or Banned? Middleware just handles pending wall.
                // If Active and on pending screen, redirect to dashboard.
                if (isPendingScreen) {
                    const dashboardPath = session.role === "technician" ? "/" : "/company/dashboard";
                    return NextResponse.redirect(new URL(dashboardPath, request.url));
                }
            }
        } catch (e) {
            // Invalid cookie
        }
    } else {
        if (pathname.startsWith("/company") || pathname.startsWith("/technician")) {
            return NextResponse.redirect(new URL("/signup", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/admin", "/company/:path*", "/technician/:path*", "/onboarding/pending"],
};
