import React from "react";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ROM_LABELS, ROM_RANGES, MMT_LABELS, MMT_OPTIONS, type Joint, type Movement } from "@/lib/config/clinical-parameters";

interface ClinicalTableProps {
  type: "rom" | "mmt";
  data: Record<string, Record<string, string>>;
  onUpdate: (joint: string, movement: string, value: string) => void;
}

export default function ClinicalTable({ type, data, onUpdate }: ClinicalTableProps) {
  const labels = type === "rom" ? ROM_LABELS : MMT_LABELS;
  const joints = Object.keys(labels) as Joint[];

  const renderCell = (joint: Joint, movement: Movement) => {
    const value = data[joint]?.[movement] || "";

    if (type === "rom") {
      const range = ROM_RANGES[joint][movement as keyof typeof ROM_RANGES[typeof joint]] as { min: number; max: number; unit: string };
      return (
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min={range.min}
            max={range.max}
            className="w-20 text-center"
            value={value}
            onChange={(e) => onUpdate(joint, movement, e.target.value)}
            autoComplete="off"
          />
          <span className="text-gray-500 text-sm ml-1">{range.unit}</span>
        </div>
      );
    }

    if (type === "mmt") {
      const selectedOption = MMT_OPTIONS.find((opt) => opt.value === value);
      
      return (
        <div className="flex items-center gap-2">
          <Select
            value={value}
            onValueChange={(newValue: string) => onUpdate(joint, movement, newValue)}
          >
            <SelectTrigger className="w-32 h-8">
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
          {value !== "" && selectedOption && (
            <span
              className="text-xs text-gray-500 ml-1"
              title={selectedOption.help}
            >
              {selectedOption.label.split(" - ")[1]}
            </span>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-y-2">
        <thead>
          <tr>
            <th className="text-left text-gray-700 font-semibold">Joint</th>
            {Object.keys(labels.ankle).map((movement) => (
              <th key={movement} className="text-center text-gray-600 font-medium">
                {labels.ankle[movement as Movement]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {joints.map((joint) => (
            <tr key={joint} className="bg-white/80 hover:bg-brand-50 transition rounded">
              <td className="font-semibold capitalize px-2 py-2 text-brand-900">
                {joint}
              </td>
              {Object.keys(labels[joint]).map((movement) => (
                <td key={movement} className="px-2 py-2">
                  {renderCell(joint, movement as Movement)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 