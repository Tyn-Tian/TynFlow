import * as React from "react"
import { IconInnerShadowTop } from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/server"

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: "Dashboard",
            url: "/",
            icon: "dashboard",
        },
        {
            title: "Wallet",
            url: "/wallet",
            icon: "wallet",
        },
        {
            title: "Transaction",
            url: "/transaction",
            icon: "transaction",
        },
        {
            title: "Budget",
            url: "/budget",
            icon: "budget",
        },
        {
            title: "Portfolio",
            url: "/portfolio",
            icon: "portfolio",
        },
        {
            title: "Live",
            url: "/live",
            icon: "live"
        }
    ],
}

const LIVE_NAV_USER_ID = "8017eb2d-1c88-4e83-ba13-80ce15477154"

export async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const supabase = await createClient()

    const { data: userData } = await supabase.auth.getUser()
    let displayName = userData?.user?.user_metadata?.full_name ?? "Unknown User"
    const userId = userData?.user?.id

    if (userId) {
        const { data: profile, error } = await supabase
            .from("profiles")
            .select("name")
            .eq("user_id", userId)
            .single()

        if (!error && profile?.name) {
            displayName = profile.name
        }
    }

    const user = {
        name: displayName,
        email: userData?.user?.email ?? "",
        avatar: "/avatars/default.png",
    }

    const navItems = data.navMain.filter((item) => {
        if (item.icon !== "live") {
            return true
        }

        return userId === LIVE_NAV_USER_ID
    })

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:p-1.5!"
                        >
                            <a href="#">
                                <IconInnerShadowTop className="size-5!" />
                                <span className="text-base font-semibold">TynFlow</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
        </Sidebar>
    )
}
