"use client";

import { useState, useEffect } from "react";
import {
  getPrescriptionByPatientId,
  getDiagnosisByPrescriptionId,
  createDiagnosis,
  updateDiagnosis,
} from "@/lib/prescriptions/actions";
import AiChatForm from "./AiChatForm";
import { Patient, Prescription, Diagnosis } from "@/lib/definitions";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { Dumbbell, Ruler } from "lucide-react";
import ClinicalTable from "./clinical-table";
import GaitAnalysisTable from "./gait-analysis-table";
import OrthoticSelector from "./orthotic-selector";

interface PrescriptionFormProps {
  patientId: string;
  patient: Patient;
}

interface ClinicalParameters {
  orthoticType: string;
  rangeOfMotion: {
    ankle: {
      dorsiflexion: string;
      plantarflexion: string;
    };
    knee: {
      flexion: string;
      extension: string;
    };
    hip: {
      extension: string;
      flexion: string;
    };
  };
  mmt: {
    ankle: {
      dorsiflexion: string;
      plantarflexion: string;
    };
    knee: {
      flexion: string;
      extension: string;
    };
    hip: {
      extension: string;
      flexion: string;
    };
  };
  spasticity: {
    ankle: {
      dorsiflexion: string;
      plantarflexion: string;
    };
    knee: {
      flexion: string;
      extension: string;
    };
    hip: {
      extension: string;
      flexion: string;
    };
  };
  gaitAnalysis: {
    "initial-contact-loading": {
      ankle: string;
      knee: string;
    };
    "loading-response-midstance": {
      ankle: string;
      knee: string;
    };
    "midstance-terminal-stance": {
      ankle: string;
      knee: string;
      hip: string;
    };
    "terminal-stance-pre-swing": {
      ankle: string;
    };
    "pre-swing-mid-swing": {
      ankle: string;
      knee: string;
      hip: string;
    };
    "mid-swing-initial-contact": {
      ankle: string;
      knee: string;
    };
  };
  notes: string;
}

export default function PrescriptionForm({
  patientId,
  patient,
}: PrescriptionFormProps) {
  const [prescriptionId, setPrescriptionId] = useState<string | null>(null);
  const [diagnosisId, setDiagnosisId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [showChat, setShowChat] = useState(false);

  const [clinicalParams, setClinicalParams] = useState<ClinicalParameters>({
    orthoticType: "",
    rangeOfMotion: {
      ankle: { dorsiflexion: "", plantarflexion: "" },
      knee: { flexion: "", extension: "" },
      hip: { extension: "", flexion: "" },
    },
    mmt: {
      ankle: { dorsiflexion: "", plantarflexion: "" },
      knee: { flexion: "", extension: "" },
      hip: { extension: "", flexion: "" },
    },
    spasticity: {
      ankle: { dorsiflexion: "", plantarflexion: "" },
      knee: { flexion: "", extension: "" },
      hip: { extension: "", flexion: "" },
    },
    gaitAnalysis: {
      "initial-contact-loading": { ankle: "", knee: "" },
      "loading-response-midstance": { ankle: "", knee: "" },
      "midstance-terminal-stance": { ankle: "", knee: "", hip: "" },
      "terminal-stance-pre-swing": { ankle: "" },
      "pre-swing-mid-swing": { ankle: "", knee: "", hip: "" },
      "mid-swing-initial-contact": { ankle: "", knee: "" },
    },
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
          try {
            const existingParams = JSON.parse(
              diagnosis.description || "{}"
            ) as ClinicalParameters;
            setClinicalParams({
              orthoticType: existingParams?.orthoticType || "",
              rangeOfMotion: {
                ankle: {
                  dorsiflexion:
                    existingParams?.rangeOfMotion?.ankle?.dorsiflexion || "",
                  plantarflexion:
                    existingParams?.rangeOfMotion?.ankle?.plantarflexion || "",
                },
                knee: {
                  flexion: existingParams?.rangeOfMotion?.knee?.flexion || "",
                  extension:
                    existingParams?.rangeOfMotion?.knee?.extension || "",
                },
                hip: {
                  extension:
                    existingParams?.rangeOfMotion?.hip?.extension || "",
                  flexion: existingParams?.rangeOfMotion?.hip?.flexion || "",
                },
              },
              mmt: {
                ankle: {
                  dorsiflexion: existingParams?.mmt?.ankle?.dorsiflexion || "",
                  plantarflexion:
                    existingParams?.mmt?.ankle?.plantarflexion || "",
                },
                knee: {
                  flexion: existingParams?.mmt?.knee?.flexion || "",
                  extension: existingParams?.mmt?.knee?.extension || "",
                },
                hip: {
                  extension: existingParams?.mmt?.hip?.extension || "",
                  flexion: existingParams?.mmt?.hip?.flexion || "",
                },
              },
              spasticity: {
                ankle: {
                  dorsiflexion: existingParams?.spasticity?.ankle?.dorsiflexion || "",
                  plantarflexion:
                    existingParams?.spasticity?.ankle?.plantarflexion || "",
                },
                knee: {
                  flexion: existingParams?.spasticity?.knee?.flexion || "",
                  extension: existingParams?.spasticity?.knee?.extension || "",
                },
                hip: {
                  extension:
                    existingParams?.spasticity?.hip?.extension || "",
                  flexion: existingParams?.spasticity?.hip?.flexion || "",
                },
              },
              gaitAnalysis: {
                "initial-contact-loading": {
                  ankle: existingParams?.gaitAnalysis?.["initial-contact-loading"]?.ankle || "",
                  knee: existingParams?.gaitAnalysis?.["initial-contact-loading"]?.knee || "",
                },
                "loading-response-midstance": {
                  ankle: existingParams?.gaitAnalysis?.["loading-response-midstance"]?.ankle || "",
                  knee: existingParams?.gaitAnalysis?.["loading-response-midstance"]?.knee || "",
                },
                "midstance-terminal-stance": {
                  ankle: existingParams?.gaitAnalysis?.["midstance-terminal-stance"]?.ankle || "",
                  knee: existingParams?.gaitAnalysis?.["midstance-terminal-stance"]?.knee || "",
                  hip: existingParams?.gaitAnalysis?.["midstance-terminal-stance"]?.hip || "",
                },
                "terminal-stance-pre-swing": {
                  ankle: existingParams?.gaitAnalysis?.["terminal-stance-pre-swing"]?.ankle || "",
                },
                "pre-swing-mid-swing": {
                  ankle: existingParams?.gaitAnalysis?.["pre-swing-mid-swing"]?.ankle || "",
                  knee: existingParams?.gaitAnalysis?.["pre-swing-mid-swing"]?.knee || "",
                  hip: existingParams?.gaitAnalysis?.["pre-swing-mid-swing"]?.hip || "",
                },
                "mid-swing-initial-contact": {
                  ankle: existingParams?.gaitAnalysis?.["mid-swing-initial-contact"]?.ankle || "",
                  knee: existingParams?.gaitAnalysis?.["mid-swing-initial-contact"]?.knee || "",
                },
              },
              notes: existingParams?.notes || "",
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
      toast.error(
        "No prescription found for this patient. Please fill the Diagnosis tab first."
      );
      return;
    }
    // setSaving(true);
    try {
      const paramsDescription = JSON.stringify(clinicalParams);
      console.log(paramsDescription)
      if (diagnosisId) {
        await updateDiagnosis(diagnosisId, {
          prescriptionId,
          diagnosisType: "Key Clinical Parameters",
          description: paramsDescription,
          gmfcsLevel: "",
          recommendation: "Clinical Parameters",
        });
        setSaving(false);
        toast.success("Clinical parameters updated!");
      } else {
        const created = await createDiagnosis({
          prescriptionId,
          diagnosisType: "Key Clinical Parameters",
          description: paramsDescription,
          gmfcsLevel: "",
          recommendation: "Clinical Parameters",
        });
        setDiagnosisId(created.id);
        setSaving(false);
        toast.success("Clinical parameters saved!");
      }
    } catch {
      setSaving(false);
      toast.error("Failed to save clinical parameters. Please try again.");
    }
  };

  const updateROM = (joint: string, movement: string, value: string) => {
    setClinicalParams((prev) => ({
      ...prev,
      rangeOfMotion: {
        ...prev.rangeOfMotion,
        [joint]: {
          ...prev.rangeOfMotion[joint as keyof typeof prev.rangeOfMotion],
          [movement]: value,
        },
      },
    }));
  };

  const updateMMT = (joint: string, movement: string, value: string) => {
    setClinicalParams((prev) => ({
      ...prev,
      mmt: {
        ...prev.mmt,
        [joint]: {
          ...prev.mmt[joint as keyof typeof prev.mmt],
          [movement]: value,
        },
      },
    }));
  };

  const updateSpasticity = (joint: string, movement: string, value: string) => {
    setClinicalParams((prev) => ({
      ...prev,
      spasticity: {
        ...prev.spasticity,
        [joint]: {
          ...prev.spasticity[joint as keyof typeof prev.spasticity],
          [movement]: value,
        },
      },
    }));
  };

  const updateGaitAnalysis = (phase: string, joint: string, value: string) => {
    setClinicalParams((prev) => ({
      ...prev,
      gaitAnalysis: {
        ...prev.gaitAnalysis,
        [phase]: {
          ...prev.gaitAnalysis[phase as keyof typeof prev.gaitAnalysis],
          [joint]: value,
        },
      },
    }));
  };

  const updateOrthoticType = (value: string) => {
    setClinicalParams((prev) => ({ ...prev, orthoticType: value }));
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="md:w-2/3 w-full">
        <form
          className="space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          {/* Range of Motion Section */}
          <div className="bg-gradient-to-br from-brand-50 to-white rounded-xl shadow p-6 space-y-6 border border-brand-100">
            {/* Range of Motion */}
            <div className="flex items-center gap-2 mb-2 mt-2">
              <span className="font-semibold text-brand-700 flex items-center gap-1">
                <Ruler size={18} className="inline-block" /> Range of Motion
                (degree)
              </span>
            </div>
            <ClinicalTable
              type="rom"
              data={clinicalParams.rangeOfMotion}
              onUpdate={updateROM}
            />

            {/* Divider */}
            <div className="border-t border-brand-100 my-4" />

            {/* MMT Section */}
            <div className="flex items-center gap-2 mb-2 mt-2">
              <span className="font-semibold text-brand-700 flex items-center gap-1">
                <Dumbbell size={18} className="inline-block" /> Manual Muscle
                Test: MMT (Muscle Power)
              </span>
              <span className="ml-2 text-xs text-gray-500">
                Normal range = 0 - 5
              </span>
            </div>
            <ClinicalTable
              type="mmt"
              data={clinicalParams.mmt}
              onUpdate={updateMMT}
            />
            <div className="text-xs text-gray-500 mt-2">
              <span className="font-semibold text-brand-700">MMT Legend:</span>{" "}
              0-2 = <span className="text-red-500 font-semibold">Weak</span>,
              3-4 = <span className="text-yellow-600 font-semibold">Mild</span>,
              4-5 = <span className="text-green-600 font-semibold">Full</span>
            </div>

            {/* Divider */}
            <div className="border-t border-brand-100 my-4" />

            {/* Spasticity Section */}
            <div className="flex items-center gap-2 mb-2 mt-2">
              <span className="font-semibold text-brand-700 flex items-center gap-1">
                <Dumbbell size={18} className="inline-block" /> Muscle Spasticity Test
              </span>
              <span className="ml-2 text-xs text-gray-500">
                Spasticity Scale = 0, 1, +1, 2, 3, 4
              </span>
            </div>
            <ClinicalTable
              type="spasticity"
              data={clinicalParams.spasticity}
              onUpdate={updateSpasticity}
            />
            <div className="text-xs text-gray-500 mt-2">
              <span className="font-semibold text-brand-700">Spasticity Legend:</span>{" "}
              0 = <span className="text-green-600 font-semibold">No spasticity</span>,
              1/+1 = <span className="text-yellow-600 font-semibold">Weak spasticity</span>,
              2 = <span className="text-orange-500 font-semibold">Moderate spasticity</span>,
              3-4 = <span className="text-red-500 font-semibold">Strong spasticity</span>
            </div>

            {/* Divider */}
            <div className="border-t border-brand-100 my-4" />

            {/* Gait Analysis Section */}
            <div className="flex items-center gap-2 mb-2 mt-2">
              <span className="font-semibold text-brand-700 flex items-center gap-1">
                <Dumbbell size={18} className="inline-block" /> Gait Analysis
              </span>
              <span className="ml-2 text-xs text-gray-500">
                Gait cycle phases and joint patterns
              </span>
            </div>
            <GaitAnalysisTable
              data={clinicalParams.gaitAnalysis}
              onUpdate={updateGaitAnalysis}
            />

            {/* Orthotic Type Selector */}
            <OrthoticSelector
              value={clinicalParams.orthoticType}
              onChange={updateOrthoticType}
            />

            {/* Notes */}
            <div className="flex flex-col gap-2 mt-6">
              <label className="block font-medium mb-1" htmlFor="notes">
                Additional Notes & Specifications
              </label>
              <Textarea
                id="notes"
                value={clinicalParams.notes}
                onChange={(e) =>
                  setClinicalParams((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                className="w-full min-h-[80px] border-2 border-brand-200 bg-brand-50 rounded focus:ring-2 focus:ring-brand-200"
                placeholder="Add any additional notes, measurements, or special requirements..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end sticky bottom-0 bg-gradient-to-t from-white pt-4 pb-2 z-10">
            <Button
              type="submit"
              disabled={saving}
              className="w-[160px] font-semibold shadow-lg hover:from-brand-600 hover:to-brand-800 transition"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span> Saving...
                </span>
              ) : diagnosisId ? (
                <span className="flex items-center gap-2">💾 Update</span>
              ) : (
                <span className="flex items-center gap-2">💾 Save</span>
              )}
            </Button>
          </div>
        </form>
      </div>
      <div className="md:w-1/3 w-full flex flex-col items-center justify-start">
        {!showChat ? (
          <Button
            className="bg-brand-600 text-white px-6 py-3 rounded shadow mt-4 md:mt-0"
            onClick={() => setShowChat(true)}
          >
            Chat with AI
          </Button>
        ) : (
          <AiChatForm
            patient={patient}
            diagnosis={diagnosis}
            prescription={prescription}
            startOnMount
          />
        )}
      </div>
    </div>
  );
}
