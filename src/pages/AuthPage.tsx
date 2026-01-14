import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Mail, Lock, FileText, MessageCircle, FolderPlus, Calendar, CheckCircle } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("올바른 이메일 형식을 입력해주세요");
const passwordSchema = z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다");

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, signUp, signIn, signInWithGoogle, isLoading: authLoading } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const validateInputs = () => {
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        setError(e.errors[0].message);
        return false;
      }
    }

    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        setError(e.errors[0].message);
        return false;
      }
    }

    if (isSignUp && password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateInputs()) return;

    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes("already registered")) {
            setError("이미 가입된 이메일입니다. 로그인해주세요.");
          } else {
            setError(error.message);
          }
        } else {
          setSuccess("회원가입이 완료되었습니다! 로그인해주세요.");
          setIsSignUp(false);
          setPassword("");
          setConfirmPassword("");
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            setError("이메일 또는 비밀번호가 올바르지 않습니다");
          } else {
            setError(error.message);
          }
        }
      }
    } catch (err) {
      setError("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError("Google 로그인 중 오류가 발생했습니다.");
      }
    } catch (err) {
      setError("Google 로그인 중 오류가 발생했습니다.");
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
      <div className="px-6 pt-16 pb-8">
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
      <div className="px-6 pb-6">
        <div className="flex justify-start gap-4 overflow-x-auto pb-2 animate-slide-up">
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

      {/* Auth Form Section */}
      <div className="flex-1 bg-background rounded-t-3xl px-6 py-8 animate-slide-up">
        <h2 className="text-xl font-bold text-foreground mb-6 text-center">
          {isSignUp ? "회원가입" : "로그인"}
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/20 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            <p className="text-sm text-success">{success}</p>
          </div>
        )}

        {/* Google Sign In Button */}
        <Button
          variant="outline"
          size="lg"
          className="w-full mb-6 bg-background border-2 border-primary hover:bg-accent"
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

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-muted-foreground">또는</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              isSignUp ? "회원가입" : "로그인"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {isSignUp ? "이미 계정이 있으신가요?" : "아직 계정이 없으신가요?"}
          </p>
          <Button
            variant="link"
            className="text-primary"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setSuccess(null);
            }}
          >
            {isSignUp ? "로그인하기" : "회원가입하기"}
          </Button>
        </div>
      </div>
    </div>
  );
}
