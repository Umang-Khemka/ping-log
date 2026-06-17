"use client";

import { LayoutDashboard, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function SettingsPage() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0B0E14] flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-white/[0.06] flex flex-col py-6 px-4">
        <div className="flex items-center gap-2.5 px-2 mb-10">
          <span className="w-2 h-2 rounded-full bg-[#3DDC84] shadow-[0_0_8px_#3DDC84]" />
          <span className="font-mono text-sm text-white/70 tracking-wide">render_ping</span>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                pathname === href
                  ? "bg-[#3DDC84]/10 text-[#3DDC84]"
                  : "text-[#8B93A7] hover:text-[#EDEFF4] hover:bg-white/[0.04]"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[#8B93A7] hover:text-[#FF6B6B] hover:bg-[#FF6B6B]/[0.06] transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 px-8 py-10 overflow-auto">
        <div className="max-w-xl">
          <h1 className="text-xl font-medium text-[#EDEFF4] tracking-tight mb-1">Settings</h1>
          <p className="text-sm text-[#8B93A7] font-mono mb-8">Your account details.</p>

          <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] divide-y divide-white/[0.06]">
            <Row label="Email" value={user?.email ?? "—"} />
            <Row label="Name" value={user?.name ?? "—"} />
            {/* <Row label="Member since" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"} /> */}
          </div>

          <p className="text-xs text-white/20 font-mono mt-6">
            To change your email or password, contact support.
          </p>
        </div>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="text-xs font-mono uppercase tracking-wider text-[#8B93A7]">{label}</span>
      <span className="text-sm text-[#EDEFF4]">{value}</span>
    </div>
  );
}