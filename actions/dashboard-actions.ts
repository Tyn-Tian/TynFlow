"use server"

import { createClient } from "@/lib/supabase/server"
import * as dashboardService from "@/services/dashboard-service"

export async function getSummaryCardsAction() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    return dashboardService.getSummaryCardsData(supabase, user.id)
}

export async function getIncomeChartDataAction() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    return dashboardService.getIncomeChartData(supabase, user.id)
}

export async function getExpenseChartDataAction() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    return dashboardService.getExpenseChartData(supabase, user.id)
}

export async function getBarChartDataAction() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    return dashboardService.getBarChartData(supabase, user.id)
}
