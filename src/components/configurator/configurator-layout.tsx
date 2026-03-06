import type { ReactNode } from "react";

type ConfiguratorLayoutProps = {
  preview: ReactNode;
  wizard: ReactNode;
  summary: ReactNode;
};

export function ConfiguratorLayout({ preview, wizard, summary }: ConfiguratorLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_1.15fr_0.9fr]">
        <aside className="hidden border-r border-slate-800 bg-slate-900 lg:flex">
          <div className="flex flex-1 flex-col p-8">{preview}</div>
        </aside>

        <main className="flex min-h-[65vh] flex-col border-r border-slate-800 bg-slate-800/40">
          <div className="flex flex-1 flex-col p-5 md:p-8">{wizard}</div>
        </main>

        <aside className="hidden border-l border-slate-800 bg-slate-900 lg:flex">
          <div className="flex flex-1 flex-col p-8">{summary}</div>
        </aside>

        <section className="border-t border-slate-800 bg-slate-900 lg:hidden">
          <div className="p-4">{summary}</div>
        </section>
      </div>
    </div>
  );
}