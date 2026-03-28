"use client"

import React, { useEffect, useState } from "react"
import { z } from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { IconCalendar, IconPlus } from "@tabler/icons-react"

import { createClient } from "@/lib/supabase/client"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
    date: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Date must be in dd/mm/yyyy"),
    type: z.enum(["Lembur", "Biasa"]),
    sales: z.number().int().min(0, "Sales must be at least 0"),
})

type FormValues = z.infer<typeof formSchema>

export function AddLiveDialog() {
    const supabase = createClient()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [showDatePicker, setShowDatePicker] = useState(false)
    const datePickerRef = React.useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        function onClick(event: MouseEvent) {
            if (!datePickerRef.current) return
            const target = event.target as Node
            if (showDatePicker && !datePickerRef.current.contains(target)) {
                setShowDatePicker(false)
            }
        }

        function onKey(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setShowDatePicker(false)
            }
        }

        document.addEventListener("mousedown", onClick)
        document.addEventListener("keydown", onKey)

        return () => {
            document.removeEventListener("mousedown", onClick)
            document.removeEventListener("keydown", onKey)
        }
    }, [showDatePicker])

    const pad = (value: number) => String(value).padStart(2, "0")
    const today = new Date()
    const defaultDate = `${pad(today.getDate())}/${pad(today.getMonth() + 1)}/${today.getFullYear()}`

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: defaultDate,
            type: "Biasa",
            sales: 0,
        },
    })

    useEffect(() => {
        if (!open) {
            form.reset({
                date: defaultDate,
                type: "Biasa",
                sales: 0,
            })
            setShowDatePicker(false)
        }
    }, [defaultDate, form, open])

    function toIsoDate(date: string) {
        const [dd, mm, yyyy] = date.split("/")
        const day = Number(dd)
        const month = Number(mm)
        const year = Number(yyyy)
        const parsed = new Date(year, month - 1, day)

        if (
            parsed.getFullYear() !== year ||
            parsed.getMonth() !== month - 1 ||
            parsed.getDate() !== day
        ) {
            throw new Error("Invalid date")
        }

        return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    }

    async function onSubmit(values: FormValues) {
        setLoading(true)
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                toast.error("Failed", {
                    description: "Please login to add live data.",
                    duration: 3000,
                })
                return
            }

            const { error } = await supabase.from("lives").insert({
                date: toIsoDate(values.date),
                type: values.type,
                sales: values.sales,
                user_id: user.id,
            })

            if (error) {
                toast.error("Failed", {
                    description: error.message,
                    duration: 3000,
                })
                return
            }

            toast.success("Success", {
                description: "Live has been added.",
                duration: 3000,
            })
            setOpen(false)
            form.reset({
                date: defaultDate,
                type: "Biasa",
                sales: 0,
            })
            router.refresh()
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("lives:changed"))
            }
        } catch (error) {
            toast.error("Failed", {
                description: error instanceof Error ? error.message : "Unexpected error.",
                duration: 3000,
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button className="cursor-pointer">
                    <IconPlus />
                    Add Live
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader className="gap-0">
                    <AlertDialogTitle>Add Live</AlertDialogTitle>
                </AlertDialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup className="gap-4">
                        <Controller
                            name="date"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="live-date">Date</FieldLabel>
                                    <div className="relative" ref={datePickerRef}>
                                        <Input
                                            {...field}
                                            id="live-date"
                                            placeholder="dd/mm/yyyy"
                                            aria-invalid={fieldState.invalid}
                                            autoComplete="off"
                                            onClick={() => setShowDatePicker((value) => !value)}
                                            readOnly
                                            className="pr-10 cursor-pointer"
                                        />
                                        <button
                                            type="button"
                                            title="Open calendar"
                                            aria-label="Open calendar"
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground cursor-pointer"
                                            onClick={() => setShowDatePicker((value) => !value)}
                                        >
                                            <IconCalendar className="size-4" />
                                        </button>
                                        {showDatePicker && (
                                            <div className="absolute z-50 mt-2 rounded-xl border bg-background p-3 shadow-lg">
                                                <Calendar
                                                    mode="single"
                                                    selected={(() => {
                                                        const [dd, mm, yyyy] = field.value.split("/")
                                                        const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
                                                        return Number.isNaN(date.getTime()) ? new Date() : date
                                                    })()}
                                                    onSelect={(date) => {
                                                        if (!date) return
                                                        field.onChange(
                                                            `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
                                                        )
                                                        setShowDatePicker(false)
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Controller
                            name="type"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Type</FieldLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger aria-invalid={fieldState.invalid}>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Biasa">Biasa</SelectItem>
                                            <SelectItem value="Lembur">Lembur</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Controller
                            name="sales"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="live-sales">Sales</FieldLabel>
                                    <Input
                                        value={
                                            mounted
                                                ? field.value !== undefined && field.value !== null
                                                    ? field.value.toLocaleString("id-ID")
                                                    : ""
                                                : field.value !== undefined && field.value !== null
                                                    ? String(field.value)
                                                    : ""
                                        }
                                        id="live-sales"
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="0"
                                        aria-invalid={fieldState.invalid}
                                        autoComplete="off"
                                        onChange={(event) => field.onChange(Number(event.target.value.replace(/\D/g, "")))}
                                    />
                                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <AlertDialogFooter>
                            <AlertDialogCancel type="button" className="cursor-pointer">
                                Cancel
                            </AlertDialogCancel>
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