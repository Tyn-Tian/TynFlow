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
      url: "#",
      icon: "transaction",
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
    },
    {
      title: "Portfolio",
      url: "/portfolio",
      icon: "portfolio",
    },
    {
      title: "Live",
      url: "/live",
      icon: "live",
    },
    {
      title: "Job",
      url: "/job",
      icon: "job",
    },
  ],
};

const LIVE_NAV_USER_ID = "8017eb2d-1c88-4e83-ba13-80ce15477154";
const JOB_NAV_USER_ID = "d4e69f3b-c49e-4b65-ad03-50f6cb803571";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: profile, isLoading } = useProfile();

  const user = {
    name: profile?.name ?? "",
    email: profile?.email ?? "",
    avatar: "/avatars/default.png",
  };

  const navItems = data.navMain.filter((item) => {
    if (item.icon !== "live" && item.icon !== "job") {
      return true;
    }

    if (item.icon === "live") {
      return profile?.userId === LIVE_NAV_USER_ID;
    }

    if (item.icon === "job") {
      return profile?.userId === JOB_NAV_USER_ID;
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
