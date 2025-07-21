import React, { useState, useEffect } from "react";
import { getPrescriptionByPatientId, getDiagnosisByPrescriptionId, createDiagnosis, updateDiagnosis } from "@/lib/prescriptions/actions";
import AiChatForm from "./AiChatForm";
import { Patient, Prescription, Diagnosis } from "@/lib/definitions";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { CheckCircle2Icon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface PrescriptionFormProps {
  patientId: string;
  patient: Patient;
}

// Configurable AFO Parameters structure
interface AFOParameterOption {
  value: string;
  label: string;
  description?: string;
  image?: string;
}

interface AFOParameterSection {
  key: keyof AFOParameters;
  title: string;
  description?: string;
  options: AFOParameterOption[];
  gridCols?: number;
  showImages?: boolean;
}

interface AFOParameters {
  orthoticType: string;
  ankleAngle: string;
  footplateLength: string;
  footplateThickness: string;
  posteriorShellHeight: string;
  anteriorShell: string;
  medialLateralTrimlines: string;
  calfBandHeight: string;
  heelWedge: string;
  notes: string;
}

// Configurable AFO Parameters Configuration
const AFO_PARAMETERS_CONFIG: AFOParameterSection[] = [
  {
    key: "orthoticType",
    title: "Orthotic Type",
    description: "Select the type of ankle-foot orthosis",
    options: [
      { 
        value: "solid", 
        label: "Solid AFO", 
        description: "Rigid ankle-foot orthosis for maximum stability",
        image: "/orthotic-types/solid.png"
      },
      { 
        value: "solid-2", 
        label: "Solid AFO (Alternative)", 
        description: "Alternative solid design",
        image: "/orthotic-types/solid-2.png"
      },
      { 
        value: "hinge", 
        label: "Hinged AFO", 
        description: "Allows controlled ankle movement",
        image: "/orthotic-types/hinge.png"
      },
      { 
        value: "anterior-shell", 
        label: "Anterior Shell AFO", 
        description: "Front shell design for specific conditions",
        image: "/orthotic-types/anterior-shell.png"
      },
      { 
        value: "smo", 
        label: "SMO (Supramalleolar Orthosis)", 
        description: "Short orthosis for mild conditions",
        image: "/orthotic-types/smo.png"
      },
    ],
    gridCols: 2,
    showImages: true,
  },
  {
    key: "ankleAngle",
    title: "Ankle Angle",
    description: "Dorsiflexion angle for optimal gait",
    options: [
      { value: "0° dorsiflexion", label: "0° dorsiflexion" },
      { value: "+1° dorsiflexion", label: "+1° dorsiflexion" },
      { value: "+2° dorsiflexion", label: "+2° dorsiflexion" },
      { value: "+3° dorsiflexion", label: "+3° dorsiflexion" },
    ],
    gridCols: 3,
  },
  {
    key: "footplateLength",
    title: "Footplate Length",
    description: "Length of the footplate",
    options: [
      { value: "Full length (toes + 5mm)", label: "Full length (toes + 5mm)" },
      { value: "Standard length", label: "Standard length" },
      { value: "Short length", label: "Short length" },
    ],
  },
  {
    key: "footplateThickness",
    title: "Footplate Thickness",
    description: "Material and thickness specification",
    options: [
      { value: "3mm (rigid)", label: "3mm (rigid)" },
      { value: "4mm (rigid)", label: "4mm (rigid)" },
      { value: "Carbon-fiber", label: "Carbon-fiber" },
      { value: "Polypropylene", label: "Polypropylene" },
    ],
  },
  {
    key: "posteriorShellHeight",
    title: "Posterior Shell Height",
    description: "Height relative to fibular head",
    options: [
      { value: "Just below fibular head (~2cm gap)", label: "Just below fibular head (~2cm gap)" },
      { value: "At fibular head", label: "At fibular head" },
      { value: "Above fibular head", label: "Above fibular head" },
    ],
  },
  {
    key: "anteriorShell",
    title: "Anterior Shell",
    description: "Position on tibia",
    options: [
      { value: "Mid third of tibia", label: "Mid third of tibia" },
      { value: "Upper third of tibia", label: "Upper third of tibia" },
      { value: "Lower third of tibia", label: "Lower third of tibia" },
    ],
  },
  {
    key: "medialLateralTrimlines",
    title: "Medial-Lateral Trimlines",
    description: "Position relative to malleoli",
    options: [
      { value: "Anterior to malleoli (ML control)", label: "Anterior to malleoli (ML control)" },
      { value: "At malleoli", label: "At malleoli" },
      { value: "Posterior to malleoli", label: "Posterior to malleoli" },
    ],
  },
  {
    key: "calfBandHeight",
    title: "Calf Band Height",
    description: "Position on tibia",
    options: [
      { value: "Proximal third of tibia", label: "Proximal third of tibia" },
      { value: "Mid third of tibia", label: "Mid third of tibia" },
      { value: "Lower third of tibia", label: "Lower third of tibia" },
    ],
  },
  {
    key: "heelWedge",
    title: "Heel Wedge",
    description: "Wedge configuration for alignment",
    options: [
      { value: "No wedge", label: "No wedge" },
      { value: "3° medial post", label: "3° medial post" },
      { value: "5° medial post", label: "5° medial post" },
      { value: "3° lateral post", label: "3° lateral post" },
      { value: "5° lateral post", label: "5° lateral post" },
    ],
    gridCols: 4,
  },
];

export default function PrescriptionForm({ patientId, patient }: PrescriptionFormProps) {
  const [prescriptionId, setPrescriptionId] = useState<string | null>(null);
  const [diagnosisId, setDiagnosisId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [showChat, setShowChat] = useState(false);

  // AFO Parameters state
  const [afoParams, setAfoParams] = useState<AFOParameters>({
    orthoticType: "",
    ankleAngle: "",
    footplateLength: "",
    footplateThickness: "",
    posteriorShellHeight: "",
    anteriorShell: "",
    medialLateralTrimlines: "",
    calfBandHeight: "",
    heelWedge: "",
    notes: "",
  });

  useEffect(() => {
    async function fetchData() {
      const prescription = await getPrescriptionByPatientId(patientId);
      setPrescription(prescription);
      if (prescription) {
        setPrescriptionId(prescription.id);
        const diagnosis = await getDiagnosisByPrescriptionId(prescription.id);
        setDiagnosis(diagnosis);
        if (diagnosis) {
          setDiagnosisId(diagnosis.id);
          // Parse existing AFO parameters from description if available
          try {
            const existingParams = JSON.parse(diagnosis.description || "{}");
            setAfoParams({
              orthoticType: existingParams.orthoticType || "",
              ankleAngle: existingParams.ankleAngle || "",
              footplateLength: existingParams.footplateLength || "",
              footplateThickness: existingParams.footplateThickness || "",
              posteriorShellHeight: existingParams.posteriorShellHeight || "",
              anteriorShell: existingParams.anteriorShell || "",
              medialLateralTrimlines: existingParams.medialLateralTrimlines || "",
              calfBandHeight: existingParams.calfBandHeight || "",
              heelWedge: existingParams.heelWedge || "",
              notes: existingParams.notes || "",
            });
          } catch {
            // If parsing fails, use empty values
          }
        }
      }
    }
    fetchData();
  }, [patientId]);

  const handleSave = async () => {
    if (!prescriptionId) {
      toast.error("No prescription found for this patient. Please fill the Diagnosis tab first.");
      return;
    }
    setSaving(true);
    try {
      const afoDescription = JSON.stringify(afoParams);
      
      if (diagnosisId) {
        await updateDiagnosis(diagnosisId, {
          prescriptionId,
          diagnosisType: "AFO Parameters",
          description: afoDescription,
          gmfcsLevel: "",
          recommendation: "Custom AFO",
        });
        setSaving(false);
        toast.success("AFO parameters updated!");
      } else {
        const created = await createDiagnosis({
          prescriptionId,
          diagnosisType: "AFO Parameters",
          description: afoDescription,
          gmfcsLevel: "",
          recommendation: "Custom AFO",
        });
        setDiagnosisId(created.id);
        setSaving(false);
        toast.success("AFO parameters saved!");
      }
    } catch {
      setSaving(false);
      toast.error("Failed to save AFO parameters. Please try again.");
    }
  };

  const updateAfoParam = (key: keyof AFOParameters, value: string) => {
    setAfoParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const renderParameterSection = (section: AFOParameterSection) => {
    const currentValue = afoParams[section.key];
    const gridCols = section.gridCols || 3;

    return (
      <div key={section.key} className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-2">{section.title}</h2>
        {section.description && (
          <p className="text-sm text-gray-600 mb-4">{section.description}</p>
        )}
        <div className={`grid grid-cols-1 md:grid-cols-${gridCols} gap-4`}>
          {section.options.map((option) => (
            <div
              key={option.value}
              className={`border rounded-lg p-4 cursor-pointer transition-all duration-150 flex flex-col items-center gap-3
                ${currentValue === option.value ? "border-brand-500 bg-brand-50 shadow" : "border-gray-200 bg-white"}
                hover:shadow-md`}
              onClick={() => updateAfoParam(section.key, option.value)}
            >
              {section.showImages && option.image && (
                <div className="relative w-full h-32 mb-2">
                  <Image
                    src={option.image}
                    alt={option.label}
                    fill
                    className="object-contain rounded"
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                {currentValue === option.value && (
                  <CheckCircle2Icon className="text-brand-500" size={16} />
                )}
                <span className="font-medium text-center">{option.label}</span>
              </div>
              {option.description && (
                <p className="text-xs text-gray-500 text-center">{option.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="md:w-2/3 w-full">
        <form className="space-y-8" onSubmit={e => { e.preventDefault(); handleSave(); }}>
          {/* Render all parameter sections from config */}
          {AFO_PARAMETERS_CONFIG.map(renderParameterSection)}

          {/* Notes Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Additional Notes & Specifications</h2>
            <Textarea
              value={afoParams.notes}
              onChange={(e) => updateAfoParam("notes", e.target.value)}
              className="w-full min-h-[80px] border-gray-300 rounded"
              placeholder="Add any additional notes, measurements, or special requirements..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end sticky bottom-0 bg-gradient-to-t from-white pt-4 pb-2 z-10">
            <Button type="submit" disabled={saving} className="w-[140px]">
              {saving ? "Saving..." : diagnosisId ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </div>
      <div className="md:w-1/3 w-full flex flex-col items-center justify-start">
        {!showChat ? (
          <Button
            className="bg-blue-600 text-white px-6 py-3 rounded shadow mt-4 md:mt-0"
            onClick={() => setShowChat(true)}
          >
            Chat with AI
          </Button>
        ) : (
          <AiChatForm patient={patient} diagnosis={diagnosis} prescription={prescription} startOnMount />
        )}
      </div>
    </div>
  );
} 