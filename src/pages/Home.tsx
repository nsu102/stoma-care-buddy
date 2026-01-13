import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppHeader } from "@/components/AppHeader";
import { CameraCapture } from "@/components/CameraCapture";
import { QuestionnaireStep } from "@/components/QuestionnaireStep";
import { DiagnosisResult } from "@/components/DiagnosisResult";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { StepIndicator } from "@/components/StepIndicator";
import { uploadImage, startQuestionnaire, type QuestionResponse } from "@/lib/api";
import { 
  Camera, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  TrendingUp,
  Droplets,
  ShieldCheck,
  ChevronRight
} from "lucide-react";

type HomeView = "main" | "camera" | "questionnaire" | "result";

const todayChecklist = [
  { id: 1, label: "아침 장루 상태 확인", completed: true },
  { id: 2, label: "파우치 교체", completed: false },
  { id: 3, label: "피부 보호제 사용", completed: false },
  { id: 4, label: "수분 섭취 체크", completed: true },
];

export default function Home() {
  const navigate = useNavigate();
  const [view, setView] = useState<HomeView>("main");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  
  // Diagnosis state
  const [correctedImageUrl, setCorrectedImageUrl] = useState<string | null>(null);
  const [brightnessMessage, setBrightnessMessage] = useState<string | null>(null);
  const [aiClass, setAiClass] = useState<string>("");
  const [currentStage, setCurrentStage] = useState<string>("START");
  const [currentQuestion, setCurrentQuestion] = useState<QuestionResponse | null>(null);
  const [finalResult, setFinalResult] = useState<QuestionResponse | null>(null);

  const resetDiagnosis = useCallback(() => {
    setCorrectedImageUrl(null);
    setBrightnessMessage(null);
    setAiClass("");
    setCurrentStage("START");
    setCurrentQuestion(null);
    setFinalResult(null);
  }, []);

  const handleStartDiagnosis = useCallback(() => {
    resetDiagnosis();
    setView("camera");
  }, [resetDiagnosis]);

  const handleImageCapture = useCallback(async (imageBlob: Blob) => {
    try {
      setIsLoading(true);
      setLoadingMessage("이미지 분석 중...");
      
      const uploadResult = await uploadImage(imageBlob);
      setCorrectedImageUrl(uploadResult.corrected_image_url);
      setBrightnessMessage(uploadResult.brightness_message || null);
      setAiClass(uploadResult.necrosis_class);

      setLoadingMessage("문진 준비 중...");
      const questionResult = await startQuestionnaire("START", uploadResult.necrosis_class);
      
      if (questionResult.type === "question") {
        setCurrentQuestion(questionResult);
        setCurrentStage(questionResult.stage || "START");
        setView("questionnaire");
      } else if (questionResult.type === "result") {
        setFinalResult(questionResult);
        setView("result");
      }
    } catch (error) {
      console.error("Error during image upload:", error);
      alert("이미지 업로드 중 오류가 발생했습니다. 다시 시도해주세요.");
      setView("main");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleOptionSelect = useCallback(async (selectedIndex: number) => {
    if (!currentQuestion) return;

    try {
      setIsLoading(true);
      setLoadingMessage("다음 질문 준비 중...");

      const nextQuestion = await startQuestionnaire(
        currentStage,
        aiClass,
        selectedIndex
      );

      if (nextQuestion.type === "question") {
        setCurrentQuestion(nextQuestion);
        setCurrentStage(nextQuestion.stage || currentStage);
      } else if (nextQuestion.type === "result") {
        setFinalResult(nextQuestion);
        setView("result");
      }
    } catch (error) {
      console.error("Error during questionnaire:", error);
      alert("문진 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [currentQuestion, currentStage, aiClass]);

  const handleGoHome = useCallback(() => {
    resetDiagnosis();
    setView("main");
  }, [resetDiagnosis]);

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
            question={currentQuestion.question || ""}
            options={currentQuestion.options || []}
            onSelect={handleOptionSelect}
            isLoading={isLoading}
            stage={currentStage}
          />
        </div>
        {isLoading && <LoadingOverlay message={loadingMessage} />}
      </div>
    );
  }

  // Result view
  if (view === "result" && finalResult) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="max-w-lg mx-auto px-4 py-6">
          <StepIndicator currentStep="result" />
          <DiagnosisResult
            result={finalResult}
            correctedImageUrl={correctedImageUrl || finalResult.corrected_image_url}
            brightnessMessage={brightnessMessage || finalResult.brightness_message}
            onGoHome={handleGoHome}
            onViewHistory={() => navigate("/calendar")}
          />
        </div>
      </div>
    );
  }

  // Main home view
  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader />
      
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* AI Status Card */}
        <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-primary to-primary/80">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-primary-foreground/80 text-sm font-medium">오늘의 AI 예측</p>
              <h2 className="text-2xl font-bold text-primary-foreground mt-1">양호한 상태</h2>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 bg-primary-foreground/20 rounded-full h-2">
              <div className="bg-primary-foreground h-2 rounded-full w-[85%]" />
            </div>
            <span className="text-primary-foreground font-semibold">85%</span>
          </div>
          
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5 text-primary-foreground/90 text-sm">
              <TrendingUp className="h-4 w-4" />
              <span>상승 추세</span>
            </div>
            <div className="flex items-center gap-1.5 text-primary-foreground/90 text-sm">
              <Droplets className="h-4 w-4" />
              <span>수분 양호</span>
            </div>
          </div>
        </Card>

        {/* Quick Capture Button */}
        <Button
          onClick={handleStartDiagnosis}
          className="w-full h-14 text-base font-semibold shadow-primary"
          size="lg"
        >
          <Camera className="mr-2 h-5 w-5" />
          빠른 촬영
        </Button>

        {/* Today's Checklist */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              오늘의 체크리스트
            </h3>
            <span className="text-sm text-muted-foreground">
              {todayChecklist.filter(i => i.completed).length}/{todayChecklist.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {todayChecklist.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
              >
                {item.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
                <span className={item.completed ? "text-muted-foreground line-through" : "text-foreground"}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Card 
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate("/calendar")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">이번 주</p>
                <p className="text-lg font-semibold text-foreground">기록 5회</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
          
          <Card 
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate("/info")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">관리 팁</p>
                <p className="text-lg font-semibold text-foreground">새 글 3개</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted-foreground pt-4">
          본 서비스는 참고용이며, 정확한 진단은<br />
          반드시 의료 전문가와 상담하세요.
        </p>
      </div>
    </div>
  );
}
