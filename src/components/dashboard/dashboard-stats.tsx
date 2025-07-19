"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Stethoscope, Plus, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { getPatientCount } from "@/lib/patients/data";
import { getHospitalCount } from "@/lib/hospitals/data";

interface DashboardStatsData {
  totalPatients: number;
  totalHospitals: number;
  activeDiagnoses: number;
  newPatientsThisMonth: number;
  patientGrowth: number;
  diagnosisGrowth: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch real data from your database
        const [patientCount, hospitalCount] = await Promise.all([
          getPatientCount(),
          getHospitalCount(),
        ]);

        // For demo purposes, generating some mock data
        // In production, you'd fetch this from your database
        const mockStats: DashboardStatsData = {
          totalPatients: patientCount,
          totalHospitals: hospitalCount,
          activeDiagnoses: Math.floor(patientCount * 0.4), // 40% of patients have active diagnoses
          newPatientsThisMonth: Math.floor(patientCount * 0.1), // 10% new this month
          patientGrowth: 12.5,
          diagnosisGrowth: 8.3,
        };

        setStats(mockStats);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        // Fallback to default stats
        setStats({
          totalPatients: 0,
          totalHospitals: 0,
          activeDiagnoses: 0,
          newPatientsThisMonth: 0,
          patientGrowth: 0,
          diagnosisGrowth: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-20 animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Loading Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">--</div>
            <p className="text-xs text-muted-foreground">Unable to load statistics</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPatients.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            +{stats.patientGrowth}% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Diagnoses</CardTitle>
          <Stethoscope className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeDiagnoses.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            +{stats.diagnosisGrowth}% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hospitals</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalHospitals}</div>
          <p className="text-xs text-muted-foreground">
            All departments active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New Patients</CardTitle>
          <Plus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.newPatientsThisMonth}</div>
          <p className="text-xs text-muted-foreground">
            This month
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 