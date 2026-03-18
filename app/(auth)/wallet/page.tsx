import { SiteHeader } from "@/components/site-header"
import { AddWalletDialog } from "@/components/wallets/add-wallet-dialog"
import { WalletList } from "@/components/wallets/wallet-list"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function Page() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    return (
        <>
            <SiteHeader title="Wallet" />
            <section className="p-6">
                <div className="mx-auto max-w-7xl space-y-4">
                    <div className="flex justify-end">
                        <AddWalletDialog />
                    </div>

                    <WalletList />
                </div>
            </section>
        </>
    )
}
