"use client"

import React, { useEffect, useState } from "react"
import { z } from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { IconPlus } from "@tabler/icons-react"

const formSchema = z.object({
    name: z.string().min(3, "Name is required"),
    total: z.number().int().min(0, "Total must be at least 0"),
})

type FormValues = z.infer<typeof formSchema>

export function AddBudgetDialog() {
    const supabase = createClient()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
    }, [])

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            total: 0,
        },
    })

    async function onSubmit(values: FormValues) {
        setLoading(true)

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                toast.error("Failed", {
                    description: "Please login to add a budget.",
                    duration: 3000,
                })
                return
            }

            const { error } = await supabase.from("budgets").insert({
                name: values.name,
                total: values.total,
                leftover: values.total,
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
                description: "Budget has been added.",
                duration: 3000,
            })
            form.reset()
            setOpen(false)
            router.refresh()
            if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("budgets:changed"))
        } catch (err: Error | unknown) {
            toast.error("Failed", {
                description: err instanceof Error ? err.message : "Unexpected error.",
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
                    Add Budget
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader className="gap-0">
                    <AlertDialogTitle>Add Budget</AlertDialogTitle>
                </AlertDialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup className="gap-4">
                        <Controller
                            name="name"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="budget-name">Name</FieldLabel>
                                    <Input
                                        {...field}
                                        id="budget-name"
                                        placeholder="Example: Food & Drink"
                                        aria-invalid={fieldState.invalid}
                                        autoComplete="off"
                                        autoCorrect="off"
                                        autoCapitalize="none"
                                    />
                                    {fieldState.error && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        <Controller
                            name="total"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="budget-total">Total</FieldLabel>
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
                                        id="budget-total"
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="0"
                                        aria-invalid={fieldState.invalid}
                                        required
                                        autoComplete="off"
                                        autoCorrect="off"
                                        autoCapitalize="none"
                                        onChange={(event) =>
                                            field.onChange(
                                                Number(event.target.value.replace(/\D/g, ""))
                                            )
                                        }
                                    />
                                    {fieldState.error && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        <AlertDialogFooter>
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
