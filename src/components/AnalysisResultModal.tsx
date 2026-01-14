import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Lightbulb } from "lucide-react";

interface AnalysisResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  imageUrl: string;
  necrosisClass: number;
  brightnessVal: number;
  brightnessMessage?: string;
}

const getClassInfo = (classNum: number) => {
  const classInfoMap = {
    1: {
      title: "클래스 1: 정상/창백함",
      description: "장루 색상이 정상이거나 창백한 상태입니다.",
      color: "text-success",
      bgColor: "bg-success/10",
      borderColor: "border-success/30"
    },
    2: {
      title: "클래스 2: 발적/염증",
      description: "장루 주변에 발적이나 염증이 관찰됩니다.",
      color: "text-warning",
      bgColor: "bg-warning/10",
      borderColor: "border-warning/30"
    },
    3: {
      title: "클래스 3: 변색/괴사",
      description: "장루가 변색되었거나 괴사가 의심됩니다.",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      borderColor: "border-destructive/30"
    },
    4: {
      title: "클래스 4: 심각",
      description: "즉각적인 의료 조치가 필요할 수 있습니다.",
      color: "text-destructive",
      bgColor: "bg-destructive/20",
      borderColor: "border-destructive/50"
    }
  };

  return classInfoMap[classNum as keyof typeof classInfoMap] || classInfoMap[1];
};

export function AnalysisResultModal({
  isOpen,
  onClose,
  onContinue,
  imageUrl,
  necrosisClass,
  brightnessVal,
  brightnessMessage
}: AnalysisResultModalProps) {
  if (!isOpen) return null;

  const classInfo = getClassInfo(necrosisClass);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-background">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">분석 완료</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Corrected Image */}
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img
              src={imageUrl}
              alt="보정된 이미지"
              className="w-full h-64 object-cover"
            />
            <div className="bg-muted/50 px-4 py-2 text-center">
              <p className="text-xs text-muted-foreground">A4 용지 기반 밝기 보정 완료</p>
            </div>
          </div>

          {/* Classification Result */}
          <Card className={`p-4 border-2 ${classInfo.borderColor} ${classInfo.bgColor}`}>
            <div className="space-y-2">
              <h3 className={`text-lg font-bold ${classInfo.color}`}>
                {classInfo.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {classInfo.description}
              </p>
            </div>
          </Card>

          {/* Brightness Information */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium text-foreground">밝기 값</span>
              <span className="text-sm font-mono text-foreground">{brightnessVal.toFixed(1)}</span>
            </div>

            {brightnessMessage && (
              <Card className="p-3 bg-primary/5 border-primary/20">
                <p className="text-sm text-foreground flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary flex-shrink-0" />
                  {brightnessMessage}
                </p>
              </Card>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              variant="default"
              size="lg"
              className="w-full"
              onClick={onContinue}
            >
              질문으로 이어가기
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={onClose}
            >
              닫기
            </Button>
          </div>

          {/* Notice */}
          <p className="text-xs text-center text-muted-foreground">
            정확한 진단을 위해 추가 문진을 진행합니다
          </p>
        </div>
      </Card>
    </div>
  );
}
