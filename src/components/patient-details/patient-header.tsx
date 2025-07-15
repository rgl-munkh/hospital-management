interface PatientHeaderProps {
  firstName: string;
  lastName: string;
  patientCode: string;
}

export function PatientHeader({
  firstName,
  lastName,
  patientCode,
}: PatientHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Patient Details</h1>
        <p className="text-muted-foreground">
          {firstName} {lastName} ({patientCode})
        </p>
      </div>
    </div>
  );
}
