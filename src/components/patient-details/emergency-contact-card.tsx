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
import { Heart, Phone, Edit } from "lucide-react";
import { updatePatient, UpdatePatientState } from "@/lib/patients";
import { ErrorMessage } from "@/components/form-error-message";
import { useEffect } from "react";
import { toast } from "sonner";

interface EmergencyContactCardProps {
  patientId: string;
  emergencyName?: string | null;
  emergencyRelation?: string | null;
  emergencyPhone?: string | null;
}

const initialState: UpdatePatientState = {
  message: "",
  errors: {},
};

const EmergencyContactForm = ({
  patientId,
  emergencyName,
  emergencyRelation,
  emergencyPhone,
}: EmergencyContactCardProps) => {
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
          <DialogTitle>Edit Emergency Contact</DialogTitle>
          <DialogDescription>
            Update the emergency contact information for this patient.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="emergencyName" className="text-right">
                Name
              </Label>
              <Input
                id="emergencyName"
                name="emergencyName"
                defaultValue={emergencyName || ""}
                className={`col-span-3 ${
                  state.errors?.emergencyName ? "border-destructive" : ""
                }`}
                placeholder="Enter emergency contact name"
              />
              <div className="col-span-4">
                <ErrorMessage error={state?.errors?.emergencyName} />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="emergencyRelation" className="text-right">
                Relation
              </Label>
              <Input
                id="emergencyRelation"
                name="emergencyRelation"
                defaultValue={emergencyRelation || ""}
                className={`col-span-3 ${
                  state.errors?.emergencyRelation ? "border-destructive" : ""
                }`}
                placeholder="e.g., Spouse, Parent, Sibling"
              />
              <div className="col-span-4">
                <ErrorMessage error={state?.errors?.emergencyRelation} />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="emergencyPhone" className="text-right">
                Phone
              </Label>
              <Input
                id="emergencyPhone"
                name="emergencyPhone"
                defaultValue={emergencyPhone || ""}
                className={`col-span-3 ${
                  state.errors?.emergencyPhone ? "border-destructive" : ""
                }`}
                placeholder="Enter phone number"
              />
              <div className="col-span-4">
                <ErrorMessage error={state?.errors?.emergencyPhone} />
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

export function EmergencyContactCard({
  patientId,
  emergencyName,
  emergencyRelation,
  emergencyPhone,
}: EmergencyContactCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Emergency Contact
          </CardTitle>
          <EmergencyContactForm
            patientId={patientId}
            emergencyName={emergencyName}
            emergencyRelation={emergencyRelation}
            emergencyPhone={emergencyPhone}
          />
        </div>
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
