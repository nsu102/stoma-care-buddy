import { Card } from "@/components/ui/card";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Stethoscope,
  ClipboardList,
  Pill,
  BookOpen,
  Search,
  MapPin
} from "lucide-react";

const categories = [
  {
    id: "1",
    icon: Stethoscope,
    title: "장루란?",
    bgColor: "bg-emerald-100",
    iconColor: "text-emerald-600"
  },
  {
    id: "2",
    icon: ClipboardList,
    title: "장루 관리 방법",
    bgColor: "bg-sky-100",
    iconColor: "text-sky-600"
  },
  {
    id: "3",
    icon: Pill,
    title: "합병증 소개",
    bgColor: "bg-teal-100",
    iconColor: "text-teal-600"
  },
  {
    id: "4",
    icon: BookOpen,
    title: "관리 가이드",
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600"
  },
];

const faqs = [
  {
    question: "장루 파우치는 얼마나 자주 교체해야 하나요?",
    answer: "일반적으로 1-2일에서 3-4일에 한 번 교체합니다. 하지만 개인의 상태와 사용하는 제품에 따라 다를 수 있으니, 의료진의 지시를 따르세요."
  },
  {
    question: "장루 주변 피부가 빨갛게 졌어요. 어떻게 해야 하나요?",
    answer: "피부 자극의 원인을 파악하는 것이 중요합니다. 파우치 크기가 적절한지, 알레르기 반응은 없는지 확인하고, 증상이 지속되면 의료진과 상담하세요."
  },
  {
    question: "AI 분석은 어떻게 작동하나요?",
    answer: "루카 AI는 장루 이미지를 분석하여 합병증 위험도를 평가합니다. 이미지의 색상, 형태, 주변 피부 상태 등을 종합적으로 분석합니다."
  },
  {
    question: "운동을 해도 되나요?",
    answer: "대부분의 가벼운 운동은 가능합니다. 하지만 복부에 과도한 압력이 가해지는 운동은 피하는 것이 좋습니다. 의료진과 상담 후 운동 계획을 세우세요."
  },
];

export default function InfoPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">정보</h1>
          <p className="text-muted-foreground text-sm">장루 관리에 필요한 모든 정보</p>
        </div>

        {/* Categories */}
        <div>
          <h2 className="font-semibold text-foreground mb-4">카테고리</h2>
          <div className="grid grid-cols-4 gap-3">
            {categories.map((category) => (
              <div 
                key={category.id}
                className="flex flex-col items-center cursor-pointer"
              >
                <div className={`w-16 h-16 rounded-full ${category.bgColor} flex items-center justify-center mb-2`}>
                  <category.icon className={`h-7 w-7 ${category.iconColor}`} />
                </div>
                <span className="text-xs text-foreground text-center font-medium">{category.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Content */}
        <div>
          <h2 className="font-semibold text-foreground mb-4">추천 콘텐츠</h2>
          <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-primary via-primary to-sky-500">
            <div className="p-5 text-primary-foreground">
              <h3 className="text-lg font-bold mb-1">AI가 알려주는 건강한</h3>
              <h3 className="text-lg font-bold text-amber-300 mb-3">장루 관리 5가지 팁</h3>
              <p className="text-sm text-primary-foreground/80 leading-relaxed">
                매일의 작은 습관이 장루 건강을 지킵니다. AI 분석
                데이터를 기반으로 한 실천 가이드를 확인하세요.
              </p>
            </div>
          </Card>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="font-semibold text-foreground mb-4">자주 묻는 질문</h2>
          <div className="space-y-2">
            <Accordion type="single" collapsible className="w-full space-y-2">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-0 shadow-sm overflow-hidden">
                  <AccordionItem value={`item-${index}`} className="border-0">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline text-left">
                      <div className="flex items-center gap-3">
                        <Search className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm font-medium text-foreground">{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-0">
                      <p className="text-sm text-muted-foreground pl-7">{faq.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                </Card>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Office Information */}
        <div>
          <h2 className="font-semibold text-foreground mb-4">Office information</h2>
          <Card className="overflow-hidden border-0 shadow-sm">
            <div className="h-48 bg-muted relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-10 w-10 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">지도 정보를 불러오는 중...</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-foreground mb-1">장루 상담 센터</h3>
              <p className="text-sm text-muted-foreground">
                서울시 강남구 테헤란로 123<br />
                평일 09:00 - 18:00
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
