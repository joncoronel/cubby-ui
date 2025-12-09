"use client";

import { useState } from "react";
import { Button } from "@/registry/default/button/button";
import {
  Timeline,
  TimelineContent,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/registry/default/timeline/timeline";

const steps = [
  {
    id: 1,
    title: "Account Setup",
    description: "Create your account and verify your email address",
  },
  {
    id: 2,
    title: "Profile Information",
    description: "Complete your profile with personal details",
  },
  {
    id: 3,
    title: "Preferences",
    description: "Set your preferences and notification settings",
  },
  {
    id: 4,
    title: "Review & Confirm",
    description: "Review your information and confirm your setup",
  },
];

export default function TimelineStepper() {
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-bold">Setup Process</h2>
        <p className="text-muted-foreground">
          Complete the following steps to set up your account
        </p>
      </div>

      <Timeline value={currentStep} onValueChange={setCurrentStep}>
        {steps.map((step) => (
          <TimelineItem key={step.id} step={step.id}>
            <TimelineIndicator
              className="cursor-pointer"
              onClick={() => goToStep(step.id)}
            >
              <span className="text-right align-bottom text-xs leading-none font-medium">
                {step.id}
              </span>
            </TimelineIndicator>
            <TimelineSeparator />
            <TimelineHeader>
              <TimelineTitle
                className={`cursor-pointer ${
                  step.id === currentStep ? "text-primary" : ""
                }`}
                onClick={() => goToStep(step.id)}
              >
                {step.title}
              </TimelineTitle>
            </TimelineHeader>
            <TimelineContent>{step.description}</TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>

      <div className="mt-8 flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        <div className="flex gap-2">
          <span className="text-muted-foreground text-sm">
            Step {currentStep} of {steps.length}
          </span>
        </div>
        <Button onClick={nextStep} disabled={currentStep === steps.length}>
          {currentStep === steps.length ? "Complete" : "Next"}
        </Button>
      </div>
    </div>
  );
}
