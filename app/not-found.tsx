import React from "react"
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@/components/ui/empty"

function EmptyInputGroup() {
    return (
        <Empty>
            <EmptyHeader>
                <EmptyTitle>404 - Not Found</EmptyTitle>
                <EmptyDescription>
                    The page you&apos;re looking for doesn&apos;t exist. Try searching for
                    what you need below.
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    )
}

export default function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <EmptyInputGroup />
        </div>
    )
}
