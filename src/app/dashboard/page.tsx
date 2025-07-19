import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { DashboardSkeleton } from "@/components/skeletons";

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the Hospital Management System
        </p>
      </div>

      {/* Real-time Statistics */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardStats />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <QuickActions />
        
        {/* Recent Activity */}
        <Suspense fallback={<RecentActivitySkeleton />}>
          <RecentActivity />
        </Suspense>
      </div>
    </div>
  );
}

function RecentActivitySkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates and changes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-100 rounded w-3/4 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 