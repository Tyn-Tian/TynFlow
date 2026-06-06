import { LoginForm } from "@/components/auth/login-form"
import { LoginSkeleton } from "@/components/auth/skeleton/login-skeleton"
import Image from "next/image"
import { Suspense } from "react"

export default function LoginPage() {
    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <a href="#" className="flex items-center gap-2 self-center font-medium">
                    <div className="flex size-6 items-center justify-center rounded-md bg-emerald-500/10">
                        <Image src="/icon-192x192.png" alt="TynFlow" width={24} height={24} />
                    </div>
                    TynFlow
                </a>
                <Suspense fallback={<LoginSkeleton />}>
                    <LoginForm />
                </Suspense>
            </div>
        </div>
    )
}
