"use client"

import {
  IconLogout,
  IconDashboard,
  IconWallet,
  IconCalendarDollar,
  IconLockDollar,
  IconChartPie,
  Icon,
  IconLivePhoto,
  IconBriefcase,
} from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: string
  }[]
}) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title} className="cursor-pointer" asChild>
                <a href={item.url}>
                  {(() => {
                    const IconMap: Record<string, Icon> = {
                      dashboard: IconDashboard,
                      wallet: IconWallet,
                      transaction: IconCalendarDollar,
                      budget: IconLockDollar,
                      portfolio: IconChartPie,
                      live: IconLivePhoto,
                      job: IconBriefcase
                    }
                    const Icon = item.icon ? IconMap[item.icon] : null
                    return Icon ? <Icon /> : null
                  })()}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Logout" className="cursor-pointer" asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2"
                  >
                    <IconLogout className="text-rose-500" />
                    <span className="text-rose-500">Logout</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will log you out of your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout} className="cursor-pointer">Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
