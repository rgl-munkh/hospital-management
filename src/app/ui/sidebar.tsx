"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Users, Building2, Stethoscope, Home } from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Patients",
    href: "/dashboard/patients",
    icon: Users,
  },
  {
    name: "Hospital",
    href: "/dashboard/hospital",
    icon: Building2,
  },
  {
    name: "Diagnoses",
    href: "/dashboard/diagnoses",
    icon: Stethoscope,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border p-4">
        <SidebarTrigger className="-me-1" />
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg border bg-background font-bold shadow-sm">
            H
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Hospital</span>
            <span className="truncate text-xs">Management</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive}>
                                              <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span className="truncate font-semibold">
                            {item.name}
                          </span>
                        </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border p-4">
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background font-bold shadow-sm">
            H
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Hospital</span>
            <span className="truncate text-xs">Management System</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}