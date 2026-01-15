
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
            <div className="text-center space-y-6 max-w-md">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto text-red-600 dark:text-red-500">
                    <AlertTriangle className="w-10 h-10" />
                </div>
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground">
                    You do not have permission to view this page. This area is restricted to authorized administrators.
                </p>
                <div className="pt-4">
                    <Link href="/login" className="px-6 py-2.5 rounded-lg bg-secondary hover:bg-secondary/80 font-medium transition-colors">
                        Return to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
