"use client";

import Image from "next/image";
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
} from "@/components/ui/sidebar";
import { Users, Building2, Stethoscope, Home } from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Overview and key metrics",
  },
  {
    name: "Patients",
    href: "/dashboard/patients",
    icon: Users,
    description: "Manage patient records",
  },
  {
    name: "Hospitals",
    href: "/dashboard/hospitals",
    icon: Building2,
    description: "Hospital and department management",
  },
  {
    name: "Diagnoses",
    href: "/dashboard/diagnoses",
    icon: Stethoscope,
    description: "Medical diagnoses and treatments",
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-2 px-2">
          <Image
            priority
            src="/logo.png"
            alt="Hospital Management System Logo"
            width={120}
            height={120}
            className="h-8 w-auto"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.endsWith(item.href + "/");
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      aria-label={`Navigate to ${item.name} - ${item.description}`}
                      title={item.description}
                      className=""
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" aria-hidden="true" />
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
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background font-bold shadow-sm"
            aria-label="System status indicator"
          >
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
