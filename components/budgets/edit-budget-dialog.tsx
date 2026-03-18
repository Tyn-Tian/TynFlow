"use client"

import { useEffect, useState } from "react"
import { z } from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { IconPencil } from "@tabler/icons-react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"

const formSchema = z
    .object({
        name: z.string().min(3, "Name is required"),
        total: z.number().int().min(0, "Total must be at least 0"),
        leftover: z.number().int().min(0, "Leftover must be at least 0"),
    })
    .refine((data) => data.leftover <= data.total, {
        message: "Leftover cannot be greater than total",
        path: ["leftover"],
    })

type FormValues = z.infer<typeof formSchema>

type BudgetItem = {
    id?: string | null
    name: string
    total: number
    leftover?: number
}

export function EditBudgetDialog({
    budget,
    onSuccess,
}: {
    budget: BudgetItem
    onSuccess?: () => void
}) {
    const supabase = createClient()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
    }, [])

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: budget.name,
            total: budget.total,
            leftover: budget.leftover ?? budget.total,
        },
    })

    useEffect(() => {
        if (open) {
            form.reset({
                name: budget.name,
                total: budget.total,
                leftover: budget.leftover ?? budget.total,
            })
        }
    }, [open, budget, form])

    async function onSubmit(values: FormValues) {
        if (!budget.id) return

        setSaving(true)
        try {
            const newLeftover = Math.min(values.leftover, values.total)

            const { error } = await supabase
                .from("budgets")
                .update({
                    name: values.name,
                    total: values.total,
                    leftover: newLeftover,
                })
                .eq("id", budget.id)

            if (error) {
                toast.error("Failed", {
                    description: error.message,
                    duration: 3000,
                })
                return
            }

            toast.success("Success", {
                description: "Budget has been updated.",
                duration: 3000,
            })
            setOpen(false)
            onSuccess?.()
            router.refresh()
            if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("budgets:changed"))
        } catch (err: Error | unknown) {
            toast.error("Failed", {
                description: err instanceof Error ? err.message : "Unexpected error.",
                duration: 3000,
            })
        } finally {
            setSaving(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <Button
                variant="outline"
                className="cursor-pointer"
                onClick={(event) => {
                    event.stopPropagation()
                    if (budget.id) setOpen(true)
                }}
                disabled={!budget.id}
            >
                <IconPencil />
                Edit
            </Button>
            <AlertDialogContent onClick={(event) => event.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>Edit Budget</AlertDialogTitle>
                    <AlertDialogDescription>Update your budget details.</AlertDialogDescription>
                </AlertDialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup className="gap-4">
                        <Controller
                            name="name"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={`budget-name-${budget.id ?? "temp"}`}>
                                        Name
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id={`budget-name-${budget.id ?? "temp"}`}
                                        placeholder="Example: Food & Drink"
                                        aria-invalid={fieldState.invalid}
                                        autoComplete="off"
                                        autoCorrect="off"
                                        autoCapitalize="none"
                                    />
                                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Controller
                            name="total"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={`budget-total-${budget.id ?? "temp"}`}>
                                        Total
                                    </FieldLabel>
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
                                        id={`budget-total-${budget.id ?? "temp"}`}
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="0"
                                        aria-invalid={fieldState.invalid}
                                        required
                                        autoComplete="off"
                                        autoCorrect="off"
                                        autoCapitalize="none"
                                        onChange={(event) => field.onChange(Number(event.target.value.replace(/\D/g, "")))}
                                    />
                                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Controller
                            name="leftover"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={`budget-leftover-${budget.id ?? "temp"}`}>
                                        Leftover
                                    </FieldLabel>
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
                                        id={`budget-leftover-${budget.id ?? "temp"}`}
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="0"
                                        aria-invalid={fieldState.invalid}
                                        required
                                        autoComplete="off"
                                        autoCorrect="off"
                                        autoCapitalize="none"
                                        onChange={(event) => field.onChange(Number(event.target.value.replace(/\D/g, "")))}
                                    />
                                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <AlertDialogFooter>
                            <AlertDialogCancel type="button" className="cursor-pointer">Cancel</AlertDialogCancel>
                            <Button type="submit" disabled={saving} className="cursor-pointer">
                                {saving ? "Saving..." : "Save"}
                            </Button>
                        </AlertDialogFooter>
                    </FieldGroup>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}
