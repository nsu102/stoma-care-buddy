import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AppHeader } from "@/components/AppHeader";
import { 
  User, 
  Bell, 
  Moon,
  Shield,
  HelpCircle,
  FileText,
  ChevronRight,
  LogOut,
  Settings,
  Camera
} from "lucide-react";

const settingsGroups = [
  {
    title: "알림 설정",
    items: [
      { icon: Bell, label: "푸시 알림", type: "toggle", enabled: true },
      { icon: Camera, label: "촬영 리마인더", type: "toggle", enabled: true },
    ]
  },
  {
    title: "앱 설정",
    items: [
      { icon: Moon, label: "다크 모드", type: "toggle", enabled: false },
      { icon: Settings, label: "일반 설정", type: "link" },
    ]
  },
  {
    title: "지원",
    items: [
      { icon: HelpCircle, label: "도움말", type: "link" },
      { icon: FileText, label: "이용약관", type: "link" },
      { icon: Shield, label: "개인정보처리방침", type: "link" },
    ]
  },
];

export default function MyPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="마이페이지" />
      
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
              <User className="h-8 w-8 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">사용자님</h2>
              <p className="text-sm text-muted-foreground">장루 관리 시작일: 2025년 12월 1일</p>
            </div>
            <Button variant="outline" size="sm">
              편집
            </Button>
          </div>
        </Card>

        {/* Stats Card */}
        <Card className="p-5">
          <h3 className="font-semibold text-foreground mb-4">나의 기록 통계</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">28</p>
              <p className="text-xs text-muted-foreground">총 기록</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success">24</p>
              <p className="text-xs text-muted-foreground">양호</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">4</p>
              <p className="text-xs text-muted-foreground">주의</p>
            </div>
          </div>
        </Card>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIdx) => (
          <div key={groupIdx}>
            <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">
              {group.title}
            </h3>
            <Card className="overflow-hidden">
              {group.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  className={`flex items-center justify-between p-4 ${
                    itemIdx !== group.items.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium text-foreground">{item.label}</span>
                  </div>
                  {item.type === "toggle" ? (
                    <Switch defaultChecked={item.enabled} />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              ))}
            </Card>
          </div>
        ))}

        {/* Logout Button */}
        <Button variant="outline" className="w-full text-destructive hover:text-destructive">
          <LogOut className="h-4 w-4 mr-2" />
          로그아웃
        </Button>

        {/* App Version */}
        <p className="text-center text-xs text-muted-foreground">
          루카 v1.0.0
        </p>
      </div>
    </div>
  );
}
