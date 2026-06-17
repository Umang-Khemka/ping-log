"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsSubmitting(true);

    const result = await signup(name, email, password);

    if (!result.success) {
      setError(result.message || "Signup failed");
      setIsSubmitting(false);
    }
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
          <ColdStartCompare />
          <div className="space-y-1.5">
            <p className="text-[#EDEFF4] text-2xl font-medium tracking-tight leading-snug">
              Set up in two minutes,<br />stay up for good.
            </p>
            <p className="text-[#8B93A7] text-sm leading-relaxed max-w-sm">
              Add a service URL, pick an interval, and Render Ping handles
              the rest — no cron jobs, no extra infra.
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
            Create your account
          </h1>
          <p className="text-sm text-[#8B93A7] mb-8">
            Add your first service right after.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#8B93A7] text-xs font-mono uppercase tracking-wider">
                Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Umang Khemka"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="h-11 bg-white/[0.03] border-white/10 text-[#EDEFF4] placeholder:text-white/25 rounded-md focus-visible:ring-1 focus-visible:ring-[#3DDC84]/40 focus-visible:border-[#3DDC84]/50"
              />
            </div>

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
              <Label htmlFor="password" className="text-[#8B93A7] text-xs font-mono uppercase tracking-wider">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
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
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="text-sm text-[#8B93A7] text-center mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-[#EDEFF4] font-medium hover:text-[#3DDC84] transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function ColdStartCompare() {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-5 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-white/40">without render_ping</span>
        <span className="font-mono text-xs text-[#FF6B6B]">~4200ms cold start</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div className="h-full bg-[#FF6B6B]/60 rounded-full" style={{ width: "92%" }} />
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="font-mono text-xs text-white/40">with render_ping</span>
        <span className="font-mono text-xs text-[#3DDC84]">~140ms response</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div className="h-full bg-[#3DDC84] rounded-full" style={{ width: "6%" }} />
      </div>
    </div>
  );
}