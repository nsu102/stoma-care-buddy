import { useState } from "react";
import { Card } from "@/components/ui/card";
import { AppHeader } from "@/components/AppHeader";
import { Calendar } from "@/components/ui/calendar";
import { Camera, ClipboardList, FileText, ChevronRight } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";

interface DayRecord {
  date: Date;
  hasPhoto: boolean;
  hasQuestionnaire: boolean;
  hasMemo: boolean;
  status: "good" | "warning" | "danger";
}

// Mock data for demonstration
const mockRecords: DayRecord[] = [
  { date: new Date(2026, 0, 10), hasPhoto: true, hasQuestionnaire: true, hasMemo: false, status: "good" },
  { date: new Date(2026, 0, 11), hasPhoto: true, hasQuestionnaire: true, hasMemo: true, status: "good" },
  { date: new Date(2026, 0, 12), hasPhoto: true, hasQuestionnaire: false, hasMemo: true, status: "warning" },
  { date: new Date(2026, 0, 13), hasPhoto: true, hasQuestionnaire: true, hasMemo: false, status: "good" },
];

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const getRecordForDate = (date: Date) => {
    return mockRecords.find(r => isSameDay(r.date, date));
  };

  const selectedRecord = getRecordForDate(selectedDate);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good": return "bg-success";
      case "warning": return "bg-warning";
      case "danger": return "bg-destructive";
      default: return "bg-muted";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="캘린더" />
      
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Calendar */}
        <Card className="p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            locale={ko}
            className="w-full"
            modifiers={{
              hasRecord: mockRecords.map(r => r.date),
            }}
            modifiersStyles={{
              hasRecord: {
                fontWeight: "bold",
              },
            }}
            components={{
              DayContent: ({ date }) => {
                const record = getRecordForDate(date);
                return (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <span>{date.getDate()}</span>
                    {record && (
                      <span 
                        className={`absolute bottom-0 w-1.5 h-1.5 rounded-full ${getStatusColor(record.status)}`} 
                      />
                    )}
                  </div>
                );
              },
            }}
          />
        </Card>

        {/* Selected Date Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-foreground">
            {format(selectedDate, "M월 d일 EEEE", { locale: ko })}
          </h3>
        </div>

        {/* Record Boxes */}
        <div className="space-y-3">
          {/* 장루 촬영 기록 */}
          <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Camera className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">장루 촬영 기록</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedRecord?.hasPhoto ? "촬영 완료" : "기록 없음"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedRecord?.hasPhoto && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-primary-foreground ${getStatusColor(selectedRecord.status)}`}>
                    {selectedRecord.status === "good" ? "양호" : selectedRecord.status === "warning" ? "주의" : "위험"}
                  </span>
                )}
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </Card>

          {/* AI 문진 점검 기록 */}
          <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">AI 문진 점검 기록</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedRecord?.hasQuestionnaire ? "점검 완료" : "기록 없음"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedRecord?.hasQuestionnaire && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    완료
                  </span>
                )}
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </Card>

          {/* 개인 메모 */}
          <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">개인 메모</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedRecord?.hasMemo ? "메모 있음" : "메모 없음"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedRecord?.hasMemo && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                    1개
                  </span>
                )}
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
