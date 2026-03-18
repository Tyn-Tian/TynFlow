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
    AlertDialogDescription,
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
import { IconPlus } from "@tabler/icons-react"

const walletTypes = ["Bank", "Bank Digital", "E-Wallet", "Cash"] as const

const formSchema = z.object({
    name: z.string().min(3, "Name is required"),
    type: z.enum(walletTypes, {
        message: "Type is required",
    }),
    balance: z.number().int().min(0, "Balance must be at least 0"),
})

type FormValues = z.infer<typeof formSchema>

export function AddWalletDialog() {
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
            type: "Bank",
            balance: 0,
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
                    description: "Please login to add a wallet.",
                    duration: 3000,
                })
                return
            }

            const { error } = await supabase.from("wallets").insert({
                name: values.name,
                type: values.type,
                balance: values.balance,
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
                description: "Wallet has been added.",
                duration: 3000,
            })
            form.reset()
            setOpen(false)
            router.refresh()
            if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("wallets:changed"))
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
                    Add Wallet
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader className="gap-0">
                    <AlertDialogTitle>Add Wallet</AlertDialogTitle>
                    <AlertDialogDescription>
                        Fill in the details for your new wallet.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup className="gap-4">
                        <Controller
                            name="name"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="wallet-name">Name</FieldLabel>
                                    <Input
                                        {...field}
                                        id="wallet-name"
                                        placeholder="Example: BCA"
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
                            name="type"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Type</FieldLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Bank">Bank</SelectItem>
                                            <SelectItem value="Bank Digital">Bank Digital</SelectItem>
                                            <SelectItem value="E-Wallet">E-Wallet</SelectItem>
                                            <SelectItem value="Cash">Cash</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        <Controller
                            name="balance"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="wallet-balance">Balance</FieldLabel>
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
                                        id="wallet-balance"
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
