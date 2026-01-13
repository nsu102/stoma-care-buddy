import { Home, Calendar, BookOpen, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Home, label: "홈" },
  { path: "/calendar", icon: Calendar, label: "캘린더" },
  { path: "/info", icon: BookOpen, label: "정보" },
  { path: "/mypage", icon: User, label: "마이페이지" },
];

export function BottomNav() {
  const location = useLocation();

  // Hide on camera/questionnaire/result views
  const hiddenPaths = ["/camera", "/questionnaire", "/result"];
  if (hiddenPaths.some(path => location.pathname.startsWith(path))) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-bottom z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <NavLink
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-full transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-6 w-6 mb-1", isActive && "stroke-[2.5]")} />
              <span className={cn("text-xs", isActive ? "font-semibold" : "font-medium")}>
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
