import React, { useState } from "react";
import { createPrescription } from "@/lib/prescriptions/actions";
import { getPrescriptionByPatientId, updatePrescription } from "@/lib/prescriptions/actions";
import { useEffect } from "react";

const GMFCS_LEVELS = [
  {
    level: "Level I",
    description: "Walks without limitations.",
    implications: "Lightweight, flexible AFO; possibly dynamic or hinged AFO to allow ankle motion.",
  },
  {
    level: "Level II",
    description: "Walks with limitations (e.g., uneven terrain, stair).",
    implications: "May need more stability—posterior leaf spring or articulated AFO depending on strength/spasticity.",
  },
  {
    level: "Level III",
    description: "Walks with assistive device.",
    implications: "Solid or GRAFO for max stability; consider anterior shell for weak plantarflexors.",
  },
  {
    level: "Level IV",
    description: "Limited self-mobility, powered mobility.",
    implications: "Custom molded solid AFO with strong support; foot positioning and tone control prioritized.",
  },
  {
    level: "Level V",
    description: "Transported in manual wheelchair.",
    implications: "Focus on positioning, tone management, and comfort; possibly orthotic for non-ambulatory use.",
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
        recommendations: ["Anterior shell solid", "Anterior shell with strong joint"],
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
  afoRecommendation: string;
  notes: string;
}

interface DiagnosisFormProps {
  initialData: Partial<DiagnosisData>;
  onSave?: (data: DiagnosisData) => void;
  patientId: string;
  createdBy?: string;
}

export default function DiagnosisForm({ initialData, onSave, patientId, createdBy }: DiagnosisFormProps) {
  const [gmfcsLevel, setGmfcsLevel] = useState(initialData?.gmfcsLevel || "");
  const [diagnosisCategory, setDiagnosisCategory] = useState(initialData?.diagnosisCategory || "");
  const [diagnosisSubtype, setDiagnosisSubtype] = useState(initialData?.diagnosisSubtype || "");
  const [afoRecommendation, setAfoRecommendation] = useState(initialData?.afoRecommendation || "");
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
        setAfoRecommendation(data.orthoticType || "");
        setNotes(data.notes || "");
      }
    }
    fetchPrescription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const selectedCategory = DIAGNOSIS_OPTIONS.find(c => c.category === diagnosisCategory);
  const selectedSubtype = selectedCategory?.subtypes.find(s => s.name === diagnosisSubtype);
  const selectedGmfcs = GMFCS_LEVELS.find(l => l.level === gmfcsLevel);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (prescriptionId) {
        await updatePrescription(prescriptionId, {
          patientId,
          diagnosisSummary: `${gmfcsLevel} - ${diagnosisCategory} - ${diagnosisSubtype}`,
          orthoticType: afoRecommendation,
          notes,
          createdBy,
        });
        setSaving(false);
        if (onSave) onSave({ gmfcsLevel, diagnosisCategory, diagnosisSubtype, afoRecommendation, notes });
        alert("Diagnosis updated!");
      } else {
        const created = await createPrescription({
          patientId,
          diagnosisSummary: `${gmfcsLevel} - ${diagnosisCategory} - ${diagnosisSubtype}`,
          orthoticType: afoRecommendation,
          notes,
          createdBy,
        });
        setPrescriptionId(created.id);
        setSaving(false);
        if (onSave) onSave({ gmfcsLevel, diagnosisCategory, diagnosisSubtype, afoRecommendation, notes });
        alert("Diagnosis saved!");
      }
    } catch (error) {
      setSaving(false);
      alert("Failed to save diagnosis. Please try again.");
    }
  };

  return (
    <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleSave(); }}>
      <div>
        <label className="block font-medium mb-1">GMFCS Level</label>
        <select
          className="w-full border rounded p-2"
          value={gmfcsLevel}
          onChange={e => setGmfcsLevel(e.target.value)}
        >
          <option value="">Select Level</option>
          {GMFCS_LEVELS.map(l => (
            <option key={l.level} value={l.level}>{l.level}</option>
          ))}
        </select>
        {selectedGmfcs && (
          <div className="mt-2 text-sm text-gray-600">
            <div><b>Description:</b> {selectedGmfcs.description}</div>
            <div><b>AFO Implications:</b> {selectedGmfcs.implications}</div>
          </div>
        )}
      </div>
      <div>
        <label className="block font-medium mb-1">Diagnosis Category</label>
        <select
          className="w-full border rounded p-2"
          value={diagnosisCategory}
          onChange={e => {
            setDiagnosisCategory(e.target.value);
            setDiagnosisSubtype("");
            setAfoRecommendation("");
          }}
        >
          <option value="">Select Category</option>
          {DIAGNOSIS_OPTIONS.map(c => (
            <option key={c.category} value={c.category}>{c.category}</option>
          ))}
        </select>
      </div>
      {selectedCategory && (
        <div>
          <label className="block font-medium mb-1">Subtype</label>
          <select
            className="w-full border rounded p-2"
            value={diagnosisSubtype}
            onChange={e => {
              setDiagnosisSubtype(e.target.value);
              setAfoRecommendation("");
            }}
          >
            <option value="">Select Subtype</option>
            {selectedCategory.subtypes.map(s => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>
      )}
      {selectedSubtype && (
        <div>
          <label className="block font-medium mb-1">AFO Recommendation</label>
          <select
            className="w-full border rounded p-2"
            value={afoRecommendation}
            onChange={e => setAfoRecommendation(e.target.value)}
          >
            <option value="">Select Recommendation</option>
            {selectedSubtype.recommendations.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="block font-medium mb-1">Notes & Additional Recommendations</label>
        <textarea
          className="w-full border rounded p-2 min-h-[80px]"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={saving}
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </form>
  );
} 