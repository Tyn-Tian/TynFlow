"use client"

import React, { useEffect, useState } from "react"
import { z } from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { IconCalculator } from "@tabler/icons-react"
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
import { createClient } from "@/lib/supabase/client"
import { DeleteTransactionDialog } from "./delete-transaction-dialog"

const formSchema = z.object({
    name: z.string().optional(),
    type: z.enum(["Expense", "Income", "Transfer"]),
    date: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/),
    amount: z.number().int().min(1),
    budget_id: z.string().optional().nullable(),
    wallet_id: z.string().optional().nullable(),
    transfer_id: z.string().optional().nullable(),
    admin_fee: z.number().int().min(0).optional(),
})

type FormValues = z.infer<typeof formSchema>

type TxItem = {
    id: number | string
    name: string
    date: string
    amount: number
    budget_id?: string | null
    wallet_id?: string | null
    transfer_id?: string | null
    type?: "Income" | "Expense" | "Transfer"
    admin_fee?: number | null
}

type Props = { tx?: TxItem | null; onClose?: () => void }

export function EditTransactionDialog({ tx, onClose }: Props) {
    const supabase = createClient()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [budgets, setBudgets] = useState<{ id: string; name: string }[]>([])
    const [wallets, setWallets] = useState<{ id: string; name: string }[]>([])
    const [showDatePicker, setShowDatePicker] = useState(false)
    const datePickerRef = React.useRef<HTMLDivElement | null>(null)

    useEffect(() => setMounted(true), [])

    useEffect(() => {
        function onClick(e: MouseEvent) {
            if (!datePickerRef.current) return
            const target = e.target as Node
            if (showDatePicker && !datePickerRef.current.contains(target)) setShowDatePicker(false)
        }
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setShowDatePicker(false)
        }
        document.addEventListener("mousedown", onClick)
        document.addEventListener("keydown", onKey)
        return () => {
            document.removeEventListener("mousedown", onClick)
            document.removeEventListener("keydown", onKey)
        }
    }, [showDatePicker])

    useEffect(() => {
        if (!open) return
        void (async () => {
            try {
                const { data: userData } = await supabase.auth.getUser()
                const user = userData?.user
                if (!user) return

                const [{ data: budgetsData }, { data: walletsData }] = await Promise.all([
                    supabase.from("budgets").select("id, name").eq("user_id", user.id).order("name", { ascending: true }),
                    supabase.from("wallets").select("id, name").eq("user_id", user.id).order("name", { ascending: true }),
                ])

                setBudgets((budgetsData ?? []))
                setWallets((walletsData ?? []))
            } catch (err) {
                toast.error("Failed", { description: err instanceof Error ? err.message : "Unexpected error." })
            }
        })()
    }, [open, supabase])

    const pad = (n: number) => String(n).padStart(2, "0")
    const toIsoDate = (d: string) => {
        const [dd, mm, yyyy] = d.split("/")
        const day = Number(dd)
        const month = Number(mm)
        const year = Number(yyyy)
        return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    }

    const defaultDate = tx ? new Date(tx.date) : new Date()
    const defaultDateStr = `${pad(defaultDate.getDate())}/${pad(defaultDate.getMonth() + 1)}/${defaultDate.getFullYear()}`

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: tx?.name ?? "",
            type: (tx?.type as "Expense" | "Income" | "Transfer") ?? "Expense",
            date: defaultDateStr,
            amount: tx?.amount ?? 0,
            budget_id: tx?.budget_id ?? undefined,
            wallet_id: tx?.wallet_id ?? undefined,
            transfer_id: tx?.transfer_id ?? undefined,
            admin_fee: tx?.admin_fee ?? 0,
        },
    })
    const type = form.watch("type")
    

    const [calcOpen, setCalcOpen] = useState(false)
    const [calcExpr, setCalcExpr] = useState<string>("0")

    const pressCalc = (v: string) => {
        if (v === "C") return setCalcExpr("0")
        if (v === "DEL") return setCalcExpr((s) => (s.length <= 1 ? "0" : s.slice(0, -1)))
        setCalcExpr((s) => (s === "0" ? v : s + v))
    }
    const evalCalc = () => {
        try {
            const res = Function(`"use strict";return (${calcExpr})`)()
            setCalcExpr(String(Number.isFinite(res) ? res : 0))
        } catch {
            setCalcExpr("0")
        }
    }
    const insertCalc = () => {
        try {
            const res = Function(`"use strict";return (${calcExpr})`)()
            const val = Math.max(0, Math.round(Number.isFinite(res) ? Number(res) : 0))
            form.setValue("amount", val, { shouldValidate: true, shouldDirty: true })
        } catch {
            form.setValue("amount", 0, { shouldValidate: true, shouldDirty: true })
        } finally {
            setCalcOpen(false)
            setCalcExpr("0")
        }
    }

    const formatExprForDisplay = (expr: string) => {
        return expr.replace(/\d+(?:\.\d+)?/g, (m) => {
            try {
                const n = Number(m)
                if (Number.isNaN(n)) return m
                return n.toLocaleString("id-ID")
            } catch {
                return m
            }
        })
    }

    const calcResultValue = () => {
        try {
            let expr = String(calcExpr)
            while (expr.length && /[+\-*/\.]$/.test(expr)) expr = expr.slice(0, -1)
            if (!expr) return 0
            const res = Function(`"use strict";return (${expr})`)()
            return Math.max(0, Math.round(Number.isFinite(res) ? Number(res) : 0))
        } catch {
            return 0
        }
    }

    const formatCalcResult = () => {
        return calcResultValue().toLocaleString("id-ID")
    }

    useEffect(() => {
        if (!tx) return
        void (async () => {
            try {
                const { data, error } = await supabase
                    .from("transactions")
                    .select("id, name, date, amount, type, budget_id, wallet_id, transfer_id, admin_fee")
                    .eq("id", tx.id)
                    .single()

                if (error) {
                    form.reset({
                        name: tx.name,
                        type: (tx?.type as "Expense" | "Income" | "Transfer") ?? "Expense",
                        date: defaultDateStr,
                        amount: tx.amount,
                        budget_id: tx?.budget_id ?? undefined,
                        wallet_id: tx?.wallet_id ?? undefined,
                        transfer_id: tx?.transfer_id ?? undefined,
                        admin_fee: tx?.admin_fee ?? 0,
                    })
                } else {
                    const d = new Date(data.date)
                    const dateStr = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
                    form.reset({
                        name: data.name,
                        type: data.type ?? "Expense",
                        date: dateStr,
                        amount: data.amount,
                        budget_id: data.budget_id ?? undefined,
                        wallet_id: data.wallet_id ?? undefined,
                        transfer_id: data.transfer_id ?? undefined,
                        admin_fee: data.admin_fee ?? 0,
                    })
                }
            } catch (err) {
                toast.error("Failed", { description: err instanceof Error ? err.message : "Unexpected error." })
                form.reset({
                    name: tx.name,
                    type: (tx?.type as "Expense" | "Income" | "Transfer") ?? "Expense",
                    date: defaultDateStr,
                    amount: tx.amount,
                    budget_id: tx?.budget_id ?? undefined,
                    wallet_id: tx?.wallet_id ?? undefined,
                    transfer_id: tx?.transfer_id ?? undefined,
                    admin_fee: tx?.admin_fee ?? 0,
                })
            } finally {
                setOpen(true)
            }
        })()
    }, [tx, defaultDateStr, form, supabase])

    async function onSubmit(values: FormValues) {
        if (!tx) return
        setLoading(true)
        try {
            const { data: prevData, error: prevErr } = await supabase.from("transactions").select("amount, budget_id, wallet_id, transfer_id, type, admin_fee").eq("id", tx.id).single()
            if (prevErr) throw prevErr

            const prevAmount = prevData?.amount ?? 0
            const prevBudgetId = prevData?.budget_id ?? null
            const prevWalletId = prevData?.wallet_id ?? null
            const prevTransferId = prevData?.transfer_id ?? null
            const prevType = prevData?.type ?? "Expense"
            const prevAdmin = prevData?.admin_fee ?? 0

            const isoDate = toIsoDate(values.date)
            const { error } = await supabase.from("transactions").update({
                name: values.name,
                date: isoDate,
                amount: values.amount,
                budget_id: values.budget_id ?? null,
                wallet_id: values.wallet_id ?? null,
            }).eq("id", tx.id)

            if (error) {
                toast.error("Failed", { description: error.message })
                return
            }

            if (prevType === "Expense") {
                if (prevBudgetId) {
                    try {
                        const { data: bData, error: bErr } = await supabase.from("budgets").select("leftover").eq("id", prevBudgetId).single()
                        if (!bErr) {
                            const currentLeftover = bData?.leftover ?? 0
                            const newLeftover = currentLeftover + prevAmount
                            await supabase.from("budgets").update({ leftover: newLeftover }).eq("id", prevBudgetId)
                        }
                    } catch (err) {
                        toast.error("Failed", { description: err instanceof Error ? err.message : "Unexpected error." })
                    }
                }
                if (prevWalletId) {
                    try {
                        const { data: wData, error: wErr } = await supabase.from("wallets").select("balance").eq("id", prevWalletId).single()
                        if (!wErr) {
                            const currentBalance = wData?.balance ?? 0
                            const newBalance = currentBalance + prevAmount
                            await supabase.from("wallets").update({ balance: newBalance }).eq("id", prevWalletId)
                        }
                    } catch (err) {
                        toast.error("Failed", { description: err instanceof Error ? err.message : "Unexpected error." })
                    }
                }
            } else if (prevType === "Income") {
                if (prevWalletId) {
                    try {
                        const { data: wData, error: wErr } = await supabase.from("wallets").select("balance").eq("id", prevWalletId).single()
                        if (!wErr) {
                            const currentBalance = wData?.balance ?? 0
                            const newBalance = currentBalance - prevAmount
                            await supabase.from("wallets").update({ balance: newBalance }).eq("id", prevWalletId)
                        }
                    } catch (err) {
                        toast.error("Failed", { description: err instanceof Error ? err.message : "Unexpected error." })
                    }
                }
            } else if (prevType === "Transfer") {
                // revert transfer: add back to source (amount + admin) and subtract from dest (amount)
                if (prevWalletId) {
                    try {
                        const { data: wData, error: wErr } = await supabase.from("wallets").select("balance").eq("id", prevWalletId).single()
                        if (!wErr) {
                            const currentBalance = wData?.balance ?? 0
                            const newBalance = currentBalance + prevAmount + (prevAdmin ?? 0)
                            await supabase.from("wallets").update({ balance: newBalance }).eq("id", prevWalletId)
                        }
                    } catch (err) {
                        toast.error("Failed", { description: err instanceof Error ? err.message : "Unexpected error." })
                    }
                }
                if (prevTransferId) {
                    try {
                        const { data: wData, error: wErr } = await supabase.from("wallets").select("balance").eq("id", prevTransferId).single()
                        if (!wErr) {
                            const currentBalance = wData?.balance ?? 0
                            const newBalance = currentBalance - prevAmount
                            await supabase.from("wallets").update({ balance: newBalance }).eq("id", prevTransferId)
                        }
                    } catch (err) {
                        toast.error("Failed", { description: err instanceof Error ? err.message : "Unexpected error." })
                    }
                }
            }

            // Apply new effects based on selected type
            if (values.type === "Expense") {
                if (values.budget_id) {
                    try {
                        const { data: bData, error: bErr } = await supabase.from("budgets").select("leftover").eq("id", values.budget_id).single()
                        if (!bErr) {
                            const currentLeftover = bData?.leftover ?? 0
                            const newLeftover = Math.max(0, currentLeftover - values.amount)
                            await supabase.from("budgets").update({ leftover: newLeftover }).eq("id", values.budget_id)
                        }
                    } catch (err) {
                        toast.error("Failed", { description: err instanceof Error ? err.message : "Unexpected error." })
                    }
                }
            }
            if (values.type === "Income") {
                if (values.wallet_id) {
                    try {
                        const { data: wData, error: wErr } = await supabase.from("wallets").select("balance").eq("id", values.wallet_id).single()
                        if (!wErr) {
                            const currentBalance = wData?.balance ?? 0
                            const newBalance = currentBalance + values.amount
                            await supabase.from("wallets").update({ balance: newBalance }).eq("id", values.wallet_id)
                        }
                    } catch (err) {
                        toast.error("Failed", { description: err instanceof Error ? err.message : "Unexpected error." })
                    }
                }
            } else if (values.type === "Expense") {
                if (values.wallet_id) {
                    try {
                        const { data: wData, error: wErr } = await supabase.from("wallets").select("balance").eq("id", values.wallet_id).single()
                        if (!wErr) {
                            const currentBalance = wData?.balance ?? 0
                            const newBalance = currentBalance - values.amount
                            await supabase.from("wallets").update({ balance: newBalance }).eq("id", values.wallet_id)
                        }
                    } catch (err) {
                        toast.error("Failed", { description: err instanceof Error ? err.message : "Unexpected error." })
                    }
                }
            } else if (values.type === "Transfer") {
                const admin = values.admin_fee ?? 0
                if (values.wallet_id) {
                    try {
                        const { data: wData, error: wErr } = await supabase.from("wallets").select("balance").eq("id", values.wallet_id).single()
                        if (!wErr) {
                            const currentBalance = wData?.balance ?? 0
                            const newBalance = currentBalance - (values.amount + admin)
                            await supabase.from("wallets").update({ balance: newBalance }).eq("id", values.wallet_id)
                        }
                    } catch (err) {
                        toast.error("Failed", { description: err instanceof Error ? err.message : "Unexpected error." })
                    }
                }

                if (values.transfer_id) {
                    try {
                        const { data: wData, error: wErr } = await supabase.from("wallets").select("balance").eq("id", values.transfer_id).single()
                        if (!wErr) {
                            const currentBalance = wData?.balance ?? 0
                            const newBalance = currentBalance + values.amount
                            await supabase.from("wallets").update({ balance: newBalance }).eq("id", values.transfer_id)
                        }
                    } catch (err) {
                        toast.error("Failed", { description: err instanceof Error ? err.message : "Unexpected error." })
                    }
                }
            }

            toast.success("Success", { description: "Transaction updated." })
            setOpen(false)
            onClose?.()
            router.refresh()
        } catch (err) {
            toast.error("Failed", { description: err instanceof Error ? err.message : "Unexpected error." })
        } finally {
            setLoading(false)
        }
    }
    const [showDelete, setShowDelete] = useState(false)

    return (
        <>
            <AlertDialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) onClose?.() }}>
                <AlertDialogTrigger asChild>
                    <div />
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Edit Transaction</AlertDialogTitle>
                    </AlertDialogHeader>

                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup className="gap-4">
                            {type !== "Transfer" && (
                                <Controller
                                    name="name"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="transaction-name">Name</FieldLabel>
                                            <Input {...field} id="transaction-name" placeholder="Example: Tomoro" />
                                            {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />
                            )}

                            <Controller
                                name="date"
                                control={form.control}
                                render={({ field, fieldState }) => {
                                    const format = (v: string) => {
                                        const digits = v.replace(/\D/g, "").slice(0, 8)
                                        const parts: string[] = []
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
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="transaction-date">Date</FieldLabel>
                                            <div className="relative" ref={datePickerRef}>
                                                <div className="flex items-center">
                                                    <Input
                                                        id="transaction-date"
                                                        value={field.value}
                                                        placeholder="dd/mm/yyyy"
                                                        onChange={(e) => field.onChange(format(e.target.value))}
                                                        autoComplete="off"
                                                        className="flex-1"
                                                    />

                                                    <button
                                                        type="button"
                                                        aria-label="Open date picker"
                                                        onClick={() => setShowDatePicker(true)}
                                                        className="w-9 h-10 flex items-center justify-center ml-2 cursor-pointer"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"/></svg>
                                                    </button>
                                                </div>

                                                {showDatePicker && (
                                                    <div className="absolute z-50 mt-2">
                                                        <Calendar
                                                            mode="single"
                                                            selected={(() => {
                                                                try {
                                                                    const [dd, mm, yyyy] = String(field.value || defaultDateStr).split("/")
                                                                    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
                                                                    return Number.isNaN(d.getTime()) ? undefined : d
                                                                } catch {
                                                                    return undefined
                                                                }
                                                            })()}
                                                            onSelect={(d) => {
                                                                if (!d) return
                                                                const day = Array.isArray(d) ? d[0] : d
                                                                const dd = String(day.getDate()).padStart(2, "0")
                                                                const mm = String(day.getMonth() + 1).padStart(2, "0")
                                                                const yyyy = String(day.getFullYear())
                                                                field.onChange(`${dd}/${mm}/${yyyy}`)
                                                                setShowDatePicker(false)
                                                            }}
                                                            className="rounded-lg border"
                                                            captionLayout="dropdown"
                                                        />
                                                    </div>
                                                )}

                                            </div>
                                            {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )
                                }}
                            />

                            <Controller
                                name="amount"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="transaction-amount">Amount</FieldLabel>
                                        <div className="flex items-center gap-2">
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
                                                id="transaction-amount"
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="0"
                                                onChange={(event) => field.onChange(Number(event.target.value.replace(/\D/g, "")))}
                                                className="flex-1"
                                            />

                                            <Button
                                                type="button"
                                                aria-label="Open calculator"
                                                onClick={() => {
                                                    setCalcExpr(String(field.value ?? 0))
                                                    setCalcOpen(true)
                                                }}
                                                className="w-9 h-10 flex items-center justify-center cursor-pointer"
                                            >
                                                <IconCalculator />
                                            </Button>

                                            <AlertDialog open={calcOpen} onOpenChange={(v) => {
                                                setCalcOpen(v)
                                                if (v) setCalcExpr(String(field.value ?? 0))
                                            }}>
                                                <AlertDialogContent className="w-96">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Calculator</AlertDialogTitle>
                                                    </AlertDialogHeader>

                                                    <div className="mb-4 text-right text-2xl font-medium">{formatExprForDisplay(calcExpr)}</div>

                                                    <div className="grid grid-cols-4 gap-2">
                                                        {[
                                                            "C", "DEL", "/", "*",
                                                            "7", "8", "9", "-",
                                                            "4", "5", "6", "+",
                                                            "1", "2", "3", "=",
                                                            "0",
                                                        ].map((k) => (
                                                            <Button key={k} type="button" onClick={() => {
                                                                if (k === "DEL") pressCalc("DEL")
                                                                else if (k === "C") pressCalc("C")
                                                                else if (k === "+") pressCalc("+")
                                                                else if (k === "=") evalCalc()
                                                                else pressCalc(k)
                                                            }}
                                                                className={k === "C" ? "bg-rose-500 text-white hover:bg-rose-500 hover:text-white" : ""}
                                                            >{k}</Button>
                                                        ))}
                                                        <Button className="col-span-3 cursor-pointer" onClick={() => insertCalc()}>Rp {formatCalcResult()}</Button>
                                                    </div>

                                                    <div className="mt-4 flex justify-end gap-2">
                                                        <AlertDialogCancel onClick={() => setCalcOpen(false)} className="cursor-pointer">Close</AlertDialogCancel>
                                                        <Button onClick={() => { insertCalc(); }} className="cursor-pointer">Insert</Button>
                                                    </div>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                        {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            {type === "Expense" && (
                                <Controller
                                    name="budget_id"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel>Budget</FieldLabel>
                                            <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v || undefined)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select budget" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {budgets.map((b) => (
                                                        <SelectItem key={b.id} value={b.id}>
                                                            {b.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />
                            )}

                            {type === "Transfer" ? (
                                <>
                                    <Controller
                                        name="wallet_id"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel>From Wallet</FieldLabel>
                                                <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v || undefined)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select source wallet" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {wallets.map((w) => (
                                                            <SelectItem key={w.id} value={w.id}>
                                                                {w.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        name="transfer_id"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel>To Wallet</FieldLabel>
                                                <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v || undefined)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select destination wallet" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {wallets.map((w) => (
                                                            <SelectItem key={w.id} value={w.id}>
                                                                {w.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        name="admin_fee"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor="transaction-admin-fee">Admin Fee (optional)</FieldLabel>
                                                <Input
                                                    id="transaction-admin-fee"
                                                    type="text"
                                                    inputMode="numeric"
                                                    placeholder="0"
                                                    value={mounted ? (field.value ?? 0).toLocaleString("id-ID") : String(field.value ?? 0)}
                                                    onChange={(e) => field.onChange(Number(e.target.value.replace(/\D/g, "")))}
                                                />
                                                {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />
                                </>
                            ) : (
                                <Controller
                                    name="wallet_id"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel>Wallet</FieldLabel>
                                            <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v || undefined)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select wallet" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {wallets.map((w) => (
                                                        <SelectItem key={w.id} value={w.id}>
                                                            {w.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />
                            )}

                            <AlertDialogFooter>
                                <AlertDialogCancel type="button" className="cursor-pointer">Cancel</AlertDialogCancel>
                                <Button variant="destructive" type="button" onClick={() => { setOpen(false); setShowDelete(true) }} className="cursor-pointer bg-rose-500!">
                                    Delete
                                </Button>
                                <Button type="submit" disabled={loading} className="cursor-pointer">
                                    {loading ? "Saving..." : "Save"}
                                </Button>
                            </AlertDialogFooter>
                        </FieldGroup>
                    </form>
                </AlertDialogContent>
            </AlertDialog>

            {showDelete && tx && (
                <DeleteTransactionDialog
                    tx={tx}
                    onDeleted={() => {
                        setShowDelete(false)
                        onClose?.()
                    }}
                    onClose={() => {
                        setShowDelete(false)
                        setOpen(true)
                    }}
                />
            )}
        </>
    )
}
