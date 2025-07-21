import React, { useState } from "react";
import { createPrescription } from "@/lib/prescriptions/actions";
import {
  getPrescriptionByPatientId,
  updatePrescription,
} from "@/lib/prescriptions/actions";
import { useEffect } from "react";
import Image from "next/image";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { CheckCircle2Icon } from "lucide-react";
import { toast } from "sonner";

const GMFCS_LEVELS = [
  {
    level: "Level I",
    description: "Walks without limitations.",
    implications:
      "Lightweight, flexible AFO; possibly dynamic or hinged AFO to allow ankle motion.",
    image: "/gmfcs-levels/level-1.png",
  },
  {
    level: "Level II",
    description: "Walks with limitations (e.g., uneven terrain, stair).",
    implications:
      "May need more stability—posterior leaf spring or articulated AFO depending on strength/spasticity.",
    image: "/gmfcs-levels/level-2.png",
  },
  {
    level: "Level III",
    description: "Walks with assistive device.",
    implications:
      "Solid or GRAFO for max stability; consider anterior shell for weak plantarflexors.",
    image: "/gmfcs-levels/level-3.png",
  },
  {
    level: "Level IV",
    description: "Limited self-mobility, powered mobility.",
    implications:
      "Custom molded solid AFO with strong support; foot positioning and tone control prioritized.",
    image: "/gmfcs-levels/level-4.png",
  },
  {
    level: "Level V",
    description: "Transported in manual wheelchair.",
    implications:
      "Focus on positioning, tone management, and comfort; possibly orthotic for non-ambulatory use.",
    image: "/gmfcs-levels/level-5.png",
  },
];

const DIAGNOSIS_OPTIONS = [
  {
    category: "Cerebral Palsy",
    subtypes: [
      {
        name: "Ankle Dorsiflexion Hypotonia",
        recommendations: ["Solid AFO", "Hinged AFO with controlled hinge"],
      },
      {
        name: "Ankle Dorsiflexion Hypertonia",
        recommendations: [
          "Anterior shell solid",
          "Anterior shell with strong joint",
        ],
      },
      {
        name: "Ankle Plantarflexion Hypotonia",
        recommendations: ["Anterior shell", "Anterior shell with strong joint"],
      },
      {
        name: "Ankle Plantarflexion Hypertonia",
        recommendations: ["Solid AFO", "AFO with controlled hinge"],
      },
    ],
  },
  {
    category: "Stroke",
    subtypes: [
      {
        name: "Ankle Dorsiflexion Hypotonia",
        recommendations: ["Solid AFO", "Hinged AFO with controlled hinge"],
      },
      {
        name: "Ankle Dorsiflexion Hypertonia",
        recommendations: ["Anterior shell", "Anterior shell with strong joint"],
      },
      {
        name: "Ankle Plantarflexion Hypotonia",
        recommendations: ["Anterior shell", "Anterior shell with strong joint"],
      },
      {
        name: "Ankle Plantarflexion Hypertonia",
        recommendations: ["Solid AFO", "AFO with controlled hinge"],
      },
    ],
  },
  {
    category: "After operation",
    subtypes: [
      {
        name: "Drop foot",
        recommendations: ["Solid AFO"],
      },
    ],
  },
];

interface DiagnosisData {
  gmfcsLevel: string;
  diagnosisCategory: string;
  diagnosisSubtype: string;
  notes: string;
}

interface DiagnosisFormProps {
  initialData: Partial<DiagnosisData>;
  onSave?: (data: DiagnosisData) => void;
  patientId: string;
  createdBy?: string;
}

export default function DiagnosisForm({
  initialData,
  onSave,
  patientId,
  createdBy,
}: DiagnosisFormProps) {
  const [gmfcsLevel, setGmfcsLevel] = useState(initialData?.gmfcsLevel || "");
  const [diagnosisCategory, setDiagnosisCategory] = useState(
    initialData?.diagnosisCategory || ""
  );
  const [diagnosisSubtype, setDiagnosisSubtype] = useState(
    initialData?.diagnosisSubtype || ""
  );
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [saving, setSaving] = useState(false);
  const [prescriptionId, setPrescriptionId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrescription() {
      const data = await getPrescriptionByPatientId(patientId);
      if (data) {
        setPrescriptionId(data.id);
        setGmfcsLevel(data.diagnosisSummary?.split(" - ")[0] || "");
        setDiagnosisCategory(data.diagnosisSummary?.split(" - ")[1] || "");
        setDiagnosisSubtype(data.diagnosisSummary?.split(" - ")[2] || "");
        setNotes(data.notes || "");
      }
    }
    fetchPrescription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const selectedCategory = DIAGNOSIS_OPTIONS.find(
    (c) => c.category === diagnosisCategory
  );
  const selectedGmfcs = GMFCS_LEVELS.find((l) => l.level === gmfcsLevel);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (prescriptionId) {
        await updatePrescription(prescriptionId, {
          patientId,
          diagnosisSummary: `${gmfcsLevel} - ${diagnosisCategory} - ${diagnosisSubtype}`,
          notes,
          createdBy,
        });
        setSaving(false);
        if (onSave)
          onSave({
            gmfcsLevel,
            diagnosisCategory,
            diagnosisSubtype,
            notes,
          });
        alert("Diagnosis updated!");
      } else {
        const created = await createPrescription({
          patientId,
          diagnosisSummary: `${gmfcsLevel} - ${diagnosisCategory} - ${diagnosisSubtype}`,
          notes,
          createdBy,
        });
        setPrescriptionId(created.id);
        setSaving(false);
        if (onSave)
          onSave({
            gmfcsLevel,
            diagnosisCategory,
            diagnosisSubtype,
            notes,
          });
        alert("Diagnosis saved!");
      }
    } catch (error) {
      setSaving(false);
      toast.error((error as Error).message);
    }
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
    >
      <div className="space-y-8">
        {/* Diagnosis Category Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Diagnosis Category</h2>
          <div className="grid grid-cols-3 gap-4">
            {DIAGNOSIS_OPTIONS.map((category) => (
              <div
                key={category.category}
                className={`border rounded-lg p-4 cursor-pointer text-center transition-all duration-150 flex items-center gap-2
            ${
              diagnosisCategory === category.category
                ? "border-brand-500 bg-brand-50 shadow"
                : "border-gray-200 bg-white"
            }
            hover:shadow-md`}
                onClick={() => setDiagnosisCategory(category.category)}
              >
                {diagnosisCategory === category.category && (
                  <span className="text-brand-500 material-icons">
                    <CheckCircle2Icon size={16} />
                  </span>
                )}
                <span className="font-medium">{category.category}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Diagnosis Subtype Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Diagnosis Subtype</h2>
          <div className="grid grid-cols-3 gap-4">
            {selectedCategory?.subtypes.map((subtype) => (
              <div
                key={subtype.name}
                className={`border rounded-lg p-4 cursor-pointer text-center transition-all duration-150 flex items-center gap-2
            ${
              diagnosisSubtype === subtype.name
                ? "border-brand-500 bg-brand-50 shadow"
                : "border-gray-200 bg-white"
            }
            hover:shadow-md`}
                onClick={() => setDiagnosisSubtype(subtype.name)}
              >
                {diagnosisSubtype === subtype.name && (
                  <span className="text-brand-500 material-icons">
                    <CheckCircle2Icon size={16} />
                  </span>
                )}
                <span className="font-medium">{subtype.name}</span>
              </div>
            ))}
          </div>
          {/* GMFCS Level Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">GMFCS Level</h2>
            {selectedGmfcs && (
              <div className="mb-4 text-sm text-gray-600">
                <b>AFO Implications:</b> {selectedGmfcs.implications}
              </div>
            )}
            <div className="grid grid-cols-3 gap-4">
              {GMFCS_LEVELS.map((level) => (
                <div
                  key={level.level}
                  className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center transition-all duration-150
            ${
              gmfcsLevel === level.level
                ? "border-brand-500 bg-brand-50 shadow"
                : "border-gray-200 bg-white"
            }
            hover:shadow-md`}
                  onClick={() => setGmfcsLevel(level.level)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-base">{level.level}</span>
                    {gmfcsLevel === level.level && (
                      <span className="text-brand-500 material-icons">
                        <CheckCircle2Icon size={16} />
                      </span>
                    )}
                  </div>
                  <Image
                    src={level.image}
                    alt={level.level}
                    width={80}
                    height={80}
                    className="rounded"
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {level.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Notes & Additional Recommendations
          </h2>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full min-h-[80px] border-gray-300 rounded"
            placeholder="Add any notes or recommendations here..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end sticky bottom-0 bg-gradient-to-t from-white pt-4 pb-2 z-10">
          <Button type="submit" disabled={saving} className="w-[140px]">
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </form>
  );
}
