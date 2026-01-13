import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Plus, Edit3, Trash2, CheckCircle2, Circle, FolderOpen, Loader2 } from "lucide-react";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns";
import { ko } from "date-fns/locale";
import { useDiagnosisHistory } from "@/hooks/useDiagnosisHistory";
import { useAuth } from "@/contexts/AuthContext";

const checklistItems = [
  { id: 1, label: "장루 주변 연고 바르기", date: "25/01/27", completed: true },
  { id: 2, label: "항생제 복용", date: "25/01/27", completed: false },
];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarPage() {
  const { user } = useAuth();
  const { records, isLoading, getRecordsByDate, getRecordsForMonth } = useDiagnosisHistory();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("photo");

  // Get records for selected date
  const selectedDateRecords = useMemo(() => 
    getRecordsByDate(selectedDate),
    [selectedDate, getRecordsByDate]
  );

  // Get records for current month to display dots
  const monthRecords = useMemo(() => 
    getRecordsForMonth(currentMonth.getFullYear(), currentMonth.getMonth()),
    [currentMonth, getRecordsForMonth]
  );

  // Get the highest risk level for a date
  const getDateStatus = (date: Date): "good" | "warning" | "danger" | null => {
    const dateRecords = getRecordsByDate(date);
    if (dateRecords.length === 0) return null;
    
    const maxRisk = Math.max(...dateRecords.map(r => r.risk_level || 1));
    if (maxRisk >= 3) return "danger";
    if (maxRisk >= 2) return "warning";
    return "good";
  };

  const getStatusDotColor = (status: string | null) => {
    switch (status) {
      case "good": return "bg-success";
      case "warning": return "bg-warning";
      case "danger": return "bg-destructive";
      default: return "";
    }
  };

  const getDayCircleStyle = (date: Date, status: string | null, isSelected: boolean) => {
    if (isSelected) {
      return "bg-primary text-primary-foreground";
    }
    if (status) {
      if (status === "danger") {
        return "bg-rose-100 text-rose-600";
      }
      if (status === "good") {
        return "border-2 border-primary text-primary";
      }
      if (status === "warning") {
        return "bg-warning/20 text-warning";
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
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  // Create array with empty slots for days before month starts
  const calendarDays: (Date | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  daysInMonth.forEach(day => calendarDays.push(day));

  // Get the latest record date for display
  const latestRecord = records.length > 0 ? records[0] : null;

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
          <p className="text-primary-foreground/70 text-sm">
            {latestRecord 
              ? `최근 검사: ${format(new Date(latestRecord.created_at), "yyyy. M. d a h:mm", { locale: ko })}`
              : "아직 검사 기록이 없습니다"
            }
          </p>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="bg-background rounded-t-3xl min-h-screen">
        <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
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
                    const status = getDateStatus(day);
                    const isSelected = isSameDay(day, selectedDate);
                    const isToday = isSameDay(day, new Date());

                    return (
                      <div key={day.toISOString()} className="flex flex-col items-center">
                        <button
                          onClick={() => setSelectedDate(day)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${getDayCircleStyle(day, status, isSelected)}`}
                        >
                          {day.getDate()}
                        </button>
                        {status && (
                          <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${getStatusDotColor(status)}`} />
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
                      value="diagnosis" 
                      className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
                    >
                      진단 결과
                    </TabsTrigger>
                    <TabsTrigger 
                      value="memo" 
                      className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
                    >
                      메모
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="photo" className="mt-0 space-y-3">
                    {selectedDateRecords.length > 0 ? (
                      selectedDateRecords.map((record) => (
                        <Card key={record.id} className="p-4 border-0 shadow-sm">
                          {record.image_url ? (
                            <div className="aspect-video bg-muted rounded-xl overflow-hidden">
                              <img 
                                src={record.image_url} 
                                alt="장루 촬영 이미지" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="aspect-video bg-muted rounded-xl flex items-center justify-center">
                              <span className="text-muted-foreground">이미지 없음</span>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-3 text-center">
                            {format(new Date(record.created_at), "a h:mm", { locale: ko })} 촬영
                          </p>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        촬영 기록이 없습니다
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="diagnosis" className="mt-0 space-y-3">
                    {selectedDateRecords.length > 0 ? (
                      selectedDateRecords.map((record) => (
                        <Card key={record.id} className="p-4 border-0 shadow-sm">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-foreground">{record.diagnosis}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                              record.risk_level === 3 ? "bg-destructive/10 text-destructive" :
                              record.risk_level === 2 ? "bg-warning/10 text-warning" :
                              "bg-success/10 text-success"
                            }`}>
                              {record.risk_level === 3 ? "위험" : record.risk_level === 2 ? "유의" : "정상"}
                            </span>
                          </div>
                          
                          {record.description && (
                            <div className="bg-muted/50 rounded-lg p-3 mb-3">
                              <p className="text-xs font-medium text-primary mb-1">💊 처방 및 조언</p>
                              <p className="text-sm text-foreground whitespace-pre-line">{record.description}</p>
                            </div>
                          )}
                          
                          {record.sacs_grade && (
                            <p className="text-xs text-primary">SACS 등급: {record.sacs_grade}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(record.created_at), "a h:mm", { locale: ko })}
                          </p>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        진단 기록이 없습니다
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="memo" className="mt-0">
                    <div className="text-center py-8 text-muted-foreground">
                      메모 기능은 준비 중입니다
                    </div>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
