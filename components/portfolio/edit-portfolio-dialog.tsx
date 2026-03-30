"use client"

import { useEffect, useState } from "react"
import { z } from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { IconCalculator, IconPencil } from "@tabler/icons-react"
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
} from "@/components/ui/alert-dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type PortfolioType } from "@/components/portfolio/portfolio-data"

const portfolioTypes: PortfolioType[] = ["Reksadana", "Saham", "Crypto", "Emas"]

const formSchema = z.object({
    name: z.string().min(2, "Name is required"),
    type: z.enum(portfolioTypes),
    target: z.number().min(0, "Target must be at least 0"),
    invested: z.number().min(0, "Invested must be at least 0"),
    currentValue: z.number().min(0, "Current value must be at least 0"),
})

type FormValues = z.infer<typeof formSchema>

type PortfolioDialogItem = {
    id?: string | null
    name: string
    type: PortfolioType
    target: number
    invested: number
    currentValue: number
}

export function EditPortfolioDialog({
    portfolio,
    onSuccess,
}: {
    portfolio: PortfolioDialogItem
    onSuccess?: () => void
}) {
    const supabase = createClient()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [calcOpen, setCalcOpen] = useState(false)
    const [calcExpr, setCalcExpr] = useState<string>("0")
    const [calcField, setCalcField] = useState<"invested" | "currentValue" | null>(null)

    useEffect(() => {
        setMounted(true)
    }, [])

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: portfolio.name,
            type: portfolio.type,
            target: portfolio.target,
            invested: portfolio.invested,
            currentValue: portfolio.currentValue,
        },
    })

    const pressCalc = (value: string) => {
        if (value === "C") return setCalcExpr("0")
        if (value === "DEL") return setCalcExpr((current) => (current.length <= 1 ? "0" : current.slice(0, -1)))
        setCalcExpr((current) => (current === "0" ? value : current + value))
    }

    const evalCalc = () => {
        try {
            const result = Function(`"use strict";return (${calcExpr})`)()
            setCalcExpr(String(Number.isFinite(result) ? result : 0))
        } catch {
            setCalcExpr("0")
        }
    }

    const calcResultValue = () => {
        try {
            let expression = String(calcExpr)
            while (expression.length && /[+\-*/\.]$/.test(expression)) expression = expression.slice(0, -1)
            if (!expression) return 0
            const result = Function(`"use strict";return (${expression})`)()
            return Math.max(0, Math.round(Number.isFinite(result) ? Number(result) : 0))
        } catch {
            return 0
        }
    }

    const formatExprForDisplay = (expression: string) => {
        return expression.replace(/\d+(?:\.\d+)?/g, (match) => {
            try {
                const number = Number(match)
                if (Number.isNaN(number)) return match
                return number.toLocaleString("id-ID")
            } catch {
                return match
            }
        })
    }

    const formatCalcResult = () => calcResultValue().toLocaleString("id-ID")

    const openCalculator = (fieldName: "invested" | "currentValue", value: number) => {
        setCalcField(fieldName)
        setCalcExpr(String(value ?? 0))
        setCalcOpen(true)
    }

    const insertCalc = () => {
        const fieldName = calcField
        if (!fieldName) return

        form.setValue(fieldName, calcResultValue(), { shouldValidate: true, shouldDirty: true })
        setCalcOpen(false)
        setCalcExpr("0")
        setCalcField(null)
    }

    useEffect(() => {
        if (open) {
            form.reset({
                name: portfolio.name,
                type: portfolio.type,
                target: portfolio.target,
                invested: portfolio.invested,
                currentValue: portfolio.currentValue,
            })
            setCalcOpen(false)
            setCalcExpr("0")
            setCalcField(null)
        }
    }, [form, open, portfolio])

    async function onSubmit(values: FormValues) {
        if (!portfolio.id) return

        setSaving(true)

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                toast.error("Failed", {
                    description: "Please login to edit a portfolio.",
                    duration: 3000,
                })
                return
            }

            const { error } = await supabase
                .from("portfolios")
                .update({
                    name: values.name,
                    type: values.type,
                    target: values.target,
                    invested: values.invested,
                    current_value: values.currentValue,
                })
                .eq("id", portfolio.id)
                .eq("user_id", user.id)

            if (error) {
                toast.error("Failed", {
                    description: error.message,
                    duration: 3000,
                })
                return
            }

            toast.success("Success", {
                description: "Portfolio has been updated.",
                duration: 3000,
            })
            setOpen(false)
            onSuccess?.()
            router.refresh()
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("portfolios:changed"))
            }
        } catch (error) {
            toast.error("Failed", {
                description: error instanceof Error ? error.message : "Unexpected error.",
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
                    if (portfolio.id) setOpen(true)
                }}
                disabled={!portfolio.id}
            >
                <IconPencil />
                Edit
            </Button>
            <AlertDialogContent onClick={(event) => event.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>Edit Portfolio</AlertDialogTitle>
                    <AlertDialogDescription>Update your portfolio details.</AlertDialogDescription>
                </AlertDialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup className="gap-4">
                        <Controller
                            name="name"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={`portfolio-name-${portfolio.id ?? "temp"}`}>
                                        Name
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id={`portfolio-name-${portfolio.id ?? "temp"}`}
                                        placeholder="Example: Bitcoin"
                                        aria-invalid={fieldState.invalid}
                                        autoComplete="off"
                                    />
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
                                        <SelectTrigger aria-invalid={fieldState.invalid} className="w-full">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {portfolioTypes.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Controller
                            name="target"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={`portfolio-target-${portfolio.id ?? "temp"}`}>
                                        Target
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
                                        id={`portfolio-target-${portfolio.id ?? "temp"}`}
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="0"
                                        aria-invalid={fieldState.invalid}
                                        autoComplete="off"
                                        onChange={(event) =>
                                            field.onChange(Number(event.target.value.replace(/\D/g, "")))
                                        }
                                    />
                                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Controller
                            name="invested"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={`portfolio-invested-${portfolio.id ?? "temp"}`}>
                                        Invested
                                    </FieldLabel>
                                    <div className="flex gap-2">
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
                                            id={`portfolio-invested-${portfolio.id ?? "temp"}`}
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="0"
                                            aria-invalid={fieldState.invalid}
                                            autoComplete="off"
                                            className="flex-1"
                                            onChange={(event) =>
                                                field.onChange(Number(event.target.value.replace(/\D/g, "")))
                                            }
                                        />
                                        <Button
                                            type="button"
                                            aria-label="Open calculator for invested"
                                            onClick={() => openCalculator("invested", field.value ?? 0)}
                                            className="w-9 cursor-pointer items-center justify-center"
                                        >
                                            <IconCalculator />
                                        </Button>
                                    </div>
                                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Controller
                            name="currentValue"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={`portfolio-current-value-${portfolio.id ?? "temp"}`}>
                                        Current Value
                                    </FieldLabel>
                                    <div className="flex gap-2">
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
                                            id={`portfolio-current-value-${portfolio.id ?? "temp"}`}
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="0"
                                            aria-invalid={fieldState.invalid}
                                            autoComplete="off"
                                            className="flex-1"
                                            onChange={(event) =>
                                                field.onChange(Number(event.target.value.replace(/\D/g, "")))
                                            }
                                        />
                                        <Button
                                            type="button"
                                            aria-label="Open calculator for current value"
                                            onClick={() => openCalculator("currentValue", field.value ?? 0)}
                                            className="w-9 cursor-pointer items-center justify-center"
                                        >
                                            <IconCalculator />
                                        </Button>
                                    </div>
                                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <AlertDialog
                            open={calcOpen}
                            onOpenChange={(value) => {
                                setCalcOpen(value)
                                if (!value) {
                                    setCalcExpr("0")
                                    setCalcField(null)
                                }
                            }}
                        >
                            <AlertDialogContent className="w-96">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Calculator</AlertDialogTitle>
                                    <AlertDialogDescription>Calculate portfolio values quickly.</AlertDialogDescription>
                                </AlertDialogHeader>

                                <div className="mb-4 text-right text-2xl font-medium">
                                    {formatExprForDisplay(calcExpr)}
                                </div>

                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        "C", "DEL", "/", "*",
                                        "7", "8", "9", "-",
                                        "4", "5", "6", "+",
                                        "1", "2", "3", "=",
                                        "0",
                                    ].map((key) => (
                                        <Button
                                            key={key}
                                            type="button"
                                            onClick={() => {
                                                if (key === "DEL") pressCalc("DEL")
                                                else if (key === "C") pressCalc("C")
                                                else if (key === "=") evalCalc()
                                                else pressCalc(key)
                                            }}
                                            className={key === "C" ? "bg-rose-500 text-white hover:bg-rose-500 hover:text-white" : ""}
                                        >
                                            {key}
                                        </Button>
                                    ))}
                                    <Button type="button" className="col-span-3 cursor-pointer" onClick={insertCalc}>
                                        Rp {formatCalcResult()}
                                    </Button>
                                </div>

                                <div className="mt-4 flex justify-end gap-2">
                                    <AlertDialogCancel
                                        onClick={() => {
                                            setCalcOpen(false)
                                            setCalcExpr("0")
                                            setCalcField(null)
                                        }}
                                        className="cursor-pointer"
                                    >
                                        Close
                                    </AlertDialogCancel>
                                    <Button type="button" onClick={insertCalc} className="cursor-pointer">
                                        Insert
                                    </Button>
                                </div>
                            </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialogFooter>
                            <AlertDialogCancel type="button" className="cursor-pointer">
                                Cancel
                            </AlertDialogCancel>
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