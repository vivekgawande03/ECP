import type { ReactNode } from "react";

type ConfiguratorLayoutProps = {
  preview: ReactNode;
  wizard: ReactNode;
};

export function ConfiguratorLayout({ preview, wizard }: ConfiguratorLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 lg:h-screen lg:overflow-hidden">
      <div className="flex min-h-screen flex-col lg:grid lg:h-screen lg:min-h-0 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="order-1 border-b border-slate-800 bg-slate-900 lg:order-2 lg:min-h-0 lg:border-b-0 lg:border-l">
          <div className="flex h-full w-full flex-col p-5 md:p-8 lg:overflow-y-auto">{preview}</div>
        </aside>

        <main className="scrollbar-hide order-2 flex min-h-[58vh] flex-col bg-slate-800/40 lg:order-1 lg:h-screen lg:min-h-0 lg:overflow-y-auto lg:border-r lg:border-slate-800">
          <div className="flex flex-1 flex-col p-5 md:p-8">{wizard}</div>
        </main>
      </div>
    </div>
  );
}