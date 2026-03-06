import type { ReactNode } from "react";

type ConfiguratorLayoutProps = {
  preview: ReactNode;
  wizard: ReactNode;
  summary: ReactNode;
};

export function ConfiguratorLayout({ preview, wizard, summary }: ConfiguratorLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 lg:h-screen lg:overflow-hidden">
      <div className="grid min-h-screen grid-cols-1 lg:h-screen lg:min-h-0 lg:grid-cols-[0.95fr_1.25fr_0.9fr]">
        <aside className="hidden border-r border-slate-800 bg-slate-900 lg:flex lg:min-h-0">
          <div className="flex h-full w-full flex-col overflow-y-auto p-8">{preview}</div>
        </aside>

        <main className="scrollbar-hide flex min-h-[65vh] flex-col border-r border-slate-800 bg-slate-800/40 lg:h-screen lg:min-h-0 lg:overflow-y-auto">
          <div className="flex flex-1 flex-col p-5 md:p-8">{wizard}</div>
        </main>

        <aside className="hidden border-l border-slate-800 bg-slate-900 lg:flex lg:min-h-0">
          <div className="flex h-full w-full flex-col overflow-y-auto p-8">{summary}</div>
        </aside>

        <section className="border-t border-slate-800 bg-slate-900 lg:hidden">
          <div className="p-4">{summary}</div>
        </section>
      </div>
    </div>
  );
}