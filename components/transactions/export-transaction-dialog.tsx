"use client"

import React, { useState } from "react"
import { toast } from "sonner"
import { IconDownload } from "@tabler/icons-react"
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns"
import * as XLSX from "xlsx"

import { getTransactionsForExportAction } from "@/actions/transaction-actions"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ExportTransactionDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), "yyyy-MM"))

    // Generate last 6 months
    const months = Array.from({ length: 6 }).map((_, i) => {
        const d = subMonths(new Date(), i)
        return {
            label: format(d, "MMMM yyyy"),
            value: format(d, "yyyy-MM"),
            startDate: format(startOfMonth(d), "yyyy-MM-dd"),
            endDate: format(endOfMonth(d), "yyyy-MM-dd"),
        }
    })

    const handleExport = async () => {
        setLoading(true)
        try {
            const monthData = months.find((m) => m.value === selectedMonth)
            if (!monthData) throw new Error("Invalid month selected")

            const transactions = await getTransactionsForExportAction({
                startDate: monthData.startDate,
                endDate: monthData.endDate,
            })

            if (transactions.length === 0) {
                toast.info("No transactions found for the selected period.")
                return
            }

            // Map data for Excel
            const exportData = transactions.map((t) => ({
                "Name": t.name,
                "Date": format(new Date(t.date), "dd-MM-yyyy"),
                "Amount": t.amount,
                "Type": t.type,
                "Budget": t.budgetName || "-",
                "Wallet": t.walletName || "-",
            }))

            // Create worksheet
            const worksheet = XLSX.utils.json_to_sheet(exportData)
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions")

            // Generate buffer and trigger download
            XLSX.writeFile(workbook, `Transactions_${selectedMonth}.xlsx`)

            toast.success("Success", { description: "Transactions exported successfully." })
            setOpen(false)
        } catch (err) {
            toast.error("Failed", {
                description: err instanceof Error ? err.message : "Unexpected error.",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="outline" className="cursor-pointer">
                    <IconDownload />
                    Export
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Export Transactions</AlertDialogTitle>
                </AlertDialogHeader>

                <FieldGroup className="gap-6 my-4">
                    <Field>
                        <FieldLabel>Select Month</FieldLabel>
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select month" />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((m) => (
                                    <SelectItem key={m.value} value={m.value}>
                                        {m.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                </FieldGroup>

                <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                    <Button onClick={handleExport} disabled={loading} className="cursor-pointer">
                        {loading ? "Exporting..." : "Export to Excel"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
