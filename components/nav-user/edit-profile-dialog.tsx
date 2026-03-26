"use client"

import React, { useState } from "react"
import { z } from "zod"
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
    const [startDate, setStartDate] = useState<string>("")
    const [endDate, setEndDate] = useState<string>("")

    const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/
    const dateSchema = z
        .object({ start_date: z.string().optional(), end_date: z.string().optional() })
        .superRefine((val, ctx) => {
            const sd = val.start_date
            const ed = val.end_date
            if (sd && !datePattern.test(sd)) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["start_date"], message: "Invalid date format (DD/MM/YYYY)" })
            }
            if (ed && !datePattern.test(ed)) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["end_date"], message: "Invalid date format (DD/MM/YYYY)" })
            }
            if (sd && ed && datePattern.test(sd) && datePattern.test(ed)) {
                const [sdD, sdM, sdY] = sd.split("/").map(Number)
                const [edD, edM, edY] = ed.split("/").map(Number)
                const s = new Date(sdY, sdM - 1, sdD)
                const e = new Date(edY, edM - 1, edD)
                if (s > e) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["start_date"], message: "Start date must be before or equal to end date" })
                    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["end_date"], message: "End date must be after or equal to start date" })
                }
            }
        })

    const fmtDDMMYYYY = (d: Date) => {
        const pad = (n: number) => String(n).padStart(2, "0")
        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            const { data: userData, error: getUserError } = await supabase.auth.getUser()
            if (getUserError) throw getUserError

            const userId = userData?.user?.id
            if (!userId) throw new Error("Not authenticated")

            const parsed = dateSchema.safeParse({ start_date: startDate || undefined, end_date: endDate || undefined })
            if (!parsed.success) {
                toast.error("Please fix validation errors before saving")
                setLoading(false)
                return
            }

            const toIso = (s?: string) => {
                if (!s) return null
                const [d, m, y] = s.split("/").map(Number)
                const dt = new Date(Date.UTC(y, m - 1, d))
                return isNaN(dt.getTime()) ? null : dt.toISOString()
            }

            const { error: updateError } = await supabase
                .from("profiles")
                .update({ name, start_date: toIso(startDate || undefined), end_date: toIso(endDate || undefined) })
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

    React.useEffect(() => {
        let mounted = true
        if (!open) return
            ; (async () => {
                try {
                    const { data: userData } = await supabase.auth.getUser()
                    const userId = userData?.user?.id
                    if (!userId) return
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("name, start_date, end_date")
                        .eq("user_id", userId)
                        .single()

                    if (!mounted) return
                    if (profile) {
                        if (profile.name) setName(profile.name)
                        if (profile.start_date) {
                            const sd = new Date(profile.start_date)
                            setStartDate(isNaN(sd.getTime()) ? "" : fmtDDMMYYYY(sd))
                        } else {
                            setStartDate("")
                        }
                        if (profile.end_date) {
                            const ed = new Date(profile.end_date)
                            setEndDate(isNaN(ed.getTime()) ? "" : fmtDDMMYYYY(ed))
                        } else {
                            setEndDate("")
                        }
                    }
                } catch (e) {
                    console.error(e)
                }
            })()

        return () => {
            mounted = false
        }
    }, [open, supabase])

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

                            <div className="flex gap-4">
                                <Field>
                                    <FieldLabel>Start Date</FieldLabel>
                                    <Input
                                        type="text"
                                        placeholder="DD/MM/YYYY"
                                        inputMode="numeric"
                                        pattern="\d{2}/\d{2}/\d{4}"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel>End Date</FieldLabel>
                                    <Input
                                        type="text"
                                        placeholder="DD/MM/YYYY"
                                        inputMode="numeric"
                                        pattern="\d{2}/\d{2}/\d{4}"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </Field>
                            </div>

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
