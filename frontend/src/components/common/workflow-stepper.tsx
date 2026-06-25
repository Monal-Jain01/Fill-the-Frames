import React from 'react';
import { CheckCircle } from 'lucide-react';

export interface Step {
  id: number;
  label: string;
  description?: string;
  component: React.ReactNode;
}

interface WorkflowStepperProps {
  steps: Step[];
  currentStep: number;
}

export function WorkflowStepper({ steps, currentStep }: WorkflowStepperProps) {
  const activeStepContent = steps.find((step) => step.id === currentStep)?.component;

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-start justify-between w-full">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-2 relative z-10 w-24">
                <div 
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors bg-card ${
                    isActive ? 'border-primary text-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.1)]' : 
                    isCompleted ? 'border-primary bg-primary text-primary-foreground' : 
                    'border-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : <span className="font-semibold text-sm">{step.id}</span>}
                </div>
                <div className="text-center">
                  <p className={`text-sm font-medium transition-colors ${isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-1 hidden md:block">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className="flex-1 mt-5 h-[2px] -mx-4 z-0">
                  <div className={`h-full transition-all duration-300 ${
                    isCompleted ? 'bg-primary' : 'bg-muted'
                  }`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="mt-6 bg-card rounded-xl border border-border p-6 shadow-sm min-h-[400px]">
        {activeStepContent}
      </div>
    </div>
  );
}
