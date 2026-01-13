import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CameraCapture } from "@/components/CameraCapture";
import { QuestionnaireStep } from "@/components/QuestionnaireStep";
import { DiagnosisResult } from "@/components/DiagnosisResult";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { StepIndicator } from "@/components/StepIndicator";
import { uploadImage, saveDiagnosisResult } from "@/lib/api";
import { 
  getNextStep, 
  startEmergencyQuestionnaire, 
  getRiskLevelString,
  type AIClass,
  type Question,
  type FinalResult,
  type TriageStep
} from "@/lib/triage";
import { 
  Camera, 
  CheckCircle2, 
  Circle, 
  Plus,
  Search,
  Calendar,
  FileText,
  Gift,
  Edit3,
  Trash2,
  Bug
} from "lucide-react";

type HomeView = "main" | "camera" | "questionnaire" | "result" | "debug";

const checklistItems = [
  { id: 1, label: "장루 주변 연고 바르기", date: "25/01/27", completed: true },
  { id: 2, label: "항생제 복용", date: "25/01/27", completed: false },
];

export default function Home() {
  const navigate = useNavigate();
  const [view, setView] = useState<HomeView>("main");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  
  // Diagnosis state
  const [correctedImageUrl, setCorrectedImageUrl] = useState<string | null>(null);
  const [brightnessMessage, setBrightnessMessage] = useState<string | null>(null);
  const [aiClass, setAiClass] = useState<AIClass>(1);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [savedDiagnosis, setSavedDiagnosis] = useState<string>("");
  const [finalResult, setFinalResult] = useState<FinalResult | null>(null);

  const resetDiagnosis = useCallback(() => {
    setCorrectedImageUrl(null);
    setBrightnessMessage(null);
    setAiClass(1);
    setCurrentQuestion(null);
    setSavedDiagnosis("");
    setFinalResult(null);
  }, []);

  const handleStartDiagnosis = useCallback(() => {
    resetDiagnosis();
    setView("camera");
  }, [resetDiagnosis]);

  // 디버그용: AI 클래스를 직접 선택하여 문진 시작
  const handleDebugStart = useCallback((selectedClass: AIClass) => {
    resetDiagnosis();
    setAiClass(selectedClass);
    // 응급 문진부터 시작
    const firstQuestion = startEmergencyQuestionnaire();
    setCurrentQuestion(firstQuestion);
    setView("questionnaire");
  }, [resetDiagnosis]);

  const handleImageCapture = useCallback(async (imageBlob: Blob) => {
    try {
      setIsLoading(true);
      setLoadingMessage("이미지 분석 중...");
      
      const uploadResult = await uploadImage(imageBlob);
      setCorrectedImageUrl(uploadResult.corrected_image_url);
      setBrightnessMessage(uploadResult.brightness_message || null);
      
      // AI 클래스 설정 (1, 2, 3 중 하나)
      const classNum = parseInt(uploadResult.necrosis_class) as AIClass;
      setAiClass(classNum || 1);

      setLoadingMessage("문진 준비 중...");
      
      // 내부 문진 시스템으로 응급 문진 시작
      const firstQuestion = startEmergencyQuestionnaire();
      setCurrentQuestion(firstQuestion);
      setView("questionnaire");
    } catch (error) {
      console.error("Error during image upload:", error);
      alert("서버 연결 실패. 디버그 모드로 진행합니다.");
      // 서버 실패 시 디버그 모드로 전환
      setView("debug");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleOptionSelect = useCallback(async (selectedIndex: number) => {
    if (!currentQuestion) return;

    try {
      setIsLoading(true);
      setLoadingMessage("다음 질문 준비 중...");

      // 현재 질문의 temp_diagnosis가 있으면 저장
      const currentDiagnosis = currentQuestion.temp_diagnosis || savedDiagnosis;
      
      // 다음 단계 가져오기
      const nextStep = getNextStep(
        currentQuestion.id,
        selectedIndex,
        aiClass,
        currentDiagnosis
      );

      if (nextStep.type === "question") {
        // 다음 질문으로 이동
        setCurrentQuestion(nextStep as Question);
        if ((nextStep as Question).temp_diagnosis) {
          setSavedDiagnosis((nextStep as Question).temp_diagnosis!);
        }
      } else if (nextStep.type === "result") {
        // 최종 결과
        const result = nextStep as FinalResult;
        setFinalResult(result);
        setView("result");
        
        // 서버에 결과 저장 (실패해도 계속 진행)
        saveDiagnosisResult({
          diagnosis: result.diagnosis,
          description: result.description,
          advice: result.advice,
          risk_level: result.risk_level,
          emergency_alert: result.emergency_alert,
          corrected_image_url: correctedImageUrl || undefined,
        });
      }
    } catch (error) {
      console.error("Error during questionnaire:", error);
      alert("문진 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [currentQuestion, aiClass, savedDiagnosis, correctedImageUrl]);

  const handleGoHome = useCallback(() => {
    resetDiagnosis();
    setView("main");
  }, [resetDiagnosis]);

  // Listen for openCamera event from BottomNav
  useEffect(() => {
    const handleOpenCamera = () => {
      handleStartDiagnosis();
    };

    window.addEventListener('openCamera', handleOpenCamera);
    return () => {
      window.removeEventListener('openCamera', handleOpenCamera);
    };
  }, [handleStartDiagnosis]);

  // Debug mode view - AI 클래스 선택 화면
  if (view === "debug") {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="text-center mb-8">
            <Bug className="h-12 w-12 text-warning mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">디버그 모드</h1>
            <p className="text-muted-foreground">
              서버 연결 없이 문진을 테스트합니다.<br/>
              AI 클래스를 선택해주세요.
            </p>
          </div>

          <div className="space-y-4">
            <Card 
              className="p-6 border-2 border-success/30 bg-success/5 cursor-pointer hover:border-success transition-colors"
              onClick={() => handleDebugStart(1)}
            >
              <h3 className="text-lg font-bold text-success mb-2">클래스 1: 정상/창백함</h3>
              <p className="text-sm text-muted-foreground">
                장루 색상이 정상이거나 창백한 경우의 문진 흐름을 테스트합니다.
              </p>
            </Card>

            <Card 
              className="p-6 border-2 border-warning/30 bg-warning/5 cursor-pointer hover:border-warning transition-colors"
              onClick={() => handleDebugStart(2)}
            >
              <h3 className="text-lg font-bold text-warning mb-2">클래스 2: 발적/염증</h3>
              <p className="text-sm text-muted-foreground">
                장루 주변에 발적이나 염증이 있는 경우의 문진 흐름을 테스트합니다.
              </p>
            </Card>

            <Card 
              className="p-6 border-2 border-destructive/30 bg-destructive/5 cursor-pointer hover:border-destructive transition-colors"
              onClick={() => handleDebugStart(3)}
            >
              <h3 className="text-lg font-bold text-destructive mb-2">클래스 3: 변색/괴사</h3>
              <p className="text-sm text-muted-foreground">
                장루가 변색되었거나 괴사가 의심되는 경우의 문진 흐름을 테스트합니다.
              </p>
            </Card>
          </div>

          <Button
            variant="outline"
            size="lg"
            className="w-full mt-6"
            onClick={() => setView("main")}
          >
            돌아가기
          </Button>
        </div>
      </div>
    );
  }

  // Camera view
  if (view === "camera") {
    return (
      <>
        <CameraCapture
          onCapture={handleImageCapture}
          onCancel={() => setView("main")}
        />
        {isLoading && <LoadingOverlay message={loadingMessage} />}
      </>
    );
  }

  // Questionnaire view
  if (view === "questionnaire" && currentQuestion) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="max-w-lg mx-auto px-4 py-6">
          <StepIndicator currentStep="questionnaire" />
          
          {correctedImageUrl && (
            <div className="mb-6 rounded-2xl overflow-hidden shadow-lg">
              <img
                src={correctedImageUrl}
                alt="분석 중인 이미지"
                className="w-full h-32 object-cover"
              />
            </div>
          )}

          <QuestionnaireStep
            question={currentQuestion.text}
            options={currentQuestion.options}
            onSelect={handleOptionSelect}
            isLoading={isLoading}
            stage={currentQuestion.id}
          />
        </div>
        {isLoading && <LoadingOverlay message={loadingMessage} />}
      </div>
    );
  }

  // Result view
  if (view === "result" && finalResult) {
    // Convert internal result to the format expected by DiagnosisResult component
    const resultForDisplay = {
      type: "result" as const,
      diagnosis: finalResult.diagnosis,
      description: finalResult.description,
      prescription: finalResult.advice + (finalResult.emergency_alert ? `\n\n⚠️ ${finalResult.emergency_alert}` : ""),
      risk_level: getRiskLevelString(finalResult.risk_level),
    };

    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="max-w-lg mx-auto px-4 py-6">
          <StepIndicator currentStep="result" />
          <DiagnosisResult
            result={resultForDisplay}
            correctedImageUrl={correctedImageUrl || undefined}
            brightnessMessage={brightnessMessage || undefined}
            onGoHome={handleGoHome}
            onViewHistory={() => navigate("/calendar")}
          />
        </div>
      </div>
    );
  }

  // Main home view
  return (
    <div className="min-h-screen bg-primary pb-24">
      {/* Header Section */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="inline-block px-3 py-1 bg-primary-foreground/20 rounded-full text-xs font-medium text-primary-foreground mb-2">
              루카와 함께한 지 45일
            </span>
            <h1 className="text-2xl font-bold text-primary-foreground">오늘도 잘 하고 있어요</h1>
            <p className="text-primary-foreground/70 text-sm mt-1">최근 검사: 2026. 1. 20 오전 9:12</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary-foreground/20 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center text-lg">
              👤
            </div>
          </div>
        </div>

        {/* Health Summary Card */}
        <Card className="p-4 bg-card/95 backdrop-blur border-0">
          <p className="text-primary font-semibold text-sm mb-3">나의 건강 요약</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-bold text-warning">유의</p>
              <p className="text-xs text-muted-foreground">진단 상태</p>
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">45</p>
              <p className="text-xs text-muted-foreground">총 기록일</p>
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">38</p>
              <p className="text-xs text-muted-foreground">촬영 횟수</p>
            </div>
          </div>
        </Card>
      </div>

      {/* White Content Area */}
      <div className="bg-background rounded-t-3xl px-4 py-6 space-y-5 min-h-screen">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input 
            type="text"
            placeholder="혹시 장루가 피부보다 안쪽으로 쏙 들어가 있나요?"
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Daily Photo Capture Card */}
        <Card 
          className="p-4 border-0 shadow-md bg-card cursor-pointer hover:shadow-lg transition-shadow"
          onClick={handleStartDiagnosis}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Camera className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">일별 사진 촬영 바로가기</h3>
              <p className="text-xs text-muted-foreground mt-0.5">오늘 아직 사진을 촬영하지 않았어요! 하루 1회 촬영을 권장합니다</p>
              <div className="flex gap-2 mt-2">
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">의료기록</span>
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">안심관리</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Debug Button */}
        <Card 
          className="p-3 border-2 border-dashed border-warning/50 bg-warning/5 cursor-pointer hover:border-warning transition-colors"
          onClick={() => setView("debug")}
        >
          <div className="flex items-center gap-3">
            <Bug className="h-5 w-5 text-warning" />
            <div>
              <p className="font-medium text-warning text-sm">디버그 모드 (테스트용)</p>
              <p className="text-xs text-muted-foreground">서버 없이 AI 클래스를 직접 선택하여 문진 테스트</p>
            </div>
          </div>
        </Card>

        {/* Quick Action Icons */}
        <div className="grid grid-cols-3 gap-4">
          <Card 
            className="p-4 border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow text-center"
            onClick={() => navigate("/calendar")}
          >
            <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-rose-50 flex items-center justify-center">
              <FileText className="h-7 w-7 text-rose-400" />
            </div>
            <p className="text-sm font-medium text-foreground">진료기록</p>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-warning mt-1" />
          </Card>
          
          <Card 
            className="p-4 border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow text-center"
            onClick={() => navigate("/calendar")}
          >
            <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-pink-50 flex items-center justify-center">
              <Calendar className="h-7 w-7 text-pink-400" />
            </div>
            <p className="text-sm font-medium text-foreground">캘린더</p>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-warning mt-1" />
          </Card>
          
          <Card 
            className="p-4 border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow text-center"
            onClick={() => navigate("/info")}
          >
            <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-amber-50 flex items-center justify-center">
              <Gift className="h-7 w-7 text-amber-400" />
            </div>
            <p className="text-sm font-medium text-foreground">정보</p>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-warning mt-1" />
          </Card>
        </div>

        {/* Checklist Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">체크리스트</h3>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-primary">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-xs text-muted-foreground">최근 생성된 순</span>
          </div>
          
          <div className="space-y-2">
            {checklistItems.map((item) => (
              <Card 
                key={item.id}
                className={`p-4 border-0 shadow-sm ${item.completed ? 'bg-primary/5' : 'bg-card'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {item.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <div>
                      <span className={item.completed ? "text-foreground" : "text-foreground"}>
                        {item.label}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">@{item.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Banner - Meal Kit */}
        <Card className="p-5 border-0 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-1">장루 환자에 적합한<br/>밀키트를 구매하세요</h3>
            <p className="text-sm text-primary-foreground/80 mt-2">
              장루 관리에 부담이 적은 식단,<br/>맞춤 밀키트로 시작해보세요!
            </p>
          </div>
          <div className="absolute right-2 bottom-2 w-24 h-24 opacity-80">
            🍱
          </div>
        </Card>

        {/* Hospital Checklist Info */}
        <Card className="p-5 border-0 bg-primary/5">
          <h3 className="text-center font-bold text-primary mb-4">병원 가기 전 필수 체크리스트</h3>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li>-신분증 or 모바일 건강보험증</li>
            <li>-기저질환자의 경우 마스크 권장</li>
            <li>-응급의료시 상급종합병원 확인</li>
            <li className="text-xs">응급의료포털(E-Gen), www.e-gen.or.kr</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
