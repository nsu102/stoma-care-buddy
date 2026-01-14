import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, Phone, Calendar, MapPin } from "lucide-react";

interface DiagnosisResultData {
  type: "result";
  diagnosis: string;
  description: string;
  prescription: string;
  risk_level: string;
  emergency_alert?: string | null;
}

interface DiagnosisResultProps {
  result: DiagnosisResultData;
  correctedImageUrl?: string;
  brightnessMessage?: string;
  onGoHome: () => void;
  onViewHistory: () => void;
}

export function DiagnosisResult({
  result,
  correctedImageUrl,
  onGoHome,
  onViewHistory,
}: DiagnosisResultProps) {
  const isHighRisk = result.risk_level === "high" || result.risk_level === "medium";

  return (
    <div className="animate-fade-in min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 py-4 mb-4">
        <button onClick={onGoHome} className="p-2 -ml-2">
          <ChevronLeft className="h-6 w-6 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">문진 확인</h1>
      </div>

      <div className="space-y-6">
        {/* Title Section */}
        <div>
          <h2 className="text-3xl font-bold text-primary mb-1">루커</h2>
          <h3 className="text-2xl font-bold text-foreground mb-1">AI 문진 내용입니다.</h3>
          <p className="text-muted-foreground">{result.diagnosis}</p>
        </div>

        {/* Image */}
        {correctedImageUrl && (
          <div className="rounded-2xl overflow-hidden">
            <img
              src={correctedImageUrl}
              alt="장루 이미지"
              className="w-full aspect-square object-cover"
            />
          </div>
        )}

        {/* 문진 요약 Section */}
        <div className="space-y-2">
          <h4 className="text-primary font-semibold underline underline-offset-4">문진 요약</h4>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {result.description}
          </p>
        </div>

        <hr className="border-border" />

        {/* 의심되는 증상 Section */}
        <div className="space-y-2">
          <h4 className="text-primary font-semibold underline underline-offset-4">의심되는 증상</h4>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {result.prescription || "증상에 대한 상세 분석 결과입니다. 전문 의료진과 상담하시기 바랍니다."}
          </p>
        </div>

        {/* Hospital Checklist Banner */}
        {isHighRisk && (
          <div className="bg-primary rounded-2xl p-5 text-primary-foreground">
            <h4 className="font-semibold text-center mb-4">병원 가기 전 필수 체크리스트</h4>
            <div className="bg-background/95 rounded-xl p-4 text-foreground">
              <ul className="space-y-2 text-sm">
                <li>-신분증 or 모바일 건강보험증</li>
                <li>-기저질환자의 경우 마스크 권장</li>
                <li>-응급의료시 상급종합병원 확인</li>
                <li className="text-muted-foreground">응급의료포털(E-Gen), www.e-gen.or.kr</li>
              </ul>
            </div>
          </div>
        )}

        {/* Hospital Recommendation */}
        {isHighRisk && (
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">병원 방문을 추천드립니다.</h4>
            <Card className="p-4 border-0 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-muted overflow-hidden flex-shrink-0">
                  <div className="w-full h-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center text-2xl">
                    👨‍⚕️
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-primary">가톨릭대학교 서울성모병원</h5>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>김OO 교수</span>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                      진료 09:00-16:30
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Button size="sm" variant="outline" className="rounded-full">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button size="sm" className="rounded-full flex-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  일정 잡기
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Office Information */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">Office information</h4>
          <Card className="overflow-hidden border-0 shadow-sm">
            <div className="h-40 bg-muted relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">지도 정보</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={onViewHistory}
            className="w-full"
          >
            기록 보기
          </Button>
          <Button
            size="lg"
            onClick={onGoHome}
            className="w-full"
          >
            홈으로
          </Button>
        </div>
      </div>
    </div>
  );
}
