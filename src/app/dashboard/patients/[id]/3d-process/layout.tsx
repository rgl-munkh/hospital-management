"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  description?: string;
  disabled?: boolean;
}
// TODO: move this to a separate component
function ThreeDProcessNav() {
  const pathname = usePathname();
  const navItems: NavItem[] = [
    {
      href: "upload-mesh",
      label: "Upload Mesh",
      description: "Upload 3D mesh files for processing",
    },
    {
      href: "auto-correction",
      label: "Auto Correction",
      description: "Auto correct the 3D model",
    },
    {
      href: "landmark",
      label: "Landmark",
      description: "Landmark the 3D model",
    },
    {
      href: "anatomy-fixing",
      label: "Anatomy Fixing",
      description: "Anatomical fixing the 3D model",
      disabled: true,
    },
    {
      href: "auto-modeling",
      label: "Auto Modeling",
      description: "Auto model the 3D model",
    },
  ];
  return (
    <nav
      className="flex flex-col gap-4 p-6 min-w-[220px] border-r border-gray-200 bg-white h-screen"
      aria-label="3D Process Navigation"
    >
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">3D Process</h1>
        <p className="text-sm text-gray-600">
          Manage 3D model processing workflow
        </p>
      </div>

      <ul className="flex flex-col gap-1" role="list">
        {navItems.map((item) => {
          const isActive = pathname.endsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-disabled={item.disabled}
                className={cn(
                  "block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                  "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  isActive
                    ? "bg-blue-50 text-blue-700 border-l-2 border-blue-500"
                    : "text-gray-700 hover:text-gray-900",
                  item.disabled && "pointer-events-none opacity-50"
                )}
                aria-current={isActive ? "page" : undefined}
                title={item.description}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex w-full">
        <ThreeDProcessNav />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
