import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Check } from "lucide-react";

interface QuestionnaireStepProps {
  question: string;
  options: string[];
  onSelect: (index: number) => void;
  onBack?: () => void;
  canGoBack?: boolean;
  isLoading?: boolean;
  stage?: string;
  diagnosis?: string;
}

export function QuestionnaireStep({
  question,
  options,
  onSelect,
  onBack,
  canGoBack = false,
  isLoading = false,
  diagnosis,
}: QuestionnaireStepProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
  };

  const handleConfirm = () => {
    if (selectedIndex !== null) {
      onSelect(selectedIndex);
      setSelectedIndex(null);
    }
  };

  const optionLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Blue Header Section */}
      <div className="bg-primary px-4 pt-4 pb-8 rounded-b-3xl">
        {/* Back Button */}
        {canGoBack && onBack && (
          <button 
            onClick={onBack}
            className="p-2 -ml-2 mb-4"
            disabled={isLoading}
          >
            <ChevronLeft className="h-6 w-6 text-primary-foreground" />
          </button>
        )}
        
        {/* Title and Question */}
        <div className="space-y-2">
          {diagnosis && (
            <h1 className="text-xl font-bold text-primary-foreground">
              {diagnosis}
            </h1>
          )}
          <p className="text-primary-foreground/90 text-lg">
            {question}
          </p>
        </div>
      </div>

      {/* Illustration Area */}
      <div className="flex-1 flex items-center justify-center py-6 px-4">
        <div className="w-64 h-48 flex items-center justify-center">
          <svg 
            viewBox="0 0 300 200" 
            className="w-full h-full text-primary/20"
            fill="currentColor"
          >
            {/* Simple doctor-patient illustration placeholder */}
            <rect x="50" y="60" width="80" height="100" rx="10" className="text-primary/10" fill="currentColor" />
            <circle cx="90" cy="40" r="25" className="text-primary/20" fill="currentColor" />
            <rect x="170" y="60" width="80" height="100" rx="10" className="text-primary/15" fill="currentColor" />
            <circle cx="210" cy="40" r="25" className="text-primary/25" fill="currentColor" />
            <rect x="140" y="80" width="20" height="60" rx="5" className="text-primary/30" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Options Section */}
      <div className="px-4 pb-6 space-y-3">
        {options.map((option, index) => {
          const isSelected = selectedIndex === index;
          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={isLoading}
              className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all text-left ${
                isSelected 
                  ? "border-primary bg-primary/5" 
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              {/* Circle Indicator */}
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                isSelected 
                  ? "border-primary bg-primary" 
                  : "border-muted-foreground/30"
              }`}>
                {isSelected && <Check className="h-4 w-4 text-primary-foreground" />}
              </div>
              
              {/* Option Text */}
              <span className={`text-sm ${isSelected ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                {optionLabels[index]}. {option}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Button */}
      <div className="px-4 pb-8 safe-area-inset-bottom">
        <Button
          size="lg"
          className="w-full h-14 text-base font-semibold rounded-xl"
          onClick={handleConfirm}
          disabled={selectedIndex === null || isLoading}
        >
          {isLoading ? (
            <span className="animate-pulse">처리 중...</span>
          ) : (
            "다음"
          )}
        </Button>
      </div>
    </div>
  );
}
