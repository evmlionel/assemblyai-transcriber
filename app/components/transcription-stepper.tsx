"use client"

import { Check, Upload, Headphones, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface TranscriptionStepperProps {
  currentStep: number
}

export function TranscriptionStepper({ currentStep }: TranscriptionStepperProps) {
  const steps = [
    { id: 0, name: "Upload", icon: Upload },
    { id: 1, name: "File Selected", icon: Check },
    { id: 2, name: "Uploading", icon: Upload },
    { id: 3, name: "Transcribing", icon: Headphones },
    { id: 4, name: "Complete", icon: FileText },
  ]

  return (
    <div className="hidden md:flex items-center justify-center">
      <nav aria-label="Progress" className="w-full max-w-3xl">
        <ol role="list" className="flex items-center">
          {steps.map((step, stepIdx) => (
            <li key={step.name} className={cn(stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : "", "relative flex-1")}>
              {step.id < currentStep ? (
                <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-primary" />
                  </div>
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                    <Check className="h-5 w-5 text-white" aria-hidden="true" />
                    <span className="sr-only">{step.name}</span>
                  </div>
                </>
              ) : step.id === currentStep ? (
                <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-muted" />
                  </div>
                  <div
                    className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background"
                    aria-current="step"
                  >
                    <step.icon className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span className="sr-only">{step.name}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-muted" />
                  </div>
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted bg-background">
                    <step.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="sr-only">{step.name}</span>
                  </div>
                </>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
}
