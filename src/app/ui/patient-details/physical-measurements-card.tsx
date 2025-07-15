"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Ruler, Weight, Footprints, Edit } from "lucide-react";
import { updatePatient } from "@/lib/patients/actions";
import { toast } from "sonner";

interface PhysicalMeasurementsCardProps {
  patientId: string;
  heightCm?: number | null;
  weightKg?: number | null;
  shoeSize?: string | null;
}

export function PhysicalMeasurementsCard({ 
  patientId,
  heightCm, 
  weightKg, 
  shoeSize 
}: PhysicalMeasurementsCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    heightCm: heightCm?.toString() || "",
    weightKg: weightKg?.toString() || "",
    shoeSize: shoeSize || "",
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePatient(patientId, {
        heightCm: formData.heightCm ? parseInt(formData.heightCm) : undefined,
        weightKg: formData.weightKg ? parseInt(formData.weightKg) : undefined,
        shoeSize: formData.shoeSize || undefined,
      });
      toast.success("Physical measurements updated successfully");
      setIsOpen(false);
    } catch {
      toast.error("Failed to update physical measurements");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Physical Measurements
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
                <DialogTitle>Edit Physical Measurements</DialogTitle>
                <DialogDescription>
                  Update the patient&apos;s physical measurements. Click save when you&apos;re done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="heightCm" className="text-right">
                    Height (cm)
                  </Label>
                  <Input
                    id="heightCm"
                    type="number"
                    value={formData.heightCm}
                    onChange={(e) =>
                      setFormData({ ...formData, heightCm: e.target.value })
                    }
                    className="col-span-3"
                    placeholder="e.g., 175"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="weightKg" className="text-right">
                    Weight (kg)
                  </Label>
                  <Input
                    id="weightKg"
                    type="number"
                    value={formData.weightKg}
                    onChange={(e) =>
                      setFormData({ ...formData, weightKg: e.target.value })
                    }
                    className="col-span-3"
                    placeholder="e.g., 70"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="shoeSize" className="text-right">
                    Shoe Size
                  </Label>
                  <Input
                    id="shoeSize"
                    value={formData.shoeSize}
                    onChange={(e) =>
                      setFormData({ ...formData, shoeSize: e.target.value })
                    }
                    className="col-span-3"
                    placeholder="e.g., 42"
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
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Ruler className="h-3 w-3" />
              Height
            </p>
            <p>{heightCm ? `${heightCm} cm` : "N/A"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Weight className="h-3 w-3" />
              Weight
            </p>
            <p>{weightKg ? `${weightKg} kg` : "N/A"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Footprints className="h-3 w-3" />
              Shoe Size
            </p>
            <p>{shoeSize || "N/A"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 