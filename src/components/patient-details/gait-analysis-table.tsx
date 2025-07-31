import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { GAIT_LABELS, GAIT_OPTIONS } from "@/constants/clinical-parameters";

interface GaitAnalysisTableProps {
  data: Record<string, Record<string, string>>;
  onUpdate: (phase: string, joint: string, value: string) => void;
}

export default function GaitAnalysisTable({
  data,
  onUpdate,
}: GaitAnalysisTableProps) {
  const gaitPhases = Object.entries(GAIT_LABELS);

  return (
    <div className="space-y-6">
      {gaitPhases.map(([phase, joints]) => (
        <div key={phase} className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-bold mb-4 text-gray-800">
            {phase.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(joints).map(([joint, jointLabel]) => (
              <div key={joint} className="space-y-2">
                <span className="text-sm font-medium text-gray-700">{jointLabel}</span>
                <Select
                  value={data[phase]?.[joint] || ""}
                  onValueChange={(newValue: string) =>
                    onUpdate(phase, joint, newValue)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select gait pattern" />
                  </SelectTrigger>
                  <SelectContent>
                    {GAIT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 