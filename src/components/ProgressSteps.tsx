interface ProgressStepsProps {
  currentStep: number;
  steps: string[];
}

export default function ProgressSteps({ currentStep, steps }: ProgressStepsProps) {
  return (
    <div className="flex justify-center mb-8">
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div key={index} className="flex items-center">
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isCompleted
                      ? "bg-green-600 text-white"
                      : isCurrent
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-300 text-gray-500"
                  }`}
                >
                  {isCompleted ? "✓" : stepNumber}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    isCompleted
                      ? "text-green-600"
                      : isCurrent
                      ? "text-indigo-600"
                      : "text-gray-500"
                  }`}
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-8 h-px ml-4 ${
                    isCompleted ? "bg-green-600" : "bg-gray-300"
                  }`}
                ></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}