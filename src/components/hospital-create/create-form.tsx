"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import { createHospital } from "@/lib/hospitals/actions";
import { CreateHospitalState } from "@/lib/hospitals/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/form-error-message";
import { Textarea } from "@/components/ui/textarea";

const initialState: CreateHospitalState = {
  message: "",
  errors: {},
};

export function CreateForm() {
  const [state, formAction, isPending] = useActionState(
    createHospital,
    initialState
  );
  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="hospitalCode">Hospital Code *</Label>
          <Input
            id="hospitalCode"
            name="hospitalCode"
            placeholder="e.g., H001"
            className={state.errors?.hospitalCode ? "border-destructive" : ""}
          />
          <ErrorMessage error={state?.errors?.hospitalCode} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Hospital Name *</Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter hospital name"
            className={state.errors?.name ? "border-destructive" : ""}
          />
          <ErrorMessage error={state?.errors?.name} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            name="address"
            placeholder="Enter hospital address"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="Enter phone number"
              type="tel"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              placeholder="Enter email address"
              type="email"
              className={state.errors?.email ? "border-destructive" : ""}
            />
            <ErrorMessage error={state?.errors?.email} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            name="website"
            placeholder="Enter website URL"
            type="url"
            className={state.errors?.website ? "border-destructive" : ""}
          />
          <ErrorMessage error={state?.errors?.website} />
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button
          type="submit"
          disabled={isPending}
          className="min-w-[120px]"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Create Hospital
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
