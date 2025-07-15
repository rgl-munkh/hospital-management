"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  actionText: string;
  actionHref: string;
}

export function EmptyStateCard({ 
  title, 
  description, 
  icon: Icon, 
  actionText, 
  actionHref 
}: EmptyStateCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Icon className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>No {title.toLowerCase()} has been added yet.</p>
          <Button className="mt-4" asChild>
            <Link href={actionHref}>
              {actionText}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 