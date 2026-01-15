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
    const isRegisterScreen = pathname.startsWith("/register");
    const isSetupPasswordScreen = pathname === "/setup-password";

    if (sessionToken) {
        try {
            const session = JSON.parse(sessionToken.value);
            // Check status.
            const isPending = session.status === "pending";

            if (isPending) {
                // Allow pending users to access login page (for waiting state) or onboarding/pending
                // Redirect away from protected routes
                if (pathname.startsWith("/company") || pathname.startsWith("/technician") || isSetupPasswordScreen) {
                    return NextResponse.redirect(new URL("/login", request.url));
                }
            } else {
                // Active user - redirect away from pending screen
                if (isPendingScreen) {
                    const dashboardPath = session.role === "technician" ? "/technician/dashboard" : "/company/dashboard";
                    return NextResponse.redirect(new URL(dashboardPath, request.url));
                }
            }
        } catch (e) {
            // Invalid cookie
        }
    } else {
        // No session - redirect to login for protected routes
        if (pathname.startsWith("/company") || pathname.startsWith("/technician") || isRegisterScreen || isSetupPasswordScreen) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/admin", "/company/:path*", "/technician/:path*", "/onboarding/pending", "/register/:path*", "/setup-password"],
};

