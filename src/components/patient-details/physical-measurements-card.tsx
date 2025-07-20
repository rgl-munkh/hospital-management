"use client";

import { useState } from "react";
import { useActionState } from "react";
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
import { Ruler, Weight, Footprints, Edit } from "lucide-react";
import { updatePatient, UpdatePatientState } from "@/lib/patients";
import { ErrorMessage } from "@/components/form-error-message";
import { useEffect } from "react";
import { toast } from "sonner";

interface PhysicalMeasurementsCardProps {
  patientId: string;
  heightCm?: number | null;
  weightKg?: number | null;
  shoeSize?: string | null;
}

const initialState: UpdatePatientState = {
  message: "",
  errors: {},
};

const PhysicalMeasurementsForm = ({
  patientId,
  heightCm,
  weightKg,
  shoeSize,
}: PhysicalMeasurementsCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (prevState: UpdatePatientState, formData: FormData) => {
      formData.append("id", patientId);
      return await updatePatient(prevState, formData);
    },
    initialState
  );

  useEffect(() => {
    if (state.success) {
      setIsOpen(false);
      toast.success(state.message);
      return;
    }
  }, [state.success, state.message]);

  return (
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
            Update the patient&apos;s physical measurements. Click save when
            you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="heightCm" className="text-right">
                Height (cm)
              </Label>
              <Input
                id="heightCm"
                name="heightCm"
                type="number"
                defaultValue={heightCm?.toString() || ""}
                className={`col-span-3 ${
                  state.errors?.heightCm ? "border-destructive" : ""
                }`}
                placeholder="e.g., 175"
              />
              <div className="col-span-4">
                <ErrorMessage error={state?.errors?.heightCm} />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="weightKg" className="text-right">
                Weight (kg)
              </Label>
              <Input
                id="weightKg"
                name="weightKg"
                type="number"
                defaultValue={weightKg?.toString() || ""}
                className={`col-span-3 ${
                  state.errors?.weightKg ? "border-destructive" : ""
                }`}
                placeholder="e.g., 70"
              />
              <div className="col-span-4">
                <ErrorMessage error={state?.errors?.weightKg} />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shoeSize" className="text-right">
                Shoe Size
              </Label>
              <Input
                id="shoeSize"
                name="shoeSize"
                defaultValue={shoeSize || ""}
                className={`col-span-3 ${
                  state.errors?.shoeSize ? "border-destructive" : ""
                }`}
                placeholder="e.g., 42"
              />
              <div className="col-span-4">
                <ErrorMessage error={state?.errors?.shoeSize} />
              </div>
            </div>
          </div>

          {state.message && !state.success && (
            <p className="text-destructive text-sm">{state.message}</p>
          )}

          <DialogFooter>
            <Button
              type="submit"
              disabled={isPending}
              className=""
            >
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export function PhysicalMeasurementsCard({
  patientId,
  heightCm,
  weightKg,
  shoeSize,
}: PhysicalMeasurementsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Physical Measurements
          </CardTitle>
          <PhysicalMeasurementsForm
            patientId={patientId}
            heightCm={heightCm}
            weightKg={weightKg}
            shoeSize={shoeSize}
          />
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
