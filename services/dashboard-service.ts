import { SupabaseClient } from "@supabase/supabase-js"
import * as dashboardRepository from "@/repository/dashboard-repository"
import * as transactionService from "@/services/transaction-service"
import { ChartConfig } from "@/components/ui/chart"

export async function getDashboardDateRange(supabase: SupabaseClient, userId: string) {
    const { data, error } = await dashboardRepository.getDashboardDateRange(supabase, userId)
    if (error) return { startDate: undefined, endDate: undefined }
    return {
        startDate: data.start_date as unknown as string | undefined,
        endDate: data.end_date as unknown as string | undefined,
    }
}

export async function getSummaryCardsData(supabase: SupabaseClient, userId: string) {
    const { startDate, endDate } = await getDashboardDateRange(supabase, userId)

    const incomeTransactions = await transactionService.getFilteredTransactions(supabase, {
        userId,
        type: "Income",
        startDate,
        endDate,
    })

    const expenseTransactions = await transactionService.getFilteredTransactions(supabase, {
        userId,
        type: "Expense",
        startDate,
        endDate,
    })

    const sumAmounts = (txs: any[]) => txs.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0)

    const incomeTotal = sumAmounts(incomeTransactions)
    const expenseTotal = sumAmounts(expenseTransactions)

    let incomePrevTotal = 0
    let expensePrevTotal = 0

    if (startDate && endDate) {
        const sd = new Date(startDate)
        const ed = new Date(endDate)
        const prevSd = new Date(sd)
        const prevEd = new Date(ed)
        prevSd.setMonth(prevSd.getMonth() - 1)
        prevEd.setMonth(prevEd.getMonth() - 1)
        const prevStartIso = prevSd.toISOString()
        const prevEndIso = prevEd.toISOString()

        const incomePrevTransactions = await transactionService.getFilteredTransactions(supabase, {
            userId,
            type: "Income",
            startDate: prevStartIso,
            endDate: prevEndIso,
        })

        const expensePrevTransactions = await transactionService.getFilteredTransactions(supabase, {
            userId,
            type: "Expense",
            startDate: prevStartIso,
            endDate: prevEndIso,
        })

        incomePrevTotal = sumAmounts(incomePrevTransactions)
        expensePrevTotal = sumAmounts(expensePrevTransactions)
    }

    const calcChange = (current: number, previous: number) => {
        if (previous === 0) return current === 0 ? 0 : 100
        return ((current - previous) / Math.abs(previous)) * 100
    }

    return {
        incomeTotal,
        expenseTotal,
        incomeChange: calcChange(incomeTotal, incomePrevTotal),
        expenseChange: calcChange(expenseTotal, expensePrevTotal),
        cashFlow: incomeTotal - expenseTotal,
        startDate,
        endDate,
    }
}
