import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/AppHeader";
import { Calendar } from "@/components/ui/calendar";
import { ChevronLeft, ChevronRight, Camera, AlertCircle, CheckCircle } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";

interface DayRecord {
  date: Date;
  hasPhoto: boolean;
  status: "good" | "warning" | "danger";
}

// Mock data for demonstration
const mockRecords: DayRecord[] = [
  { date: new Date(2026, 0, 10), hasPhoto: true, status: "good" },
  { date: new Date(2026, 0, 11), hasPhoto: true, status: "good" },
  { date: new Date(2026, 0, 12), hasPhoto: true, status: "warning" },
  { date: new Date(2026, 0, 13), hasPhoto: true, status: "good" },
];

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

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

  const getStatusText = (status: string) => {
    switch (status) {
      case "good": return "양호";
      case "warning": return "주의";
      case "danger": return "위험";
      default: return "기록 없음";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="캘린더" />
      
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* View Toggle */}
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <Button
            variant={viewMode === "month" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setViewMode("month")}
          >
            월별
          </Button>
          <Button
            variant={viewMode === "week" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setViewMode("week")}
          >
            주별
          </Button>
        </div>

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

        {/* Selected Date Info */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">
              {format(selectedDate, "M월 d일 EEEE", { locale: ko })}
            </h3>
            {selectedRecord && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium text-primary-foreground ${getStatusColor(selectedRecord.status)}`}>
                {getStatusText(selectedRecord.status)}
              </span>
            )}
          </div>

          {selectedRecord ? (
            <div className="space-y-4">
              {/* Photo placeholder */}
              <div className="aspect-video bg-muted rounded-xl flex items-center justify-center">
                <Camera className="h-10 w-10 text-muted-foreground" />
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                {selectedRecord.status === "good" ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-warning" />
                )}
                <span className="text-muted-foreground">
                  AI 분석 결과: {getStatusText(selectedRecord.status)}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                이 날짜의 기록이 없습니다
              </p>
              <Button variant="outline" size="sm" className="mt-4">
                기록 추가하기
              </Button>
            </div>
          )}
        </Card>

        {/* Recent Records */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">최근 기록</h3>
          <div className="space-y-2">
            {mockRecords.slice().reverse().map((record, idx) => (
              <Card 
                key={idx} 
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedDate(record.date)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(record.status)}`} />
                    <span className="font-medium">
                      {format(record.date, "M월 d일", { locale: ko })}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {getStatusText(record.status)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
