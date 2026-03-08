import { SiteHeader } from "@/components/site-header"
import { AddWalletDialog } from "@/components/wallets/add-wallet-dialog"
import { WalletList } from "@/components/wallets/wallet-list"
import { createClient } from "@/lib/supabase/server"
import { IconPigMoney } from "@tabler/icons-react"
import { redirect } from "next/navigation"

export default async function Page() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data } = await supabase
        .from("wallets")
        .select("id, name, type, balance")
        .eq("user_id", user.id)
        .order("name", { ascending: true })

    const wallets = data ?? []

    return (
        <>
            <SiteHeader title="Wallet" />
            <section className="p-6">
                <div className="mx-auto max-w-7xl space-y-4">
                    <div className="flex justify-end">
                        <AddWalletDialog />
                    </div>

                    <div className="col-span-3 flex items-center justify-between rounded-xl border bg-card px-4 py-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <span className="inline-flex size-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <IconPigMoney className="size-4" />
                            </span>
                            <div>
                                <p className="text-sm font-medium">
                                    Balance & Savings
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    March 2026
                                </p>
                            </div>
                        </div>
                        <p className="text-sm font-bold tabular-nums">
                            Rp {wallets.reduce((total, wallet) => total + wallet.balance, 0).toLocaleString("id-ID")}
                        </p>
                    </div>

                    <WalletList wallets={wallets} />
                </div>
            </section>
        </>
    )
}
