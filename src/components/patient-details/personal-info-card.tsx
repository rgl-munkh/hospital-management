"use client";

import { useState } from "react";
import { useActionState } from "react";
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
import { updatePatient, UpdatePatientState } from "@/lib/patients";
import { ErrorMessage } from "@/components/form-error-message";
import { useEffect } from "react";
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

const PersonalInfoForm = ({
  patientId,
  patientCode,
  firstName,
  lastName,
  age,
  gender,
  address,
}: PersonalInfoCardProps) => {
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
          <DialogTitle>Edit Personal Information</DialogTitle>
          <DialogDescription>
            Update the patient&apos;s personal details. Click save when
            you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="patientCode" className="text-right">
                Patient Code
              </Label>
              <Input
                id="patientCode"
                name="patientCode"
                defaultValue={patientCode}
                className={`col-span-3 ${
                  state.errors?.patientCode ? "border-destructive" : ""
                }`}
              />
              <div className="col-span-4">
                <ErrorMessage error={state?.errors?.patientCode} />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right">
                First Name
              </Label>
              <Input
                id="firstName"
                name="firstName"
                defaultValue={firstName}
                className={`col-span-3 ${
                  state.errors?.firstName ? "border-destructive" : ""
                }`}
              />
              <div className="col-span-4">
                <ErrorMessage error={state?.errors?.firstName} />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right">
                Last Name
              </Label>
              <Input
                id="lastName"
                name="lastName"
                defaultValue={lastName}
                className={`col-span-3 ${
                  state.errors?.lastName ? "border-destructive" : ""
                }`}
              />
              <div className="col-span-4">
                <ErrorMessage error={state?.errors?.lastName} />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="age" className="text-right">
                Age
              </Label>
              <Input
                id="age"
                name="age"
                type="number"
                defaultValue={age?.toString() || ""}
                className={`col-span-3 ${
                  state.errors?.age ? "border-destructive" : ""
                }`}
              />
              <div className="col-span-4">
                <ErrorMessage error={state?.errors?.age} />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gender" className="text-right">
                Gender
              </Label>
              <Select name="gender" defaultValue={gender || ""}>
                <SelectTrigger
                  className={`col-span-3 ${
                    state.errors?.gender ? "border-destructive" : ""
                  }`}
                >
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <div className="col-span-4">
                <ErrorMessage error={state?.errors?.gender} />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input
                id="address"
                name="address"
                defaultValue={address || ""}
                className={`col-span-3 ${
                  state.errors?.address ? "border-destructive" : ""
                }`}
              />
              <div className="col-span-4">
                <ErrorMessage error={state?.errors?.address} />
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
              className="cursor-pointer"
            >
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const initialState: UpdatePatientState = {
  message: "",
  errors: {},
};

export function PersonalInfoCard({
  patientId,
  patientCode,
  firstName,
  lastName,
  age,
  gender,
  address,
}: PersonalInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <PersonalInfoForm
            patientId={patientId}
            patientCode={patientCode}
            firstName={firstName}
            lastName={lastName}
            age={age}
            gender={gender}
            address={address}
          />
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
