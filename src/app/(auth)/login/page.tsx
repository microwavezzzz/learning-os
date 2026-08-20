"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, ArrowRight, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function LoginPage() {
  const { loginWithGoogle, loginWithEmail, loginAsDemoUser, isAuthenticated } = useAuth();
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    await loginWithEmail(email);
    router.push("/dashboard");
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    await loginWithGoogle();
    router.push("/dashboard");
  };

  const handleDemoLogin = () => {
    loginAsDemoUser();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-muted/20 relative">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold shadow-md">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Learning OS</h1>
          <p className="text-sm text-muted-foreground max-w-xs">
            Personal Learning Management System with active recall, mistake tracking, and mastery curves.
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-border/80 shadow-xl backdrop-blur-sm bg-card/80">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Sign in</CardTitle>
              <Badge variant="outline" className="text-xs font-normal">
                Phase 1 Auth
              </Badge>
            </div>
            <CardDescription>
              Choose your preferred method to access your learning workspace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google OAuth button */}
            <Button
              variant="outline"
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 h-10 hover:bg-accent font-medium"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or with email
                </span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                className="h-10"
              />
              <Button type="submit" disabled={isSubmitting} className="w-full h-10 font-medium">
                <span>Sign in with Email</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2 border-t">
            {/* Quick 1-Click Demo Mode button */}
            <Button
              variant="secondary"
              type="button"
              onClick={handleDemoLogin}
              className="w-full flex items-center justify-center gap-2 border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-medium"
            >
              <Sparkles className="h-4 w-4" />
              <span>Explore as Demo Student</span>
            </Button>

            <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Encrypted tokens & private user data isolation</span>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
