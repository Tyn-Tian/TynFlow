import { SupabaseClient } from "@supabase/supabase-js"
import * as dashboardRepository from "@/repository/dashboard-repository"
import * as transactionService from "@/services/transaction-service"
import * as budgetService from "@/services/budget-service"
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

export async function getIncomeChartData(supabase: SupabaseClient, userId: string) {
    const { startDate, endDate } = await getDashboardDateRange(supabase, userId)

    const txs = await transactionService.getFilteredTransactions(supabase, {
        userId,
        type: "Income",
        startDate,
        endDate,
    })

    const grouped = txs.reduce<Record<string, number>>((acc, t) => {
        const name = t.name ?? "Unnamed"
        acc[name] = (acc[name] ?? 0) + (Number(t.amount) || 0)
        return acc
    }, {})

    const paletteSize = 5
    const entries = Object.entries(grouped)

    const chartData = entries.map(([name, value], idx) => {
        const key = `i_${idx}`
        return {
            name,
            value,
            fill: `var(--color-${key})`,
            [key]: name,
            __key: key,
        }
    })

    const chartConfig: ChartConfig = { value: { label: "Amount" } }
    chartData.forEach((d, idx) => {
        const key = d.__key
        chartConfig[key] = {
            label: `${d.name}`,
            color: `var(--chart-${(idx % paletteSize) + 1})`,
        }
    })

    return { chartData, chartConfig, startDate, endDate }
}

export async function getExpenseChartData(supabase: SupabaseClient, userId: string) {
    const { startDate, endDate } = await getDashboardDateRange(supabase, userId)

    const txs = await transactionService.getFilteredTransactions(supabase, {
        userId,
        type: "Expense",
        startDate,
        endDate,
    })

    const budgetIds = Array.from(new Set(txs.map((t) => t.budget_id).filter(Boolean) as string[]))
    const budgetsMap = new Map<string, string>()

    if (budgetIds.length) {
        const budgets = await budgetService.getBudgets(supabase, userId)
        budgets.filter((b: any) => budgetIds.includes(b.id)).forEach((b: any) => budgetsMap.set(b.id, b.name))
    }

    const grouped = txs.reduce<Record<string, number>>((acc, t) => {
        const bid = t.budget_id ?? "__uncategorized__"
        const name = budgetsMap.get(bid) ?? (bid === "__uncategorized__" ? "Uncategorized" : "Unknown")
        acc[name] = (acc[name] ?? 0) + (Number(t.amount) || 0)
        return acc
    }, {})

    const paletteSize = 5
    const entries = Object.entries(grouped)

    const chartData = entries.map(([name, value], idx) => {
        const key = `b_${idx}`
        return {
            name,
            value,
            fill: `var(--color-${key})`,
            [key]: name,
            __key: key,
        }
    })

    const chartConfig: ChartConfig = { value: { label: "Amount" } }
    chartData.forEach((d, idx) => {
        const key = d.__key
        chartConfig[key] = { label: d.name, color: `var(--chart-${(idx % paletteSize) + 1})` }
    })

    return { chartData, chartConfig, startDate, endDate }
}
