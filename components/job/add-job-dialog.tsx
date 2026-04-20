"use client"

import React, { useEffect, useState } from "react"
import { z } from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { IconPlus, IconCalendar } from "@tabler/icons-react"

import { addJobAction } from "@/actions/job-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const SOURCES = [
    "Kalibr",
    "Dealls",
    "Jobstreet",
    "LinkedIn",
    "Glints",
    "Company Website",
    "Social Media",
]

const STATUSES = [
    "Screening",
    "Fill in Information",
    "Pychotest",
    "Technical Test",
    "HR Interview",
    "User Interview",
    "Offering",
    "Rejected",
    "Accepted",
    "Other",
]

const formSchema = z.object({
    position: z.string().min(1, "Position is required"),
    company: z.string().min(1, "Company is required"),
    source: z.string().min(1, "Source is required"),
    status: z.string().min(1, "Status is required"),
    applied_at: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Date must be in dd/mm/yyyy"),
    updated_at: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Date must be in dd/mm/yyyy"),
})

type FormValues = z.infer<typeof formSchema>

export function AddJobDialog() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showAppliedDatePicker, setShowAppliedDatePicker] = useState(false)
    const [showUpdatedDatePicker, setShowUpdatedDatePicker] = useState(false)
    const appliedDatePickerRef = React.useRef<HTMLDivElement | null>(null)
    const updatedDatePickerRef = React.useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        function onClick(e: MouseEvent) {
            const target = e.target as Node
            if (showAppliedDatePicker && appliedDatePickerRef.current && !appliedDatePickerRef.current.contains(target)) {
                setShowAppliedDatePicker(false)
            }
            if (showUpdatedDatePicker && updatedDatePickerRef.current && !updatedDatePickerRef.current.contains(target)) {
                setShowUpdatedDatePicker(false)
            }
        }
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") {
                setShowAppliedDatePicker(false)
                setShowUpdatedDatePicker(false)
            }
        }
        document.addEventListener("mousedown", onClick)
        document.addEventListener("keydown", onKey)
        return () => {
            document.removeEventListener("mousedown", onClick)
            document.removeEventListener("keydown", onKey)
        }
    }, [showAppliedDatePicker, showUpdatedDatePicker])

    const pad = (n: number) => String(n).padStart(2, "0")
    const today = new Date()
    const defaultDate = `${pad(today.getDate())}/${pad(today.getMonth() + 1)}/${today.getFullYear()}`

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            position: "",
            company: "",
            source: "",
            status: "Screening",
            applied_at: defaultDate,
            updated_at: defaultDate,
        },
    })

    useEffect(() => {
        if (!open) {
            form.reset()
            setShowAppliedDatePicker(false)
            setShowUpdatedDatePicker(false)
        }
    }, [open, form])

    async function onSubmit(values: FormValues) {
        setLoading(true)
        try {
            const toIsoDate = (d: string) => {
                const [dd, mm, yyyy] = d.split("/")
                const day = Number(dd)
                const month = Number(mm)
                const year = Number(yyyy)
                return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            }

            await addJobAction({
                position: values.position,
                company: values.company,
                source: values.source,
                status: values.status,
                applied_at: toIsoDate(values.applied_at),
                updated_at: toIsoDate(values.updated_at),
            })

            toast.success("Success", { description: "Job added successfully." })
            setOpen(false)
            router.refresh()
        } catch (err) {
            toast.error("Failed", { description: err instanceof Error ? err.message : "Unexpected error." })
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (v: string) => {
        const digits = v.replace(/\D/g, "").slice(0, 8)
        const parts = []
        if (digits.length >= 2) {
            parts.push(digits.slice(0, 2))
            if (digits.length >= 4) {
                parts.push(digits.slice(2, 4))
                if (digits.length > 4) parts.push(digits.slice(4))
            } else if (digits.length > 2) {
                parts.push(digits.slice(2))
            }
        } else {
            parts.push(digits)
        }
        return parts.join("/")
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="cursor-pointer">
                    <IconPlus />
                    <span className="hidden lg:inline">Add Job</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-[500px]">
                <AlertDialogHeader>
                    <AlertDialogTitle>Add Job</AlertDialogTitle>
                </AlertDialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup className="gap-4">
                        <Controller
                            name="position"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="job-position">Position</FieldLabel>
                                    <Input {...field} id="job-position" placeholder="Example: Frontend Developer" autoComplete="off" />
                                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Controller
                            name="company"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="job-company">Company</FieldLabel>
                                    <Input {...field} id="job-company" placeholder="Example: Google" autoComplete="off" />
                                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Controller
                                name="source"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="job-source">Source</FieldLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger id="job-source">
                                                <SelectValue placeholder="Select source" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {SOURCES.map((source) => (
                                                    <SelectItem key={source} value={source}>
                                                        {source}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="status"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="job-status">Status</FieldLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger id="job-status">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {STATUSES.map((status) => (
                                                    <SelectItem key={status} value={status}>
                                                        {status}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </div>

                        <Controller
                            name="applied_at"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="job-applied-at">Applied At</FieldLabel>
                                    <div className="relative" ref={appliedDatePickerRef}>
                                        <div className="flex items-center">
                                            <Input
                                                id="job-applied-at"
                                                value={field.value}
                                                placeholder="dd/mm/yyyy"
                                                onChange={(e) => field.onChange(formatDate(e.target.value))}
                                                autoComplete="off"
                                                className="flex-1"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowAppliedDatePicker(!showAppliedDatePicker)}
                                                className="w-9 h-10 flex items-center justify-center ml-2 cursor-pointer"
                                            >
                                                <IconCalendar />
                                            </button>
                                        </div>
                                        {showAppliedDatePicker && (
                                            <div className="absolute z-50 mt-2">
                                                <Calendar
                                                    mode="single"
                                                    selected={(() => {
                                                        const [dd, mm, yyyy] = field.value.split("/")
                                                        const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
                                                        return isNaN(d.getTime()) ? undefined : d
                                                    })()}
                                                    onSelect={(d) => {
                                                        if (!d) return
                                                        const dd = pad(d.getDate())
                                                        const mm = pad(d.getMonth() + 1)
                                                        const yyyy = d.getFullYear()
                                                        field.onChange(`${dd}/${mm}/${yyyy}`)
                                                        setShowAppliedDatePicker(false)
                                                    }}
                                                    className="rounded-lg border bg-background"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Controller
                            name="updated_at"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="job-updated-at">Updated At</FieldLabel>
                                    <div className="relative" ref={updatedDatePickerRef}>
                                        <div className="flex items-center">
                                            <Input
                                                id="job-updated-at"
                                                value={field.value}
                                                placeholder="dd/mm/yyyy"
                                                onChange={(e) => field.onChange(formatDate(e.target.value))}
                                                autoComplete="off"
                                                className="flex-1"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowUpdatedDatePicker(!showUpdatedDatePicker)}
                                                className="w-9 h-10 flex items-center justify-center ml-2 cursor-pointer"
                                            >
                                                <IconCalendar />
                                            </button>
                                        </div>
                                        {showUpdatedDatePicker && (
                                            <div className="absolute z-50 mt-2">
                                                <Calendar
                                                    mode="single"
                                                    selected={(() => {
                                                        const [dd, mm, yyyy] = field.value.split("/")
                                                        const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
                                                        return isNaN(d.getTime()) ? undefined : d
                                                    })()}
                                                    onSelect={(d) => {
                                                        if (!d) return
                                                        const dd = pad(d.getDate())
                                                        const mm = pad(d.getMonth() + 1)
                                                        const yyyy = d.getFullYear()
                                                        field.onChange(`${dd}/${mm}/${yyyy}`)
                                                        setShowUpdatedDatePicker(false)
                                                    }}
                                                    className="rounded-lg border bg-background"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <AlertDialogFooter className="mt-4">
                            <AlertDialogCancel type="button" className="cursor-pointer">Cancel</AlertDialogCancel>
                            <Button type="submit" disabled={loading} className="cursor-pointer">
                                {loading ? "Saving..." : "Save"}
                            </Button>
                        </AlertDialogFooter>
                    </FieldGroup>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}
