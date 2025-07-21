"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Pill, Image as ImageIcon, Box } from "lucide-react";
import { PersonalInfoCard } from "./personal-info-card";
import { PhysicalMeasurementsCard } from "./physical-measurements-card";
import { EmergencyContactCard } from "./emergency-contact-card";
import { MediaUploadCard } from "./media-upload-card";
import { Patient } from "@/lib/definitions";
import { StlViewCard } from "./stl-view-card";
import DiagnosisForm from "./DiagnosisForm";
import PrescriptionForm from "./PrescriptionForm";
import PrescriptionFormV2 from "./PrescriptionFormV2";

interface PatientTabsProps {
  patient: Patient;
}

export function PatientTabs({ patient }: PatientTabsProps) {
  return (
    <Tabs defaultValue="basic" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="basic" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Basic Info
        </TabsTrigger>
        <TabsTrigger value="media" className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          Media
        </TabsTrigger>
        <TabsTrigger value="diagnosis" className="flex items-center gap-2">
          <Pill className="h-4 w-4" />
          Diagnosis
        </TabsTrigger>
        <TabsTrigger value="prescription" className="flex items-center gap-2">
          <Pill className="h-4 w-4" />
          Prescription
        </TabsTrigger>
        <TabsTrigger value="model" className="flex items-center gap-2">
          <Box className="h-4 w-4" />
          3D Scan review
        </TabsTrigger>
      </TabsList>

      {/* Basic Information Tab */}
      <TabsContent value="basic" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PersonalInfoCard
            patientId={patient.id}
            patientCode={patient.patientCode}
            firstName={patient.firstName}
            lastName={patient.lastName}
            age={patient.age}
            gender={patient.gender}
            address={patient.address}
          />
          <PhysicalMeasurementsCard
            patientId={patient.id}
            heightCm={patient.heightCm}
            weightKg={patient.weightKg}
            shoeSize={patient.shoeSize}
          />
          <EmergencyContactCard
            patientId={patient.id}
            emergencyName={patient.emergencyName}
            emergencyRelation={patient.emergencyRelation}
            emergencyPhone={patient.emergencyPhone}
          />
        </div>
      </TabsContent>

      {/* Diagnosis Tab */}
      <TabsContent value="diagnosis" className="space-y-6">
        <DiagnosisForm patientId={patient.id} initialData={{}} />
      </TabsContent>

      {/* Prescription Tab */}
      <TabsContent value="prescription" className="space-y-6">
        {/* <PrescriptionForm patientId={patient.id} /> */}
        <PrescriptionFormV2 patientId={patient.id} patient={patient} />
      </TabsContent>

      {/* Media Tab */}
      <TabsContent value="media" className="space-y-6">
        <MediaUploadCard patientId={patient.id} />
      </TabsContent>

      {/* STL Model Tab */}
      <TabsContent value="model" className="space-y-6">
        <StlViewCard patientId={patient.id} />
      </TabsContent>
    </Tabs>
  );
}
