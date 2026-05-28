"use client";

import {
  IconLogout,
  IconWallet,
  IconCalendarDollar,
  IconLockDollar,
  IconChartPie,
  Icon,
  IconLivePhoto,
  IconBriefcase,
  IconLayoutDashboard,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

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
} from "@/components/ui/alert-dialog";
import { authService } from "@/services/auth-service";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export function NavMain({
  items,
  isLoading,
}: {
  items: {
    title: string;
    url: string;
    icon?: string;
  }[];
  isLoading?: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await authService.logout();
    queryClient.clear();
    router.push("/login");
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <SidebarMenuItem key={i}>
                <div className="flex h-8 w-full items-center gap-2 rounded-md px-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </SidebarMenuItem>
            ))
          ) : (
            items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  className="cursor-pointer"
                  asChild
                >
                  <a href={item.url}>
                    {(() => {
                      const IconMap: Record<string, Icon> = {
                        dashboard: IconLayoutDashboard,
                        wallet: IconWallet,
                        transaction: IconCalendarDollar,
                        budget: IconLockDollar,
                        portfolio: IconChartPie,
                        live: IconLivePhoto,
                        job: IconBriefcase,
                      };
                      const Icon = item.icon ? IconMap[item.icon] : null;
                      return Icon ? <Icon /> : null;
                    })()}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Logout"
                  className="cursor-pointer"
                  asChild
                >
                  <button type="button" className="flex items-center gap-2">
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
                  This action cannot be undone. This will log you out of your
                  account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleLogout}
                  className="cursor-pointer"
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
