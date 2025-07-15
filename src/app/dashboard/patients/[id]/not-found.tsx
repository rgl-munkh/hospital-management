import { Breadcrumb } from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";

export default function PatientNotFound() {
  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto p-6">
      <Breadcrumb
        paths={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Patients", href: "/dashboard/patients" },
          { label: "Patient Not Found", href: "/dashboard/patients/not-found" },
        ]}
      />

      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Patient Not Found</CardTitle>
          <CardDescription>
            The patient you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              This could happen if:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• The patient ID is incorrect</li>
              <li>• The patient has been deleted</li>
              <li>• The URL has been mistyped</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button variant="outline" asChild className="flex-1">
              <Link href="/dashboard/patients">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Patients
              </Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/dashboard/patients">
                <Search className="mr-2 h-4 w-4" />
                Browse Patients
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
