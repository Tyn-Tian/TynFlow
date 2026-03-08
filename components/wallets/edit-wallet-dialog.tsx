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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const walletTypes = ["Bank", "Bank Digital", "E-Wallet", "Cash"] as const

const formSchema = z.object({
    name: z.string().min(3, "Name is required"),
    type: z.enum(walletTypes, {
        message: "Type is required",
    }),
    balance: z.number().int().min(0, "Balance must be at least 0"),
})

type FormValues = z.infer<typeof formSchema>

type WalletItem = {
    id?: string | null
    name: string
    type: string
    balance: number
}

export function EditWalletDialog({
    wallet,
    onSuccess,
}: {
    wallet: WalletItem
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
            name: wallet.name,
            type: wallet.type as FormValues["type"],
            balance: wallet.balance,
        },
    })

    useEffect(() => {
        if (open) {
            form.reset({
                name: wallet.name,
                type: wallet.type as FormValues["type"],
                balance: wallet.balance,
            })
        }
    }, [open, wallet, form])

    async function onSubmit(values: FormValues) {
        if (!wallet.id) return

        setSaving(true)
        try {
            const { error } = await supabase
                .from("wallets")
                .update({
                    name: values.name,
                    type: values.type,
                    balance: values.balance,
                })
                .eq("id", wallet.id)

            if (error) {
                toast.error("Failed", {
                    description: error.message,
                    duration: 3000,
                })
                return
            }

            toast.success("Success", {
                description: "Wallet has been updated.",
                duration: 3000,
            })
            setOpen(false)
            onSuccess?.()
            router.refresh()
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
                    if (wallet.id) setOpen(true)
                }}
                disabled={!wallet.id}
            >
                <IconPencil />
                Edit
            </Button>
            <AlertDialogContent onClick={(event) => event.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>Edit Wallet</AlertDialogTitle>
                    <AlertDialogDescription>
                        Update your wallet details.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup className="gap-4">
                        <Controller
                            name="name"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={`wallet-name-${wallet.id ?? "temp"}`}>
                                        Name
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id={`wallet-name-${wallet.id ?? "temp"}`}
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
                                    <Select value={field.value} onValueChange={field.onChange}>
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
                                    <FieldLabel htmlFor={`wallet-balance-${wallet.id ?? "temp"}`}>
                                        Balance
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
                                        id={`wallet-balance-${wallet.id ?? "temp"}`}
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
