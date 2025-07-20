"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, Building2, FileText, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  helpText: string;
  badge?: string;
}

const quickActions: QuickAction[] = [
  {
    title: "Create New Patient",
    description: "Add a new patient to the system",
    href: "/dashboard/patients/create",
    icon: Plus,
    helpText: "Start by entering basic patient information like name, age, and contact details. You can add more detailed information later.",
  },
  {
    title: "View All Patients",
    description: "Browse and manage patient records",
    href: "/dashboard/patients",
    icon: Users,
    helpText: "Search, filter, and manage all patient records. Use the search bar to quickly find specific patients.",
  },
  {
    title: "Manage Hospitals",
    description: "Add or update hospital information",
    href: "/dashboard/hospitals",
    icon: Building2,
    helpText: "Manage hospital departments, locations, and administrative information.",
  },
  {
    title: "View Diagnoses",
    description: "Access diagnosis and treatment records",
    href: "/dashboard/diagnoses",
    icon: FileText,
    helpText: "Review patient diagnoses, treatment plans, and medical history.",
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Quick Actions
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Common tasks and shortcuts to help you navigate the system efficiently
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>
          Common tasks and shortcuts
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {quickActions.map((action) => (
          <TooltipProvider key={action.title}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={action.href}>
                  <Card className="p-4 hover:bg-muted/50 transition-colors group relative">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <action.icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                        {action.badge && (
                          <span className="absolute -top-2 -right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                            {action.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium group-hover:text-primary transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </Card>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p>{action.helpText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </CardContent>
    </Card>
  );
} 