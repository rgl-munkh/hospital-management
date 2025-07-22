export const ROM_LABELS = {
  ankle: {
    dorsiflexion: "Dorsiflexion",
    plantarflexion: "Plantarflexion",
  },
  knee: {
    flexion: "Flexion",
    extension: "Extension",
  },
  hip: {
    extension: "Extension",
    flexion: "Flexion",
  },
} as const;

export const ROM_RANGES = {
  ankle: {
    dorsiflexion: { min: 0, max: 20, unit: "°" },
    plantarflexion: { min: 0, max: 50, unit: "°" },
  },
  knee: {
    flexion: { min: 0, max: 135, unit: "°" },
    extension: { min: 0, max: 0, unit: "°" },
  },
  hip: {
    extension: { min: 0, max: 15, unit: "°" },
    flexion: { min: 0, max: 125, unit: "°" },
  },
} as const;

export const MMT_LABELS = {
  ankle: {
    dorsiflexion: "Dorsiflexion",
    plantarflexion: "Plantarflexion",
  },
  knee: {
    flexion: "Flexion",
    extension: "Extension",
  },
  hip: {
    extension: "Extension",
    flexion: "Flexion",
  },
} as const;

export const MMT_OPTIONS = [
  {
    value: "0",
    label: "0 - No contraction (Weak)",
    help: "No visible or palpable contraction",
  },
  {
    value: "1",
    label: "1 - Trace contraction (Weak)",
    help: "Slight contraction, no movement",
  },
  {
    value: "2",
    label: "2 - Poor (Weak)",
    help: "Movement with gravity eliminated",
  },
  {
    value: "3",
    label: "3 - Fair (Mild)",
    help: "Movement against gravity only",
  },
  {
    value: "4",
    label: "4 - Good (Full)",
    help: "Movement against some resistance",
  },
  {
    value: "5",
    label: "5 - Normal (Full)",
    help: "Normal strength, full resistance",
  },
] as const;

export const SPASTICITY_LABELS = {
  ankle: {
    dorsiflexion: "Dorsiflexion",
    plantarflexion: "Plantarflexion",
  },
  knee: {
    flexion: "Flexion",
    extension: "Extension",
  },
  hip: {
    extension: "Extension",
    flexion: "Flexion",
  },
} as const;

export const SPASTICITY_OPTIONS = [
  {
    value: "0",
    label: "0 - No spasticity",
    help: "Don't have spasticity",
  },
  {
    value: "1",
    label: "1 - Weak spasticity",
    help: "Mild spasticity",
  },
  {
    value: "+1",
    label: "+1 - Weak spasticity",
    help: "Mild spasticity",
  },
  {
    value: "2",
    label: "2 - Moderate spasticity",
    help: "Moderate spasticity",
  },
  {
    value: "3",
    label: "3 - Strong spasticity",
    help: "Strong spasticity",
  },
  {
    value: "4",
    label: "4 - Strong spasticity",
    help: "Strong spasticity",
  },
] as const;

export const GAIT_LABELS = {
  "initial-contact-loading": {
    ankle: "Ankle",
    knee: "Knee",
  },
  "loading-response-midstance": {
    ankle: "Ankle",
    knee: "Knee",
  },
  "midstance-terminal-stance": {
    ankle: "Ankle",
    knee: "Knee",
    hip: "Hip",
  },
  "terminal-stance-pre-swing": {
    ankle: "Ankle",
  },
  "pre-swing-mid-swing": {
    ankle: "Ankle",
    knee: "Knee",
    hip: "Hip",
  },
  "mid-swing-initial-contact": {
    ankle: "Ankle",
    knee: "Knee",
  },
} as const;

export const GAIT_OPTIONS = [
  {
    value: "normal",
    label: "Normal",
    help: "Normal gait pattern",
  },
  {
    value: "lack-heel-contact",
    label: "Lack of heel contact",
    help: "Patient does not make proper heel contact",
  },
  {
    value: "lack-ankle-plantar-flexion",
    label: "Lack of Ankle Plantar flexion",
    help: "Reduced ankle plantar flexion",
  },
  {
    value: "lack-knee-extension",
    label: "Lack of knee extension",
    help: "Reduced knee extension",
  },
  {
    value: "lack-ankle-dorsiflexion",
    label: "Lack of Ankle dorsiflexion",
    help: "Reduced ankle dorsiflexion",
  },
  {
    value: "lack-ankle-plantar-flexion-push",
    label: "Lack of ankle plantar flexion",
    help: "Reduced ankle plantar flexion during push-off",
  },
  {
    value: "excessive-knee-extension",
    label: "Excessive knee extension (Back knee)",
    help: "Hyperextension of the knee",
  },
  {
    value: "excessive-knee-flexion",
    label: "Excessive knee flexion (Buckling knee)",
    help: "Excessive knee flexion causing buckling",
  },
  {
    value: "lack-hip-extension",
    label: "Lack of hip extension",
    help: "Reduced hip extension",
  },
  {
    value: "lack-push-off",
    label: "Lack of push off",
    help: "Reduced push-off during gait",
  },
  {
    value: "lack-knee-flexion",
    label: "Lack of knee flexion",
    help: "Reduced knee flexion",
  },
  {
    value: "lack-hip-flexion",
    label: "Lack of hip flexion",
    help: "Reduced hip flexion",
  },
] as const;

export const ORTHOTIC_TYPE_OPTIONS = [
  {
    value: "solid",
    label: "Solid AFO",
    description: "Rigid ankle-foot orthosis for maximum stability",
    image: "/orthotic-types/solid.png",
  },
  {
    value: "solid-2",
    label: "Solid AFO (Alternative)",
    description: "Alternative solid design",
    image: "/orthotic-types/solid-2.png",
  },
  {
    value: "hinge",
    label: "Hinged AFO",
    description: "Allows controlled ankle movement",
    image: "/orthotic-types/hinge.png",
  },
  {
    value: "anterior-shell",
    label: "Anterior Shell AFO",
    description: "Front shell design for specific conditions",
    image: "/orthotic-types/anterior-shell.png",
  },
  {
    value: "smo",
    label: "SMO (Supramalleolar Orthosis)",
    description: "Short orthosis for mild conditions",
    image: "/orthotic-types/smo.png",
  },
] as const;

// Type helpers
export type Joint = keyof typeof ROM_LABELS;
export type Movement = keyof typeof ROM_LABELS.ankle;
export type OrthoticType = typeof ORTHOTIC_TYPE_OPTIONS[number]['value']; 