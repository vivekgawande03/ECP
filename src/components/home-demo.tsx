"use client";

import { useState } from "react";
import { useCounterStore } from "@/store/counter-store";
import { trpc } from "@/trpc/react";

export function HomeDemo() {
  const [name, setName] = useState("Auggie");
  const { count, decrement, increment, reset } = useCounterStore();

  const greeting = trpc.example.greeting.useQuery({
    name: name.trim() || "World",
  });

  return (
    <section className="grid gap-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl shadow-black/20 md:grid-cols-2">
      <div className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">
            tRPC demo
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Typed API call</h2>
        </div>

        <label className="block space-y-2 text-sm text-slate-300">
          <span>Name</span>
          <input
            className="w-full rounded-xl border bg-slate-950 px-4 py-3 outline-none transition focus:border-cyan-400"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Type a name"
          />
        </label>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-200">
          {greeting.isLoading ? "Loading greeting..." : greeting.data?.message}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">
            Zustand demo
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Client-side state</h2>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-center">
          <p className="text-sm text-slate-400">Counter value</p>
          <p className="mt-2 text-5xl font-bold text-white">{count}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="rounded-xl bg-emerald-500 px-4 py-2 font-medium text-slate-950" onClick={increment}>
            Increment
          </button>
          <button className="rounded-xl bg-slate-700 px-4 py-2 font-medium text-white" onClick={decrement}>
            Decrement
          </button>
          <button className="rounded-xl border px-4 py-2 font-medium text-white" onClick={reset}>
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}