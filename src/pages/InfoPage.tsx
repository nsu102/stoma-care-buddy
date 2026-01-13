import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/AppHeader";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  BookOpen, 
  HelpCircle, 
  Sparkles, 
  Heart,
  Shield,
  Droplets,
  ChevronRight
} from "lucide-react";

const careGuides = [
  {
    id: "1",
    icon: Shield,
    title: "장루 기본 관리법",
    description: "일상적인 장루 관리의 기초를 배워보세요",
    category: "기본"
  },
  {
    id: "2",
    icon: Droplets,
    title: "파우치 교체 가이드",
    description: "올바른 파우치 교체 방법과 시기",
    category: "실습"
  },
  {
    id: "3",
    icon: Heart,
    title: "피부 관리와 트러블 예방",
    description: "건강한 장루 주변 피부를 유지하는 방법",
    category: "관리"
  },
  {
    id: "4",
    icon: Sparkles,
    title: "AI 진단 활용법",
    description: "루카 AI를 효과적으로 활용하는 방법",
    category: "AI"
  },
];

const faqs = [
  {
    question: "장루 파우치는 얼마나 자주 교체해야 하나요?",
    answer: "일반적으로 1-2일에서 3-4일에 한 번 교체합니다. 하지만 개인의 상태와 사용하는 제품에 따라 다를 수 있으니, 의료진의 지시를 따르세요."
  },
  {
    question: "장루 주변 피부가 빨갛게 되었어요. 어떻게 해야 하나요?",
    answer: "피부 자극의 원인을 파악하는 것이 중요합니다. 파우치 크기가 적절한지, 알레르기 반응은 없는지 확인하고, 증상이 지속되면 의료진과 상담하세요."
  },
  {
    question: "AI 진단 결과는 얼마나 정확한가요?",
    answer: "루카 AI는 참고용 도구입니다. 정확도 향상을 위해 지속적으로 개선되고 있지만, 정확한 진단은 반드시 의료 전문가와 상담하세요."
  },
  {
    question: "촬영할 때 어떤 점을 주의해야 하나요?",
    answer: "밝은 조명에서 장루가 화면 중앙에 오도록 촬영해주세요. 흔들림 없이 선명하게 촬영하면 AI 분석 정확도가 높아집니다."
  },
  {
    question: "진단 기록은 어디에 저장되나요?",
    answer: "모든 진단 기록은 안전하게 서버에 저장되며, 캘린더 탭에서 날짜별로 확인할 수 있습니다."
  },
];

export default function InfoPage() {
  const [activeTab, setActiveTab] = useState<"guides" | "faq" | "ai">("guides");

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="정보" />
      
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <Button
            variant={activeTab === "guides" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab("guides")}
          >
            <BookOpen className="h-4 w-4 mr-1" />
            관리 정보
          </Button>
          <Button
            variant={activeTab === "faq" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab("faq")}
          >
            <HelpCircle className="h-4 w-4 mr-1" />
            FAQ
          </Button>
          <Button
            variant={activeTab === "ai" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab("ai")}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            AI 팁
          </Button>
        </div>

        {/* Guides Tab */}
        {activeTab === "guides" && (
          <div className="space-y-3">
            {careGuides.map((guide) => (
              <Card 
                key={guide.id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                    <guide.icon className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                        {guide.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground truncate">{guide.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{guide.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === "faq" && (
          <Card className="p-4">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-sm font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        )}

        {/* AI Tips Tab */}
        {activeTab === "ai" && (
          <div className="space-y-4">
            <Card className="p-5 border-primary/20 bg-accent/30">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">AI 진단 활용 팁</h3>
                  <p className="text-sm text-muted-foreground">
                    루카 AI를 더 효과적으로 활용하는 방법을 알아보세요.
                  </p>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              <Card className="p-4">
                <h4 className="font-medium text-foreground mb-2">📸 촬영 팁</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 밝은 자연광이나 조명에서 촬영하세요</li>
                  <li>• 장루가 화면 중앙에 오도록 위치시키세요</li>
                  <li>• 흔들림 없이 안정적으로 촬영하세요</li>
                </ul>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium text-foreground mb-2">📊 분석 결과 이해하기</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <span className="text-success font-medium">양호</span>: 정상적인 상태입니다</li>
                  <li>• <span className="text-warning font-medium">주의</span>: 관찰이 필요한 상태입니다</li>
                  <li>• <span className="text-destructive font-medium">위험</span>: 즉시 의료진 상담이 필요합니다</li>
                </ul>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium text-foreground mb-2">🔄 정기 기록의 중요성</h4>
                <p className="text-sm text-muted-foreground">
                  매일 같은 시간에 기록하면 AI가 변화 추이를 더 정확하게 분석할 수 있습니다.
                  규칙적인 기록 습관을 들여보세요.
                </p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
