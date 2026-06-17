"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await login(email, password);

    if (!result.success) {
      setError(result.message || "Login failed");
      setIsSubmitting(false);
    }
    // on success, AuthContext handles redirect — no need to setIsSubmitting(false)
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr] bg-[#0B0E14]">
      {/* Left: product story panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden border-r border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#3DDC84] shadow-[0_0_8px_#3DDC84]" />
          <span className="font-mono text-sm text-white/70 tracking-wide">render_ping</span>
        </div>

        <div className="space-y-8">
          <PulseMonitor />
          <div className="space-y-1.5">
            <p className="text-[#EDEFF4] text-2xl font-medium tracking-tight leading-snug">
              Your services,<br />never asleep.
            </p>
            <p className="text-[#8B93A7] text-sm leading-relaxed max-w-sm">
              Render Ping checks in on your free-tier services every few minutes,
              so the first real request never has to wait for a cold start.
            </p>
          </div>
        </div>

        <p className="font-mono text-xs text-white/30">© {new Date().getFullYear()} Render Ping</p>
      </div>

      {/* Right: auth form */}
      <div className="flex items-center justify-center px-6 py-16 bg-[#0B0E14]">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <span className="w-2 h-2 rounded-full bg-[#3DDC84] shadow-[0_0_8px_#3DDC84]" />
            <span className="font-mono text-sm text-white/70 tracking-wide">render_ping</span>
          </div>

          <h1 className="text-2xl font-medium text-[#EDEFF4] tracking-tight mb-2">
            Welcome back
          </h1>
          <p className="text-sm text-[#8B93A7] mb-8">
            Log in to keep your services pinging.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#8B93A7] text-xs font-mono uppercase tracking-wider">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-11 bg-white/[0.03] border-white/10 text-[#EDEFF4] placeholder:text-white/25 rounded-md focus-visible:ring-1 focus-visible:ring-[#3DDC84]/40 focus-visible:border-[#3DDC84]/50"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[#8B93A7] text-xs font-mono uppercase tracking-wider">
                  Password
                </Label>
                <Link href="/forgot-password" className="text-xs text-[#8B93A7] hover:text-[#EDEFF4] transition-colors">
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="h-11 bg-white/[0.03] border-white/10 text-[#EDEFF4] placeholder:text-white/25 rounded-md focus-visible:ring-1 focus-visible:ring-[#3DDC84]/40 focus-visible:border-[#3DDC84]/50"
              />
            </div>

            {error && (
              <p className="text-sm text-[#FF6B6B] bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 rounded-md px-3 py-2 font-mono">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-[#3DDC84] hover:bg-[#34c474] text-[#0B0E14] font-medium rounded-md transition-colors"
            >
              {isSubmitting ? "Logging in..." : "Log in"}
            </Button>
          </form>

          <p className="text-sm text-[#8B93A7] text-center mt-8">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#EDEFF4] font-medium hover:text-[#3DDC84] transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function PulseMonitor() {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-xs text-white/40">api.yourapp.onrender.com</span>
        <span className="flex items-center gap-1.5 font-mono text-xs text-[#3DDC84]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3DDC84] animate-pulse" />
          online
        </span>
      </div>
      <svg viewBox="0 0 320 64" className="w-full h-14" preserveAspectRatio="none">
        <polyline
          points="0,32 40,32 52,32 60,8 68,56 76,32 110,32 150,32 162,32 170,8 178,56 186,32 220,32 260,32 272,32 280,8 288,56 296,32 320,32"
          fill="none"
          stroke="#3DDC84"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity="0.85"
        />
      </svg>
      <div className="flex items-center justify-between mt-2 font-mono text-[11px] text-white/30">
        <span>last ping 0:42 ago</span>
        <span className="text-white/50">200 · 138ms</span>
      </div>
    </div>
  );
}