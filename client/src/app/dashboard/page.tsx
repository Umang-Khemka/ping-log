"use client";

import { useState } from "react";
import { Radio, LayoutDashboard, Settings, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useServices } from "@/hooks/useServices";
import { useAuth } from "@/context/AuthContext";
import { ServiceCard } from "@/components/dashboard/ServiceCard";
import { AddServiceDialog } from "@/components/dashboard/AddServiceDialog";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardPage() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { services, isLoading, error, addService, toggleService, deleteService } = useServices();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0E14] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-56 shrink-0 border-r border-white/[0.06] flex flex-col py-6 px-4 bg-[#0B0E14] transition-transform duration-200",
          "lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-2 mb-10">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#3DDC84] shadow-[0_0_8px_#3DDC84]" />
            <span className="font-mono text-sm text-white/70 tracking-wide">render_ping</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-[#8B93A7] hover:text-[#EDEFF4]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
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
      <main className="flex-1 min-w-0 overflow-auto">
        {/* Mobile topbar */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.06] lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#8B93A7] hover:text-[#EDEFF4] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3DDC84] shadow-[0_0_8px_#3DDC84]" />
            <span className="font-mono text-sm text-white/70 tracking-wide">render_ping</span>
          </div>
        </div>

        <div className="px-4 sm:px-8 py-6 sm:py-10">
          <div className="max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-xl font-medium text-[#EDEFF4] tracking-tight">Your services</h1>
                <p className="text-sm text-[#8B93A7] mt-1 font-mono">
                  {services.length === 0
                    ? "Add a Render service to start keeping it awake."
                    : `${services.length} service${services.length === 1 ? "" : "s"} · pinged every 9 min`}
                </p>
              </div>
              {services.length > 0 && <AddServiceDialog onAdd={addService} />}
            </div>

            {isLoading && (
              <p className="text-sm text-[#8B93A7] font-mono">Loading services...</p>
            )}

            {error && (
              <div className="text-sm text-[#FF6B6B] bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 rounded-md px-4 py-3 mb-6 font-mono">
                {error}
              </div>
            )}

            {!isLoading && services.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center border border-dashed border-white/[0.08] rounded-xl">
                <div className="w-11 h-11 rounded-full bg-[#3DDC84]/10 border border-[#3DDC84]/20 flex items-center justify-center mb-4">
                  <Radio className="w-5 h-5 text-[#3DDC84]" />
                </div>
                <h3 className="font-medium text-[#EDEFF4] mb-1">No services yet</h3>
                <p className="text-sm text-[#8B93A7] mb-5 max-w-xs">
                  Add your first Render URL and we&apos;ll keep it from ever falling asleep.
                </p>
                <AddServiceDialog onAdd={addService} />
              </div>
            )}

            {!isLoading && services.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                  <ServiceCard
                    key={service._id}
                    service={service}
                    onToggle={toggleService}
                    onDelete={deleteService}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}