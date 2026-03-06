'use client';

import { ReactNode } from 'react';

interface ConfiguratorLayoutProps {
  preview: ReactNode;
  wizard: ReactNode;
  summary: ReactNode;
}

export function ConfiguratorLayout({ preview, wizard, summary }: ConfiguratorLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="grid h-screen grid-cols-1 lg:grid-cols-3 gap-0 overflow-hidden">
        {/* Left Side - Vehicle Preview (1 column on lg, hidden on smaller) */}
        <div className="hidden lg:flex flex-col col-span-1 bg-slate-900 border-r border-slate-800 overflow-y-auto">
          <div className="p-8 flex-1 flex flex-col">
            {preview}
          </div>
        </div>

        {/* Center - Wizard (2 columns on lg, full on smaller) */}
        <div className="flex flex-col col-span-1 lg:col-span-1 bg-slate-800/50 border-r border-slate-800 overflow-y-auto">
          <div className="p-6 md:p-8 flex-1 flex flex-col">
            {wizard}
          </div>
        </div>

        {/* Right Side - Configuration Summary (1 column on lg) */}
        <div className="hidden lg:flex flex-col col-span-1 bg-slate-900 border-l border-slate-800 overflow-y-auto">
          <div className="p-8 flex-1 flex flex-col">
            {summary}
          </div>
        </div>

        {/* Mobile: Summary takes bottom space */}
        <div className="lg:hidden col-span-1 bg-slate-900 border-t border-slate-800 overflow-y-auto max-h-48">
          <div className="p-4">
            {summary}
          </div>
        </div>
      </div>
    </div>
  );
}
