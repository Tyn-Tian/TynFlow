export type LiveType = "Lembur" | "Biasa"

export const LIVE_PLATFORMS = [
    { id: "tiktok", label: "Tiktok" },
    { id: "shopee", label: "Shopee" },
] as const

export type LivePlatform = (typeof LIVE_PLATFORMS)[number]["id"]

export type LiveItem = {
    id: string
    date: string
    type: LiveType
    tiktok: number
    shopee: number
}

export type HydratedLiveItem = LiveItem & {
    baseRate: number
    sessionCount: number
    baseTotal: number
    salesBonus: number
    total: number
}

const LIVE_SESSION_COUNT = 3
const LIVE_BIASA_RATE = 47000
const LIVE_LEMBUR_RATE = 52000
const LIVE_SALES_RATE = 5000

export function getLiveBaseRate(type: LiveType) {
    return type === "Lembur" ? LIVE_LEMBUR_RATE : LIVE_BIASA_RATE
}

export function getLiveSalesRate() {
    return LIVE_SALES_RATE
}

function getLiveType(value: string | null | undefined): LiveType {
    return value === "Lembur" ? "Lembur" : "Biasa"
}

function getLiveDate(value: string | null | undefined) {
    return value && !Number.isNaN(new Date(value).getTime())
        ? value
        : new Date().toISOString().slice(0, 10)
}

function getNumericValue(value: number | string | null | undefined) {
    const val = Number(value)
    return Number.isFinite(val) ? val : 0
}

export function normalizeLiveItems(
    items: Array<{
        id: string | number
        date: string | null
        type: string | null
        tiktok?: number | string | null
        shopee?: number | string | null
    }>
): LiveItem[] {
    return items.map((item) => ({
        id: String(item.id),
        date: getLiveDate(item.date),
        type: getLiveType(item.type),
        tiktok: getNumericValue(item.tiktok),
        shopee: getNumericValue(item.shopee),
    }))
}

export function hydrateLiveItems(items: LiveItem[]): HydratedLiveItem[] {
    return items.map((item) => {
        const baseRate = getLiveBaseRate(item.type)
        const baseTotal = baseRate * LIVE_SESSION_COUNT
        const totalSales = item.tiktok + item.shopee
        const salesBonus = totalSales * LIVE_SALES_RATE

        return {
            ...item,
            baseRate,
            sessionCount: LIVE_SESSION_COUNT,
            baseTotal,
            salesBonus,
            total: baseTotal + salesBonus,
        }
    })
}
