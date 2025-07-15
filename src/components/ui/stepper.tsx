import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepperProps {
  steps: {
    title: string
    description?: string
  }[]
  currentStep: number
  onStepClick?: (step: number) => void
  className?: string
}

export function Stepper({ steps, currentStep, onStepClick, className }: StepperProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isClickable = onStepClick && index <= currentStep

          return (
            <React.Fragment key={index}>
              <div className="flex items-center">
                <button
                  onClick={() => isClickable && onStepClick(index)}
                  disabled={!isClickable}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                    isCompleted
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCurrent
                      ? "border-primary bg-background text-primary"
                      : "border-muted-foreground/25 bg-background text-muted-foreground",
                    isClickable && "cursor-pointer hover:border-primary/50"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </button>
                <div className="ml-4">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isCompleted || isCurrent
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-8 transition-colors",
                    isCompleted ? "bg-primary" : "bg-muted-foreground/25"
                  )}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
} 