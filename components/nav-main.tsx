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
  IconBasketHeart,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
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
import { authApi } from "@/lib/api/auth-api";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ChevronRight } from "lucide-react";

const IconMap: Record<string, Icon> = {
  dashboard: IconLayoutDashboard,
  wallet: IconWallet,
  transaction: IconCalendarDollar,
  budget: IconLockDollar,
  portfolio: IconChartPie,
  live: IconLivePhoto,
  job: IconBriefcase,
  wishlist: IconBasketHeart
};

export function NavMain({
  items,
  isLoading,
}: {
  items: {
    title: string;
    url: string;
    icon?: string;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
  isLoading?: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await authApi.logout();
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
            items.map((item) => {
              if (item.items) {
                return (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={true}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title}>
                          {(() => {
                            const IconCmp = item.icon ? IconMap[item.icon] : null;
                            return IconCmp ? <IconCmp /> : null;
                          })()}
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )
              }

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className="cursor-pointer"
                    asChild
                  >
                    <Link href={item.url}>
                      {(() => {
                        const IconCmp = item.icon ? IconMap[item.icon] : null;
                        return IconCmp ? <IconCmp /> : null;
                      })()}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })
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
