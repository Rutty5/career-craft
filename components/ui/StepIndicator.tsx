"use client";

const STEPS = [
  { label: "基本設定", icon: "1" },
  { label: "経歴書入力", icon: "2" },
  { label: "結果表示", icon: "3" },
];

interface StepIndicatorProps {
  currentStep: number;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {STEPS.map((step, i) => (
        <div key={i} className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-bold transition-all ${
                i === currentStep
                  ? "bg-gradient-to-r from-navy to-navy-light text-white shadow-md"
                  : i < currentStep
                  ? "bg-gold text-white"
                  : "bg-gray-200 text-text-light"
              }`}
            >
              {i < currentStep ? "✓" : step.icon}
            </div>
            <span
              className={`hidden sm:inline text-sm font-medium ${
                i === currentStep
                  ? "text-navy font-bold"
                  : i < currentStep
                  ? "text-gold"
                  : "text-text-light"
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`w-8 sm:w-16 h-0.5 ${
                i < currentStep ? "bg-gold" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
