import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight, Plus, Edit3, Trash2, X, Check, Loader2, AlertTriangle, Stethoscope, Save } from "lucide-react";
import iconCalendarHeader from "@/assets/icon-calendar-header.png";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns";
import { ko } from "date-fns/locale";
import { useDiagnosisHistory } from "@/hooks/useDiagnosisHistory";
import { useCalendarData } from "@/hooks/useCalendarData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarPage() {
  const { user } = useAuth();
  const { records, isLoading: diagnosisLoading, getRecordsByDate, getRecordsForMonth } = useDiagnosisHistory();
  const { 
    getMemoByDate, 
    getChecklistsByDate, 
    saveMemo, 
    addChecklistItem, 
    updateChecklistItem, 
    deleteChecklistItem, 
    toggleChecklistItem,
    isLoading: calendarLoading 
  } = useCalendarData();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("photo");
  
  // Memo state
  const [memoContent, setMemoContent] = useState("");
  const [isMemoEditing, setIsMemoEditing] = useState(false);
  const [isSavingMemo, setIsSavingMemo] = useState(false);
  
  // Checklist state
  const [newChecklistLabel, setNewChecklistLabel] = useState("");
  const [isAddingChecklist, setIsAddingChecklist] = useState(false);
  const [editingChecklistId, setEditingChecklistId] = useState<string | null>(null);
  const [editingChecklistLabel, setEditingChecklistLabel] = useState("");
  
  const isLoading = diagnosisLoading || calendarLoading;

  // Get records for selected date
  const selectedDateRecords = useMemo(() => 
    getRecordsByDate(selectedDate),
    [selectedDate, getRecordsByDate]
  );

  // Get memo and checklists for selected date
  const selectedDateMemo = useMemo(() => getMemoByDate(selectedDate), [selectedDate, getMemoByDate]);
  const selectedDateChecklists = useMemo(() => getChecklistsByDate(selectedDate), [selectedDate, getChecklistsByDate]);

  // Initialize memo content when date or memo changes
  useMemo(() => {
    if (!isMemoEditing) {
      setMemoContent(selectedDateMemo?.content || "");
    }
  }, [selectedDateMemo, selectedDate, isMemoEditing]);

  // Handlers
  const handleSaveMemo = async () => {
    setIsSavingMemo(true);
    const result = await saveMemo(selectedDate, memoContent);
    setIsSavingMemo(false);
    
    if (result.success) {
      toast.success("메모가 저장되었습니다");
      setIsMemoEditing(false);
    } else {
      toast.error(result.error || "메모 저장에 실패했습니다");
    }
  };

  const handleAddChecklist = async () => {
    if (!newChecklistLabel.trim()) return;
    
    const result = await addChecklistItem(selectedDate, newChecklistLabel.trim());
    if (result.success) {
      setNewChecklistLabel("");
      setIsAddingChecklist(false);
      toast.success("체크리스트가 추가되었습니다");
    } else {
      toast.error(result.error || "추가에 실패했습니다");
    }
  };

  const handleUpdateChecklist = async (id: string) => {
    if (!editingChecklistLabel.trim()) return;
    
    const result = await updateChecklistItem(id, { label: editingChecklistLabel.trim() });
    if (result.success) {
      setEditingChecklistId(null);
      setEditingChecklistLabel("");
      toast.success("수정되었습니다");
    } else {
      toast.error(result.error || "수정에 실패했습니다");
    }
  };

  const handleDeleteChecklist = async (id: string) => {
    const result = await deleteChecklistItem(id);
    if (result.success) {
      toast.success("삭제되었습니다");
    } else {
      toast.error(result.error || "삭제에 실패했습니다");
    }
  };

  const handleToggleChecklist = async (id: string) => {
    await toggleChecklistItem(id);
  };

  const startEditingChecklist = (id: string, label: string) => {
    setEditingChecklistId(id);
    setEditingChecklistLabel(label);
  };

  // Get records for current month to display dots
  const monthRecords = useMemo(() => 
    getRecordsForMonth(currentMonth.getFullYear(), currentMonth.getMonth()),
    [currentMonth, getRecordsForMonth]
  );

  // Get the highest risk level for a date (0=정상, 1=주의, 2=위험)
  const getDateStatus = (date: Date): "good" | "warning" | "danger" | null => {
    const dateRecords = getRecordsByDate(date);
    if (dateRecords.length === 0) return null;
    
    const maxRisk = Math.max(...dateRecords.map(r => r.risk_level ?? 0));
    if (maxRisk >= 2) return "danger";  // 위험도 2 = 위험
    if (maxRisk >= 1) return "warning"; // 위험도 1 = 주의
    return "good";                       // 위험도 0 = 정상
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
          <img src={iconCalendarHeader} alt="루커 캘린더" className="w-20 h-20 object-contain mb-4" />
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

                  <TabsContent value="diagnosis" className="mt-0 space-y-4">
                    {selectedDateRecords.length > 0 ? (
                      selectedDateRecords.map((record) => (
                        <Card key={record.id} className={`p-5 border-2 shadow-sm ${
                          record.risk_level === 2 ? "border-destructive/30" :
                          record.risk_level === 1 ? "border-warning/30" :
                          "border-success/30"
                        }`}>
                          {/* 헤더: 진단명 + 위험도 (0=정상, 1=주의, 2=위험) */}
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-bold text-lg text-foreground">{record.diagnosis}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              record.risk_level === 2 ? "bg-destructive/10 text-destructive" :
                              record.risk_level === 1 ? "bg-warning/10 text-warning" :
                              "bg-success/10 text-success"
                            }`}>
                              위험도 {record.risk_level === 2 ? "높음" : record.risk_level === 1 ? "중간" : "낮음"}
                            </span>
                          </div>

                          {/* 이미지 (있는 경우) */}
                          {record.image_url && (
                            <div className="aspect-video bg-muted rounded-xl overflow-hidden mb-4">
                              <img 
                                src={record.image_url} 
                                alt="장루 이미지" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          {/* 진단 설명 */}
                          {record.description && (
                            <div className="mb-4">
                              <h5 className="text-sm font-semibold text-foreground mb-1">진단 설명</h5>
                              <p className="text-sm text-muted-foreground leading-relaxed">{record.description}</p>
                            </div>
                          )}

                          {/* 긴급 알림 */}
                          {record.emergency_alert && (
                            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
                              <h5 className="text-sm font-semibold text-destructive mb-2 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                긴급 알림
                              </h5>
                              <p className="text-sm text-destructive leading-relaxed whitespace-pre-line">{record.emergency_alert}</p>
                            </div>
                          )}

                          {/* 권장 조치 (advice) */}
                          {record.advice && (
                            <div className="mb-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                              <h5 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                                <Stethoscope className="h-4 w-4" />
                                권장 조치
                              </h5>
                              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{record.advice}</p>
                            </div>
                          )}

                          {/* 추가 정보 */}
                          <div className="flex flex-wrap gap-3 text-xs">
                            {record.sacs_grade && (
                              <span className="px-2 py-1 bg-primary/10 text-primary rounded-md">
                                SACS 등급: {record.sacs_grade}
                              </span>
                            )}
                            {record.brightness !== null && record.brightness !== undefined && (
                              <span className="px-2 py-1 bg-muted text-muted-foreground rounded-md">
                                밝기: {record.brightness.toFixed(1)}
                              </span>
                            )}
                          </div>

                          {/* 시간 */}
                          <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border">
                            {format(new Date(record.created_at), "yyyy년 M월 d일 a h:mm", { locale: ko })} 진단
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
                    <Card className="p-4 border-0 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-foreground">오늘의 메모</h4>
                        {!isMemoEditing ? (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setIsMemoEditing(true)}
                            className="text-primary"
                          >
                            <Edit3 className="h-4 w-4 mr-1" />
                            수정
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setIsMemoEditing(false);
                                setMemoContent(selectedDateMemo?.content || "");
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={handleSaveMemo}
                              disabled={isSavingMemo}
                            >
                              {isSavingMemo ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Save className="h-4 w-4 mr-1" />
                                  저장
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {isMemoEditing ? (
                        <Textarea
                          value={memoContent}
                          onChange={(e) => setMemoContent(e.target.value)}
                          placeholder="오늘의 상태, 느낌, 특이사항 등을 기록하세요..."
                          className="min-h-[150px] resize-none"
                        />
                      ) : (
                        <div className="min-h-[100px] text-sm text-muted-foreground whitespace-pre-wrap">
                          {memoContent || "메모가 없습니다. 수정 버튼을 눌러 작성해보세요."}
                        </div>
                      )}
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Checklist */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">
                    {format(selectedDate, "M월 d일", { locale: ko })} 체크리스트
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsAddingChecklist(true)}
                    className="text-primary"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    추가
                  </Button>
                </div>

                <div className="space-y-2">
                  {/* Add new checklist input */}
                  {isAddingChecklist && (
                    <Card className="p-3 border-0 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Input
                          value={newChecklistLabel}
                          onChange={(e) => setNewChecklistLabel(e.target.value)}
                          placeholder="새 할 일 입력..."
                          className="flex-1"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddChecklist();
                            if (e.key === "Escape") {
                              setIsAddingChecklist(false);
                              setNewChecklistLabel("");
                            }
                          }}
                          autoFocus
                        />
                        <Button size="icon" className="h-9 w-9" onClick={handleAddChecklist}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9"
                          onClick={() => {
                            setIsAddingChecklist(false);
                            setNewChecklistLabel("");
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  )}

                  {selectedDateChecklists.length > 0 ? (
                    selectedDateChecklists.map((item) => (
                      <Card 
                        key={item.id}
                        className={`p-4 border-0 shadow-sm ${item.completed ? 'bg-primary/5' : 'bg-card'}`}
                      >
                        <div className="flex items-center justify-between">
                          {editingChecklistId === item.id ? (
                            <div className="flex items-center gap-2 flex-1 mr-2">
                              <Input
                                value={editingChecklistLabel}
                                onChange={(e) => setEditingChecklistLabel(e.target.value)}
                                className="flex-1"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleUpdateChecklist(item.id);
                                  if (e.key === "Escape") {
                                    setEditingChecklistId(null);
                                    setEditingChecklistLabel("");
                                  }
                                }}
                                autoFocus
                              />
                              <Button size="icon" className="h-8 w-8" onClick={() => handleUpdateChecklist(item.id)}>
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => {
                                  setEditingChecklistId(null);
                                  setEditingChecklistLabel("");
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div 
                                className="flex items-center gap-3 cursor-pointer flex-1"
                                onClick={() => handleToggleChecklist(item.id)}
                              >
                                <Checkbox 
                                  checked={item.completed}
                                  onCheckedChange={() => handleToggleChecklist(item.id)}
                                  className="h-5 w-5"
                                />
                                <span className={`text-foreground ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                                  {item.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-muted-foreground"
                                  onClick={() => startEditingChecklist(item.id, item.label)}
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => handleDeleteChecklist(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      </Card>
                    ))
                  ) : !isAddingChecklist ? (
                    <div className="text-center py-8 text-muted-foreground">
                      체크리스트가 없습니다.<br />
                      <span className="text-sm">추가 버튼을 눌러 할 일을 추가해보세요.</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
