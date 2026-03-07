"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useConfigurationStore } from "@/store/configuration-store";

const toneClasses = {
  info: "border-cyan-500/20 bg-cyan-500/5",
  warning: "border-amber-500/20 bg-amber-500/5",
  success: "border-emerald-500/20 bg-emerald-500/5",
} as const;

export function RuleExplanationPanel() {
  const warnings = useConfigurationStore((state) => state.warnings);
  const notes = useConfigurationStore((state) => state.ruleNotes);

  return (
    <Card className="border-slate-700 bg-slate-900/70 p-4">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.25em] text-amber-300/80">Rule visibility</p>
        <h2 className="mt-2 text-lg font-semibold text-white">Business rules & notifications</h2>
        <p className="mt-1 text-sm text-slate-400">
          Surface why options are blocked, what changed automatically, and which dealer incentives are active.
        </p>
      </div>

      <div className="space-y-4">
        {warnings.length > 0 ? (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Recent adjustments
            </p>
            {warnings.map((warning) => (
              <div
                key={warning.id}
                className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-3 py-3 text-sm text-amber-100"
              >
                {warning.message}
              </div>
            ))}
          </div>
        ) : null}

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Active business rules
          </p>

          {notes.length > 0 ? (
            notes.map((note) => (
              <div
                key={note.id}
                className={cn("rounded-2xl border px-3 py-3", toneClasses[note.tone])}
              >
                <p className="text-sm font-semibold text-white">{note.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-300">{note.detail}</p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 px-3 py-3 text-sm text-slate-400">
              No special commercial rules are active for the current configuration yet.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}