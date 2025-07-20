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
        <h1 className="text-2xl font-bold flex items-center gap-2">
          {firstName} {lastName}
          <p className="text-muted-foreground text-sm">({patientCode})</p>
        </h1>
      </div>
    </div>
  );
}
