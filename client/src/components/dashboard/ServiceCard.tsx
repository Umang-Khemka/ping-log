"use client";

import { useState } from "react";
import { Trash2, ExternalLink, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Service } from "@/hooks/useServices";

interface ServiceCardProps {
  service: Service;
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => Promise<{ success: boolean; message?: string }>;
}

const statusConfig = {
  up:      { label: "Up",      dot: "bg-[#3DDC84]", text: "text-[#3DDC84]" },
  down:    { label: "Down",    dot: "bg-[#FF6B6B]", text: "text-[#FF6B6B]" },
  pending: { label: "Pending", dot: "bg-white/30",  text: "text-white/40"  },
};

function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return "Never pinged yet";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export function ServiceCard({ service, onToggle, onDelete }: ServiceCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const status = statusConfig[service.lastStatus];

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(service._id);
    setIsDeleting(false);
    setConfirmOpen(false);
  };

  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-[#EDEFF4] truncate text-sm">{service.name}</h3>
          <a
            href={service.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 mt-0.5 text-xs text-[#8B93A7] hover:text-[#3DDC84] transition-colors truncate font-mono"
          >
            <span className="truncate">{service.url}</span>
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        </div>

        {/* Toggle */}
        <button
          onClick={() => onToggle(service._id, !service.isActive)}
          className={cn(
            "relative w-9 h-5 rounded-full transition-colors shrink-0 mt-0.5",
            service.isActive ? "bg-[#3DDC84]/30" : "bg-white/10"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform",
              service.isActive ? "bg-[#3DDC84] translate-x-4" : "bg-white/30"
            )}
          />
        </button>
      </div>

      {/* Status row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
          <span className={cn("text-xs font-mono", status.text)}>{status.label}</span>
          {service.lastStatusCode && (
            <span className="text-xs text-white/30 font-mono">· {service.lastStatusCode}</span>
          )}
        </div>

        {/* Delete */}
        {!confirmOpen ? (
          <button
            onClick={() => setConfirmOpen(true)}
            className="text-white/20 hover:text-[#FF6B6B] transition-colors p-1 rounded"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfirmOpen(false)}
              className="text-xs text-[#8B93A7] hover:text-[#EDEFF4] font-mono transition-colors"
            >
              cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-xs text-[#FF6B6B] font-mono hover:text-[#FF6B6B]/80 transition-colors"
            >
              {isDeleting ? "removing..." : "confirm"}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-1.5 pt-3 border-t border-white/[0.06] text-xs font-mono text-white/30">
        <Clock className="w-3 h-3" />
        {formatRelativeTime(service.lastPingedAt)}
      </div>
    </div>
  );
}