
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Admin Route Protection
    if (pathname.startsWith("/admin")) {
        const adminSession = request.cookies.get("admin_session");

        // If accessing /admin/login specifically, allow it (but redirect if already logged in?)
        // Actually we are using a separate /admin-login page now as per request
        if (pathname === "/admin") {
            // Redirect root /admin to dashboard or login
            if (adminSession) {
                return NextResponse.redirect(new URL("/admin/dashboard", request.url));
            } else {
                return NextResponse.redirect(new URL("/admin-login", request.url));
            }
        }

        if (!adminSession) {
            // User is not authorized
            return NextResponse.redirect(new URL("/admin-login", request.url));
        }

        // Check main session token for "Role" validity if we want to be extra strict?
        // admin_session cookie is set strictly by adminLoginAction, so it implies success.
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/admin"],
};
