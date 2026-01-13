import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Plus, Edit3, Trash2, CheckCircle2, Circle, FolderOpen } from "lucide-react";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns";
import { ko } from "date-fns/locale";

interface DayRecord {
  date: Date;
  hasPhoto: boolean;
  hasQuestionnaire: boolean;
  hasMemo: boolean;
  status: "good" | "warning" | "danger";
}

interface ChatMessage {
  id: number;
  sender: "ai" | "user";
  name?: string;
  message: string;
  time: string;
}

// Mock data
const mockRecords: DayRecord[] = [
  { date: new Date(2026, 0, 13), hasPhoto: true, hasQuestionnaire: true, hasMemo: false, status: "danger" },
  { date: new Date(2026, 0, 14), hasPhoto: true, hasQuestionnaire: true, hasMemo: false, status: "danger" },
  { date: new Date(2026, 0, 15), hasPhoto: true, hasQuestionnaire: true, hasMemo: true, status: "danger" },
  { date: new Date(2026, 0, 16), hasPhoto: true, hasQuestionnaire: true, hasMemo: false, status: "danger" },
  { date: new Date(2026, 0, 17), hasPhoto: true, hasQuestionnaire: true, hasMemo: false, status: "danger" },
  { date: new Date(2026, 0, 18), hasPhoto: true, hasQuestionnaire: true, hasMemo: true, status: "good" },
  { date: new Date(2026, 0, 19), hasPhoto: true, hasQuestionnaire: true, hasMemo: false, status: "good" },
  { date: new Date(2026, 0, 20), hasPhoto: true, hasQuestionnaire: true, hasMemo: true, status: "good" },
  { date: new Date(2026, 0, 23), hasPhoto: true, hasQuestionnaire: true, hasMemo: true, status: "good" },
  { date: new Date(2026, 0, 25), hasPhoto: true, hasQuestionnaire: true, hasMemo: true, status: "good" },
  { date: new Date(2026, 0, 26), hasPhoto: false, hasQuestionnaire: false, hasMemo: false, status: "warning" },
];

const mockChatMessages: ChatMessage[] = [
  { id: 1, sender: "ai", name: "김교수 | 루카 AI", message: "안녕하세요, 지금히 정상입니다.\n너무 세게 닦지 마세요.", time: "오전 9:00" },
  { id: 2, sender: "user", message: "넵, 감사합니다.\n다음부터는 주의하도록 하겠습니다.", time: "오전 9:15" },
];

const checklistItems = [
  { id: 1, label: "장루 주변 연고 바르기", date: "25/01/27", completed: true },
  { id: 2, label: "항생제 복용", date: "25/01/27", completed: false },
];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 0, 23));
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2026, 0, 1));
  const [activeTab, setActiveTab] = useState("questionnaire");

  const getRecordForDate = (date: Date) => {
    return mockRecords.find(r => isSameDay(r.date, date));
  };

  const selectedRecord = getRecordForDate(selectedDate);

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case "good": return "bg-success";
      case "warning": return "bg-warning";
      case "danger": return "bg-destructive";
      default: return "";
    }
  };

  const getDayCircleStyle = (date: Date, record: DayRecord | undefined, isSelected: boolean) => {
    if (isSelected) {
      return "bg-primary text-primary-foreground";
    }
    if (record) {
      if (record.status === "danger") {
        return "bg-rose-100 text-rose-600";
      }
      if (record.status === "good") {
        return "border-2 border-primary text-primary";
      }
    }
    return "text-foreground";
  };

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get the day of week for the first day (0 = Sunday, we need Monday = 0)
  let startDayOfWeek = getDay(monthStart);
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Convert to Monday-based

  // Create array with empty slots for days before month starts
  const calendarDays: (Date | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  daysInMonth.forEach(day => calendarDays.push(day));

  return (
    <div className="min-h-screen bg-primary pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" className="text-primary-foreground" onClick={() => window.history.back()}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="w-10 h-10 rounded-full bg-primary-foreground/20 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center text-sm">
              👤
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-primary-foreground/20 rounded-2xl flex items-center justify-center mb-4">
            <FolderOpen className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-primary-foreground mb-1">루커 캘린더</h1>
          <p className="text-primary-foreground/70 text-sm">최근 검사: 2026. 1. 23 오전 9:00</p>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="bg-background rounded-t-3xl min-h-screen">
        <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
          <Card className="p-4 border-0 shadow-sm">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="text-center">
                <p className="font-semibold text-lg">{format(currentMonth, "M월", { locale: ko })}</p>
                <p className="text-xs text-muted-foreground">{format(currentMonth, "yyyy")}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 mb-2">
              {WEEKDAYS.map((day) => (
                <div key={day} className="text-center text-xs text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-y-1">
              {calendarDays.map((day, idx) => {
                if (!day) {
                  return <div key={`empty-${idx}`} className="h-10" />;
                }
                const record = getRecordForDate(day);
                const isSelected = isSameDay(day, selectedDate);
                const hasSpecialLabel = day.getDate() === 26 && day.getMonth() === 0;

                return (
                  <div key={day.toISOString()} className="flex flex-col items-center">
                    <button
                      onClick={() => setSelectedDate(day)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${getDayCircleStyle(day, record, isSelected)}`}
                    >
                      {day.getDate()}
                    </button>
                    {hasSpecialLabel && (
                      <span className="text-[10px] text-primary mt-0.5">정기 검진</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-destructive" />
                <span className="text-xs text-muted-foreground">위험</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-warning" />
                <span className="text-xs text-muted-foreground">유의</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-success" />
                <span className="text-xs text-muted-foreground">정상</span>
              </div>
            </div>
          </Card>

          {/* Selected Date Records */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">
              {format(selectedDate, "M월 d일", { locale: ko })} 기록
            </h3>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full bg-transparent border-b border-border rounded-none h-auto p-0 mb-4">
                <TabsTrigger 
                  value="photo" 
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
                >
                  장루 촬영 기록
                </TabsTrigger>
                <TabsTrigger 
                  value="questionnaire" 
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
                >
                  문진 점검 기록
                </TabsTrigger>
                <TabsTrigger 
                  value="memo" 
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
                >
                  메모
                </TabsTrigger>
              </TabsList>

              <TabsContent value="photo" className="mt-0">
                {selectedRecord?.hasPhoto ? (
                  <Card className="p-4 border-0 shadow-sm">
                    <div className="aspect-video bg-muted rounded-xl flex items-center justify-center">
                      <span className="text-4xl">📷</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3 text-center">촬영된 이미지가 여기에 표시됩니다</p>
                  </Card>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    촬영 기록이 없습니다
                  </div>
                )}
              </TabsContent>

              <TabsContent value="questionnaire" className="mt-0 space-y-3">
                <p className="text-xs text-muted-foreground">09:00 문진</p>
                
                {mockChatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] ${msg.sender === "user" ? "" : ""}`}>
                      {msg.sender === "ai" && (
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">
                            👨‍⚕️
                          </div>
                          <span className="text-xs font-medium text-foreground">{msg.name}</span>
                        </div>
                      )}
                      <div className={`px-4 py-3 rounded-2xl ${
                        msg.sender === "user" 
                          ? "bg-primary text-primary-foreground rounded-br-md" 
                          : "bg-muted text-foreground rounded-bl-md ml-10"
                      }`}>
                        <p className="text-sm whitespace-pre-line">{msg.message}</p>
                      </div>
                      <p className={`text-[10px] text-muted-foreground mt-1 ${msg.sender === "user" ? "text-right" : "ml-10"}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end pt-2">
                  <Button size="icon" className="rounded-full h-12 w-12 shadow-lg">
                    <Plus className="h-6 w-6" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="memo" className="mt-0">
                {selectedRecord?.hasMemo ? (
                  <Card className="p-4 border-0 shadow-sm">
                    <p className="text-sm text-foreground">오늘 장루 상태가 좋았다. 피부 자극도 없고 편안했다.</p>
                  </Card>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    메모가 없습니다
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">체크리스트</h3>
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
                        <span className="text-foreground">{item.label}</span>
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
        </div>
      </div>
    </div>
  );
}
