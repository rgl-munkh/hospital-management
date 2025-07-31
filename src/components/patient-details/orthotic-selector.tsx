import React from "react";
import Image from "next/image";
import { ORTHOTIC_TYPE_OPTIONS } from "@/constants/clinical-parameters";

interface OrthoticSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function OrthoticSelector({ value, onChange }: OrthoticSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h2 className="text-lg font-semibold mb-2">Orthotic Type</h2>
      <p className="text-sm text-gray-600 mb-4">
        Select the type of ankle-foot orthosis
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ORTHOTIC_TYPE_OPTIONS.map((option) => (
          <div
            key={option.value}
            className={`border rounded-lg p-4 cursor-pointer transition-all duration-150 flex flex-col items-center gap-3
            ${
              value === option.value
                ? "border-brand-500 bg-brand-50 shadow"
                : "border-gray-200 bg-white"
            }
            hover:shadow-md`}
            onClick={() => onChange(option.value)}
          >
            <div className="relative w-full h-32 mb-2">
              <Image
                src={option.image}
                alt={option.label}
                fill
                className="object-contain rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              {value === option.value && (
                <span className="text-brand-600">✔</span>
              )}
              <span className="font-medium text-center">{option.label}</span>
            </div>
            {option.description && (
              <p className="text-xs text-gray-500 text-center">
                {option.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 