"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, FileText, Stethoscope, Clock, Activity } from "lucide-react";
import { useEffect, useState } from "react";

interface ActivityItem {
  id: string;
  type: "patient_added" | "diagnosis_updated" | "prescription_renewed" | "scan_uploaded";
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Mock activity data - in production, this would come from your database
const mockActivities: ActivityItem[] = [
  {
    id: "1",
    type: "patient_added",
    title: "New patient added",
    description: "John Doe - Patient #P-2024-001",
    timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    user: "Dr. Smith",
    color: "bg-green-500",
    icon: UserPlus,
  },
  {
    id: "2",
    type: "diagnosis_updated",
    title: "Diagnosis updated",
    description: "Jane Smith - Orthopedic consultation",
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    user: "Dr. Johnson",
    color: "bg-blue-500",
    icon: Stethoscope,
  },
  {
    id: "3",
    type: "scan_uploaded",
    title: "3D scan uploaded",
    description: "Mike Johnson - STL model processed",
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    user: "Dr. Williams",
    color: "bg-purple-500",
    icon: FileText,
  },
  {
    id: "4",
    type: "prescription_renewed",
    title: "Prescription renewed",
    description: "Sarah Wilson - Medication refill",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    user: "Dr. Brown",
    color: "bg-yellow-500",
    icon: FileText,
  },
];

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchActivities = async () => {
      // In production, this would be a real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setActivities(mockActivities);
      setLoading(false);
    };

    fetchActivities();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates and changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest updates and changes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 group">
                <div className={`w-2 h-2 rounded-full mt-2 ${activity.color}`}></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <activity.icon className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                    {activity.user && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground">{activity.user}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {activities.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <button className="text-xs text-primary hover:underline transition-colors">
              View all activity →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 