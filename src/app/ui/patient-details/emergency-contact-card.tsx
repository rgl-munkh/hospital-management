"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Heart, Phone, Edit } from "lucide-react";
import { toast } from "sonner";
import { updatePatient } from "@/lib/patients/actions";

interface EmergencyContactCardProps {
  patientId: string;
  emergencyName?: string | null;
  emergencyRelation?: string | null;
  emergencyPhone?: string | null;
}

export function EmergencyContactCard({
  patientId,
  emergencyName,
  emergencyRelation,
  emergencyPhone,
}: EmergencyContactCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    emergencyName: emergencyName || "",
    emergencyRelation: emergencyRelation || "",
    emergencyPhone: emergencyPhone || "",
  });

  const handleSave = async () => {
    setIsSaving(true);

    console.log(patientId);
    try {
      await updatePatient(patientId, formData);
      toast.success("Emergency contact updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update emergency contact:", error);
      toast.error("Failed to update emergency contact");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      emergencyName: emergencyName || "",
      emergencyRelation: emergencyRelation || "",
      emergencyPhone: emergencyPhone || "",
    });
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Emergency Contact
          </div>
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Emergency Contact</DialogTitle>
                <DialogDescription>
                  Update the emergency contact information for this patient.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyName">Name</Label>
                  <Input
                    id="emergencyName"
                    value={formData.emergencyName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergencyName: e.target.value,
                      })
                    }
                    placeholder="Enter emergency contact name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyRelation">Relation</Label>
                  <Input
                    id="emergencyRelation"
                    value={formData.emergencyRelation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergencyRelation: e.target.value,
                      })
                    }
                    placeholder="e.g., Spouse, Parent, Sibling"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergencyPhone: e.target.value,
                      })
                    }
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Name</p>
          <p>{emergencyName || "N/A"}</p>
        </div>
        {emergencyRelation && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Relation
            </p>
            <p>{emergencyRelation}</p>
          </div>
        )}
        {emergencyPhone && (
          <div>
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Phone className="h-3 w-3" />
              Phone
            </p>
            <p>{emergencyPhone}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
