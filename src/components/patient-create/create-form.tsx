"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import { createPatient, CreatePatientState } from "@/lib/patients/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/form-error-message";

const initialState: CreatePatientState = {
  message: "",
  errors: {},
};

export function CreateForm() {
  const [state, formAction, isPending] = useActionState(
    createPatient,
    initialState
  );
  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="patientCode">Patient Code *</Label>
          <Input
            id="patientCode"
            name="patientCode"
            placeholder="e.g., P001"
            className={state.errors?.patientCode ? "border-destructive" : ""}
          />
          <ErrorMessage error={state?.errors?.patientCode} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="Enter first name"
              className={state.errors?.firstName ? "border-destructive" : ""}
            />
            <ErrorMessage error={state?.errors?.firstName} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Enter last name"
              className={state.errors?.lastName ? "border-destructive" : ""}
            />
            <ErrorMessage error={state?.errors?.lastName} />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button
          type="submit"
          disabled={isPending}
          className="min-w-[120px] cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Create Patient
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
