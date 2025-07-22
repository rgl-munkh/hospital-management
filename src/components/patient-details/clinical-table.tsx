import React from "react";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  ROM_LABELS,
  ROM_RANGES,
  MMT_LABELS,
  MMT_OPTIONS,
  type Joint,
} from "@/lib/config/clinical-parameters";

interface ClinicalTableProps {
  type: "rom" | "mmt";
  data: Record<string, Record<string, string>>;
  onUpdate: (joint: string, movement: string, value: string) => void;
}

export default function ClinicalTable({
  type,
  data,
  onUpdate,
}: ClinicalTableProps) {
  const labels = type === "rom" ? ROM_LABELS : MMT_LABELS;
  const joints = Object.entries(labels);

  return (
    <div className="space-y-2">
      {joints.map(([joint, movements]) => (
        <div key={joint}>
          <h3 className="text-lg font-bold">
            {joint.charAt(0).toUpperCase() + joint.slice(1)}
          </h3>
          <div className="grid grid-cols-2 gap-10">
            {Object.entries(movements).map(([movement, value]) => (
              <div key={movement}>
                <span className="text-sm font-medium">{value}</span>
                {type === "rom" ? (
                  <Input
                    type="number"
                    min={
                      (
                        ROM_RANGES[joint as Joint] as Record<
                          string,
                          { min: number; max: number }
                        >
                      )[movement]?.min
                    }
                    max={
                      (
                        ROM_RANGES[joint as Joint] as Record<
                          string,
                          { min: number; max: number }
                        >
                      )[movement]?.max
                    }
                    className="text-center w-full"
                    value={data[joint]?.[movement] || ""}
                    onChange={(e) => onUpdate(joint, movement, e.target.value)}
                    autoComplete="off"
                  />
                ) : (
                  <Select
                    value={data[joint]?.[movement] || ""}
                    onValueChange={(newValue: string) =>
                      onUpdate(joint, movement, newValue)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {MMT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
