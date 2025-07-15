"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User, MapPin, Edit } from "lucide-react";
import { updatePatient } from "@/lib/patients/actions";
import { toast } from "sonner";

interface PersonalInfoCardProps {
  patientId: string;
  patientCode: string;
  firstName: string;
  lastName: string;
  age?: number | null;
  gender?: string | null;
  address?: string | null;
}

export function PersonalInfoCard({
  patientId,
  patientCode,
  firstName,
  lastName,
  age,
  gender,
  address,
}: PersonalInfoCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    patientCode,
    firstName,
    lastName,
    age: age?.toString() || "",
    gender: gender || "",
    address: address || "",
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePatient(patientId, {
        patientCode: formData.patientCode,
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender || undefined,
        address: formData.address || undefined,
      });
      toast.success("Personal information updated successfully");
      setIsOpen(false);
    } catch {
      toast.error("Failed to update personal information");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Personal Information</DialogTitle>
                <DialogDescription>
                  Update the patient&apos;s personal details. Click save when you&apos;re done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="patientCode" className="text-right">
                    Patient Code
                  </Label>
                  <Input
                    id="patientCode"
                    value={formData.patientCode}
                    onChange={(e) =>
                      setFormData({ ...formData, patientCode: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="firstName" className="text-right">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lastName" className="text-right">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="age" className="text-right">
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="gender" className="text-right">
                    Gender
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      setFormData({ ...formData, gender: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Patient Code
            </p>
            <p className="font-medium">{patientCode}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Full Name
            </p>
            <p className="font-medium">
              {firstName} {lastName}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Age</p>
            <Badge variant="secondary">{age || "N/A"}</Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Gender</p>
            <p>{gender || "N/A"}</p>
          </div>
        </div>

        {address && (
          <div>
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Address
            </p>
            <p>{address}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
