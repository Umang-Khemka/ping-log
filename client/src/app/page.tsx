"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (user) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  // Brief loading state while auth check + redirect happens
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <p className="text-sm text-neutral-400">Loading...</p>
    </div>
  );
}