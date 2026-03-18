"use client"

import { useEffect, useState } from "react"
import { z } from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
        target: z.number().int().min(0, "Target must be at least 0"),
        saved: z.number().int().min(0, "Saved must be at least 0"),
    })
    .refine((data) => data.saved <= data.target, {
        message: "Saved cannot be greater than target",
        path: ["saved"],
    })

type FormValues = z.infer<typeof formSchema>

type GoalItem = {
    id?: string | null
    name: string
    target: number
    saved?: number
}

export function EditGoalDialog({ goal, onSuccess }: { goal: GoalItem; onSuccess?: () => void }) {
    const supabase = createClient()
    const [open, setOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
    }, [])

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: goal.name,
            target: goal.target,
            saved: goal.saved ?? 0,
        },
    })

    useEffect(() => {
        if (open) {
            form.reset({ name: goal.name, target: goal.target, saved: goal.saved ?? 0 })
        }
    }, [open, goal, form])

    async function onSubmit(values: FormValues) {
        if (!goal.id) return

        setSaving(true)
        try {
            const newSaved = Math.min(values.saved ?? 0, values.target)

            const { error } = await supabase
                .from("goals")
                .update({ name: values.name, target: values.target, saved: newSaved })
                .eq("id", goal.id)

            if (error) {
                toast.error("Failed", { description: error.message, duration: 3000 })
                return
            }

            toast.success("Success", { description: "Goal has been updated.", duration: 3000 })
            setOpen(false)
            onSuccess?.()
            if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("goals:changed"))
        } catch (err: Error | unknown) {
            toast.error("Failed", { description: err instanceof Error ? err.message : "Unexpected error.", duration: 3000 })
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
                    if (goal.id) setOpen(true)
                }}
                disabled={!goal.id}
            >
                <IconPencil />
                Edit
            </Button>
            <AlertDialogContent onClick={(event) => event.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>Edit Goal</AlertDialogTitle>
                    <AlertDialogDescription>Update your goal details.</AlertDialogDescription>
                </AlertDialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup className="gap-4">
                        <Controller
                            name="name"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={`goal-name-${goal.id ?? "temp"}`}>Name</FieldLabel>
                                    <Input
                                        {...field}
                                        id={`goal-name-${goal.id ?? "temp"}`}
                                        placeholder="Example: Emergency Fund"
                                        aria-invalid={fieldState.invalid}
                                        autoComplete="off"
                                    />
                                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Controller
                            name="target"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={`goal-target-${goal.id ?? "temp"}`}>Target</FieldLabel>
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
                                        id={`goal-target-${goal.id ?? "temp"}`}
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="0"
                                        aria-invalid={fieldState.invalid}
                                        required
                                        autoComplete="off"
                                        onChange={(event) => field.onChange(Number(event.target.value.replace(/\D/g, "")))}
                                    />
                                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Controller
                            name="saved"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={`goal-saved-${goal.id ?? "temp"}`}>Saved</FieldLabel>
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
                                        id={`goal-saved-${goal.id ?? "temp"}`}
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="0"
                                        aria-invalid={fieldState.invalid}
                                        required
                                        autoComplete="off"
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
