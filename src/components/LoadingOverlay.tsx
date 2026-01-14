import { RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";

interface LoadingOverlayProps {
  message?: string;
  imageUrl?: string;
  onCancel?: () => void;
}

export function LoadingOverlay({ 
  message = "분석 중...", 
  imageUrl,
  onCancel 
}: LoadingOverlayProps) {
  const [progress, setProgress] = useState(0);

  // Simulate progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex-1 flex flex-col px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-1">루커</h1>
          <h2 className="text-2xl font-bold text-foreground mb-2">분석 중...</h2>
          <p className="text-muted-foreground">AI가 장루 상태를 분석 중입니다</p>
        </div>

        {/* Image with Scan Animation */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-muted">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt="분석 중인 이미지" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20" />
            )}
            
            {/* Scan Line Animation */}
            <div 
              className="absolute left-0 right-0 h-1 bg-primary/80 shadow-[0_0_20px_4px] shadow-primary/50 animate-scan"
              style={{
                animation: "scan 2s ease-in-out infinite"
              }}
            />
            
            {/* Circular Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-4 border-primary/60 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 mb-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Cancel Button */}
        {onCancel && (
          <button 
            onClick={onCancel}
            className="flex items-center justify-center gap-2 py-3 text-primary"
          >
            <RotateCcw className="h-5 w-5" />
            <span className="underline">이전 화면으로 돌아가기</span>
          </button>
        )}
      </div>

      {/* Custom CSS for scan animation */}
      <style>{`
        @keyframes scan {
          0%, 100% {
            top: 10%;
          }
          50% {
            top: 90%;
          }
        }
      `}</style>
    </div>
  );
}
