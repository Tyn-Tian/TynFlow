"use client"

import React, { useState } from "react"
import { IconUserCircle } from "@tabler/icons-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { AlertDialogDescription } from "@/components/ui/alert-dialog"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function EditProfileDialog({ user }: { user: { name: string; email: string } }) {
    const supabase = createClient()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState(user.name ?? "")

    const handleSave = async () => {
        setLoading(true)
        try {
            const { data: userData, error: getUserError } = await supabase.auth.getUser()
            if (getUserError) throw getUserError

            const userId = userData?.user?.id
            if (!userId) throw new Error("Not authenticated")
            // Update existing profile (assume profile exists)
            const { error: updateError } = await supabase
                .from("profiles")
                .update({ name })
                .eq("user_id", userId)

            if (updateError) throw updateError
            toast.success("Success", { description: "Profile has been updated.", duration: 3000 })
            setOpen(false)
            router.refresh()
        } catch (err) {
            function getErrorMessage(e: unknown): string {
                if (e instanceof Error) return e.message
                if (typeof e === "object" && e !== null && "message" in e && typeof (e as Record<string, unknown>).message === "string") {
                    return (e as Record<string, unknown>).message as string
                }
                return String(e)
            }
            toast.error("Failed", { description: getErrorMessage(err), duration: 3000 })
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <DropdownMenuItem
                onPointerDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setOpen(true)
                }}
                className="cursor-pointer"
            >
                <IconUserCircle />
                Account
            </DropdownMenuItem>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader className="gap-0">
                        <AlertDialogTitle>Edit Profile</AlertDialogTitle>
                        <AlertDialogDescription>
                            Update your display name. Email is read-only.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <form>
                        <FieldGroup className="gap-4">
                            <Field>
                                <FieldLabel>Name</FieldLabel>
                                <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
                            </Field>

                            <Field>
                                <FieldLabel>Email</FieldLabel>
                                <Input value={user.email ?? ""} disabled readOnly />
                            </Field>

                            <AlertDialogFooter>
                                <AlertDialogCancel type="button" className="cursor-pointer">Cancel</AlertDialogCancel>
                                <Button onClick={handleSave} disabled={loading} className="cursor-pointer">
                                    {loading ? "Saving..." : "Save"}
                                </Button>
                            </AlertDialogFooter>
                        </FieldGroup>
                    </form>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
