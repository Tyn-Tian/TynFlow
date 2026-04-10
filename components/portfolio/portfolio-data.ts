import {
    IconBuildingBank,
    IconChartBar,
    IconCoin,
    IconDiamond,
} from "@tabler/icons-react"

import { type PortfolioType } from "@/repository/portfolio-repository"

export { type PortfolioType }

export const portfolioTypeConfig: Record<
    PortfolioType,
    {
        icon: typeof IconBuildingBank
        iconClassName: string
        badgeClassName: string
    }
> = {
    Reksadana: {
        icon: IconBuildingBank,
        iconClassName: "text-sky-500",
        badgeClassName: "border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400",
    },
    Saham: {
        icon: IconChartBar,
        iconClassName: "text-emerald-500",
        badgeClassName: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    Crypto: {
        icon: IconCoin,
        iconClassName: "text-amber-500",
        badgeClassName: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    Emas: {
        icon: IconDiamond,
        iconClassName: "text-yellow-500",
        badgeClassName: "border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    },
}

export function getProgressWidthClass(value: number) {
    if (value >= 100) return "w-full"
    if (value >= 90) return "w-[90%]"
    if (value >= 80) return "w-[80%]"
    if (value >= 70) return "w-[70%]"
    if (value >= 60) return "w-[60%]"
    if (value >= 50) return "w-1/2"
    if (value >= 40) return "w-[40%]"
    if (value >= 30) return "w-[30%]"
    if (value >= 20) return "w-[20%]"
    if (value >= 10) return "w-[10%]"
    if (value > 0) return "w-[5%]"
    return "w-0"
}
