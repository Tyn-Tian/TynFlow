"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import useProfile from "@/hooks/use-profile";
import Image from "next/image";

const navData = {
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
      code: "Dashboard",
    },
    {
      title: "Wallet",
      url: "/wallet",
      icon: "wallet",
      code: "Wallet"
    },
    {
      title: "Transaction",
      url: "#",
      icon: "transaction",
      code: "Transaction",
      items: [
        {
          title: "List",
          url: "/transaction",
        },
        {
          title: "Scheduler",
          url: "/scheduler",
        }
      ]
    },
    {
      title: "Budget",
      url: "/budget",
      icon: "budget",
      code: "Budget"
    },
    {
      title: "Portfolio",
      url: "/portfolio",
      icon: "portfolio",
      code: "Portfolio"
    },
    {
      title: "Live",
      url: "/live",
      icon: "live",
      code: "Live"
    },
    {
      title: "Job",
      url: "/job",
      icon: "job",
      code: "Job"
    },
    {
      title: "Wishlist",
      url: "/wishlist",
      icon: "wishlist",
      code: "Wishlist"
    },
  ],
};


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data, isLoading } = useProfile();

  const profile = data?.data;

  const user = {
    name: profile?.name ?? "",
    email: profile?.email ?? "",
    avatar: "/avatars/default.png",
  };

  const navItems = navData.navMain.filter((item) => {
    if (profile?.menu.includes(item.code)) {
      return true;
    }
  });

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
                <Image src="/icon-192x192.png" alt="TynFlow" width={24} height={24} />
                <span className="text-base font-semibold">TynFlow</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} isLoading={isLoading} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} isLoading={isLoading} />
      </SidebarFooter>
    </Sidebar>
  );
}
