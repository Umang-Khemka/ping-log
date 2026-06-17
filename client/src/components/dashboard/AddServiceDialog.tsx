"use client";

import { useState, FormEvent } from "react";
import { Plus, X } from "lucide-react";

interface AddServiceDialogProps {
  onAdd: (name: string, url: string) => Promise<{ success: boolean; message?: string }>;
}

export function AddServiceDialog({ onAdd }: AddServiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    const result = await onAdd(name, url);
    setIsSubmitting(false);
    if (!result.success) { setError(result.message || "Failed to add service"); return; }
    setName(""); setUrl(""); setOpen(false);
  };

  const inputCls = "w-full h-10 rounded-md bg-white/[0.03] border border-white/10 text-[#EDEFF4] text-sm px-3 placeholder:text-white/25 font-mono focus:outline-none focus:border-[#3DDC84]/50 focus:ring-1 focus:ring-[#3DDC84]/30 transition-colors";
  const labelCls = "block text-xs font-mono uppercase tracking-wider text-[#8B93A7] mb-1.5";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 h-9 px-4 rounded-md bg-[#3DDC84] hover:bg-[#34c474] text-[#0B0E14] text-sm font-medium transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add service
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 rounded-xl border border-white/[0.08] bg-[#0F1219] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-medium text-[#EDEFF4]">Add a service</h2>
                <p className="text-xs text-[#8B93A7] mt-0.5 font-mono">Pinged every 9 minutes to stay awake.</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white/60 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelCls}>Name</label>
                <input className={inputCls} placeholder="TKR Care Backend" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>Render URL</label>
                <input className={inputCls} placeholder="https://your-app.onrender.com" value={url} onChange={e => setUrl(e.target.value)} required />
              </div>

              {error && (
                <p className="text-xs text-[#FF6B6B] bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 rounded-md px-3 py-2 font-mono">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 rounded-md bg-[#3DDC84] hover:bg-[#34c474] disabled:opacity-50 text-[#0B0E14] text-sm font-medium transition-colors mt-1"
              >
                {isSubmitting ? "Adding..." : "Add service"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}