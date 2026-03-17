"use client"

import React, { useEffect, useState } from "react"
import { z } from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { IconPlus, IconCalculator } from "@tabler/icons-react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
    name: z.string().min(1, "Name is required"),
    date: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Date must be in dd/mm/yyyy"),
    amount: z.number().int().min(0, "Amount must be at least 0"),
    budget_id: z.string().optional(),
    wallet_id: z.string().min(1, "Wallet is required"),
})

type FormValues = z.infer<typeof formSchema>

type BudgetOption = { id: string; name: string }
type WalletOption = { id: string; name: string; balance?: number }

export function AddTransactionDialog() {
    const supabase = createClient()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [calcOpen, setCalcOpen] = useState(false)
    const [calcExpr, setCalcExpr] = useState<string>("0")
    const [budgets, setBudgets] = useState<BudgetOption[]>([])
    const [wallets, setWallets] = useState<WalletOption[]>([])
    const [tab, setTab] = useState<"Expense" | "Income">("Expense")

    useEffect(() => setMounted(true), [])

    useEffect(() => {
        if (!open) return
        void (async () => {
            try {
                const { data: userData } = await supabase.auth.getUser()
                const user = userData?.user
                if (!user) return

                const [{ data: budgetsData }, { data: walletsData }] = await Promise.all([
                    supabase.from("budgets").select("id, name").eq("user_id", user.id).order("name", { ascending: true }),
                    supabase.from("wallets").select("id, name, balance").eq("user_id", user.id).order("name", { ascending: true }),
                ])

                setBudgets((budgetsData ?? []) as BudgetOption[])
                setWallets((walletsData ?? []) as WalletOption[])
            } catch (err) {
                toast.error("Failed", { description: err instanceof Error ? err.message : "Unexpected error.", duration: 3000 })
            }
        })()
    }, [open, supabase])

    const pad = (n: number) => String(n).padStart(2, "0")
    const today = new Date()
    const defaultDate = `${pad(today.getDate())}/${pad(today.getMonth() + 1)}/${today.getFullYear()}`

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: "", date: defaultDate, amount: 0, budget_id: undefined, wallet_id: undefined },
    })

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
        if (!open) {
            form.reset()
            setCalcExpr("0")
        }
    }, [open, form])

    async function onSubmit(values: FormValues) {
        setLoading(true)
        try {
            const { data: userData } = await supabase.auth.getUser()
            const user = userData?.user
            if (!user) {
                toast.error("Failed", { description: "Please login.", duration: 3000 })
                return
            }

            const toIsoDate = (d: string) => {
                const [dd, mm, yyyy] = d.split("/")
                const day = Number(dd)
                const month = Number(mm)
                const year = Number(yyyy)
                const dt = new Date(year, month - 1, day)
                if (dt.getFullYear() !== year || dt.getMonth() !== month - 1 || dt.getDate() !== day) {
                    throw new Error("Invalid date")
                }
                return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            }

            const isoDate = toIsoDate(values.date)

            const { error: insertError } = await supabase.from("transactions").insert({
                name: values.name,
                date: isoDate,
                amount: values.amount,
                type: tab,
                budget_id: values.budget_id ?? null,
                wallet_id: values.wallet_id ?? null,
                user_id: user.id,
            })

            if (insertError) {
                toast.error("Failed", { description: insertError.message, duration: 3000 })
                return
            }

            if (values.budget_id && tab === "Expense") {
                try {
                    const { data: bData, error: bErr } = await supabase.from("budgets").select("leftover").eq("id", values.budget_id).single()
                    if (!bErr) {
                        const currentLeftover = bData?.leftover ?? 0
                        const newLeftover = Math.max(0, currentLeftover - values.amount)
                        await supabase.from("budgets").update({ leftover: newLeftover }).eq("id", values.budget_id)
                    }
                } catch (err) {
                    toast.error("Failed", { description: err instanceof Error ? err.message : "Unexpected error.", duration: 3000 })
                }
            }

            if (values.wallet_id) {
                try {
                    const { data: wData, error: wErr } = await supabase.from("wallets").select("balance").eq("id", values.wallet_id).single()
                    if (!wErr) {
                        const currentBalance = wData?.balance ?? 0
                        const delta = tab === "Income" ? values.amount : -values.amount
                        const newBalance = currentBalance + delta
                        await supabase.from("wallets").update({ balance: newBalance }).eq("id", values.wallet_id)
                    }
                } catch (err) {
                    toast.error("Failed", { description: err instanceof Error ? err.message : "Unexpected error.", duration: 3000 })
                }
            }

            toast.success("Success", { description: "Transaction added.", duration: 3000 })
            form.reset()
            setTab("Expense")
            setOpen(false)
            router.refresh()
        } catch (err: Error | unknown) {
            toast.error("Failed", { description: err instanceof Error ? err.message : "Unexpected error.", duration: 3000 })
        } finally {
            setLoading(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button className="cursor-pointer">
                    <IconPlus />
                    Add Transaction
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Add Transaction</AlertDialogTitle>
                </AlertDialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Tabs value={tab} onValueChange={(v) => setTab(v as "Expense" | "Income")} className="mb-6">
                        <TabsList className="mx-auto">
                            <TabsTrigger value="Expense" className="cursor-pointer">Expense</TabsTrigger>
                            <TabsTrigger value="Income" className="cursor-pointer">Income</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <FieldGroup className="gap-6">
                        <Controller
                            name="name"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="transaction-name">Name</FieldLabel>
                                    <Input {...field} id="transaction-name" placeholder="Example: Tomoro" autoComplete="off" />
                                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Controller
                            name="date"
                            control={form.control}
                            render={({ field, fieldState }) => {
                                const format = (v: string) => {
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
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="transaction-date">Date</FieldLabel>
                                        <Input
                                            id="transaction-date"
                                            value={field.value}
                                            placeholder="dd/mm/yyyy"
                                            onChange={(e) => field.onChange(format(e.target.value))}
                                            autoComplete="off"
                                        />
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

                        {tab === "Expense" && (
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
