import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, FileText, MessageCircle, FolderPlus, Calendar } from "lucide-react";

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, signInWithGoogle, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        console.error("Google sign in error:", error);
      }
    } catch (err) {
      console.error("Google sign in error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const features = [
    { icon: FileText, label: "합병증 분석" },
    { icon: MessageCircle, label: "AI 상담" },
    { icon: FolderPlus, label: "기록 관리" },
    { icon: Calendar, label: "일정 관리" },
  ];

  return (
    <div className="min-h-screen bg-accent flex flex-col">
      {/* Logo & Slogan Section */}
      <div className="flex-1 flex flex-col justify-center px-6 pt-20">
        <div className="animate-fade-in">
          <h1 className="text-6xl font-bold text-primary mb-4">루커</h1>
          <p className="text-xl text-foreground">
            장루 환자를 위한
          </p>
          <p className="text-xl">
            <span className="text-primary font-semibold">AI Stoma</span>
            <span className="text-foreground"> 합병증 분석기</span>
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 pb-8">
        <div className="flex justify-start gap-4 overflow-x-auto pb-4 animate-slide-up">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-2 flex-shrink-0"
            >
              <div className="w-20 h-20 rounded-full bg-accent border-4 border-background shadow-md flex items-center justify-center">
                <feature.icon className="h-8 w-8 text-primary" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Google Sign In Button */}
      <div className="px-6 pb-12 safe-bottom">
        <Button
          variant="outline"
          size="xl"
          className="w-full bg-background border-2 border-primary hover:bg-accent"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google로 시작하기
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
