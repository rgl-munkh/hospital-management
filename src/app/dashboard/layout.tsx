import { DashboardSidebar } from "@/app/ui/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarProvider>
        <DashboardSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarProvider>
    </div>
  );
}
