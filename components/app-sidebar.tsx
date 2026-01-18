"use client"

import * as React from "react"
import {
  IconChartBar,
  IconDashboard,
  IconCreditCard,
  IconFolder,
  IconFileInvoice,
  IconSettings,
} from "@tabler/icons-react"

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
import { useAuth } from "@/hooks/use-auth"
import { LogoIcon } from "@/components/logo"

const data = {
  navMain: [
    {
      title: "Tableau de bord",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Mes Projets",
      url: "/dashboard/projects",
      icon: IconFolder,
    },
    {
      title: "Mes Factures",
      url: "/dashboard/invoices",
      icon: IconFileInvoice,
    },
    {
      title: "Statistiques",
      url: "/dashboard/analytics",
      icon: IconChartBar,
    },
    {
      title: "Plans d'abonnement",
      url: "/pricing",
      icon: IconCreditCard,
    },
    {
      title: "Parametres",
      url: "/dashboard/settings",
      icon: IconSettings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  const userData = {
    name: user ? `${user.firstname} ${user.lastname}` : "Utilisateur",
    email: user?.email || "",
    avatar: "/avatars/shadcn.jpg",
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-2 hover:bg-sidebar-accent"
            >
              <a href="/dashboard" className="flex items-center gap-2.5">
                <LogoIcon className="!size-7" />
                <span className="text-base font-bold gradient-text">CloudStorage</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
