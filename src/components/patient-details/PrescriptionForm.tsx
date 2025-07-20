import React, { useState, useEffect } from "react";
import { getPrescriptionByPatientId, getDiagnosisByPrescriptionId, createDiagnosis, updateDiagnosis } from "@/lib/prescriptions/actions";
import AiChatForm from "./AiChatForm";
import { Patient } from "@/lib/definitions";

interface PrescriptionFormProps {
  patientId: string;
  patient: Patient;
}

export default function PrescriptionForm({ patientId, patient }: PrescriptionFormProps) {
  const [prescriptionId, setPrescriptionId] = useState<string | null>(null);
  const [diagnosisId, setDiagnosisId] = useState<string | null>(null);
  const [diagnosisType, setDiagnosisType] = useState("");
  const [description, setDescription] = useState("");
  const [gmfcsLevel, setGmfcsLevel] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [saving, setSaving] = useState(false);
  const [prescription, setPrescription] = useState<any>(null);
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [showChat, setShowChat] = useState(false);

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
          setDiagnosisType(diagnosis.diagnosisType || "");
          setDescription(diagnosis.description || "");
          setGmfcsLevel(diagnosis.gmfcsLevel || "");
          setRecommendation(diagnosis.recommendation || "");
        }
      }
    }
    fetchData();
  }, [patientId]);

  const handleSave = async () => {
    if (!prescriptionId) {
      alert("No prescription found for this patient. Please fill the Diagnosis tab first.");
      return;
    }
    setSaving(true);
    try {
      if (diagnosisId) {
        await updateDiagnosis(diagnosisId, {
          prescriptionId,
          diagnosisType,
          description,
          gmfcsLevel,
          recommendation,
        });
        setSaving(false);
        alert("Prescription updated!");
      } else {
        const created = await createDiagnosis({
          prescriptionId,
          diagnosisType,
          description,
          gmfcsLevel,
          recommendation,
        });
        setDiagnosisId(created.id);
        setSaving(false);
        alert("Prescription saved!");
      }
    } catch (error) {
      setSaving(false);
      alert("Failed to save prescription. Please try again.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="md:w-1/2 w-full">
        <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleSave(); }}>
          <div>
            <label className="block font-medium mb-1">Diagnosis Type</label>
            <input
              className="w-full border rounded p-2"
              value={diagnosisType}
              onChange={e => setDiagnosisType(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea
              className="w-full border rounded p-2 min-h-[60px]"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          {/* <div>
            <label className="block font-medium mb-1">GMFCS Level</label>
            <input
              className="w-full border rounded p-2"
              value={gmfcsLevel}
              onChange={e => setGmfcsLevel(e.target.value)}
            />
          </div> */}
          <div>
            <label className="block font-medium mb-1">Recommendation</label>
            <input
              className="w-full border rounded p-2"
              value={recommendation}
              onChange={e => setRecommendation(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={saving}
          >
            {saving ? "Saving..." : diagnosisId ? "Update" : "Save"}
          </button>
        </form>
      </div>
      <div className="md:w-1/2 w-full flex flex-col items-center justify-start">
        {!showChat ? (
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded shadow mt-4 md:mt-0"
            onClick={() => setShowChat(true)}
          >
            Chat with AI
          </button>
        ) : (
          <AiChatForm patient={patient} diagnosis={diagnosis} prescription={prescription} startOnMount />
        )}
      </div>
    </div>
  );
} 