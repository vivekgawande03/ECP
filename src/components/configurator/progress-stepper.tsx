"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProgressStepperProps = {
  steps: string[];
  currentStep: number;
  onStepClick?: (index: number) => void;
};

export function ProgressStepper({ steps, currentStep, onStepClick }: ProgressStepperProps) {
  const scrollViewportRef = useRef<HTMLDivElement | null>(null);
  const activeStepRef = useRef<HTMLButtonElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const viewport = scrollViewportRef.current;

    if (!viewport) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;
    setCanScrollLeft(viewport.scrollLeft > 4);
    setCanScrollRight(maxScrollLeft - viewport.scrollLeft > 4);
  }, []);

  const scrollSteps = useCallback((direction: "left" | "right") => {
    const viewport = scrollViewportRef.current;

    if (!viewport) {
      return;
    }

    const distance = Math.max(Math.round(viewport.clientWidth * 0.65), 180);
    viewport.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    updateScrollState();

    const viewport = scrollViewportRef.current;

    if (!viewport) {
      return;
    }

    const handleScroll = () => updateScrollState();

    viewport.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      viewport.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  useEffect(() => {
    activeStepRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
    updateScrollState();
  }, [currentStep, steps.length, updateScrollState]);

  return (
    <div className="flex items-start gap-1.5 pb-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label="Scroll steps left"
        disabled={!canScrollLeft}
        onClick={() => scrollSteps("left")}
        className="h-9 w-9 mt-2 shrink-0 rounded-xl border border-slate-700 p-0 text-slate-200 hover:border-slate-600 hover:bg-slate-800"
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M12.78 4.22a.75.75 0 010 1.06L8.06 10l4.72 4.72a.75.75 0 11-1.06 1.06l-5.25-5.25a.75.75 0 010-1.06l5.25-5.25a.75.75 0 011.06 0z"
            clipRule="evenodd"
          />
        </svg>
      </Button>

      <div ref={scrollViewportRef} className="p-1 min-w-0 flex-1 overflow-x-hidden">
        <div className="flex min-w-max items-start gap-1.5 pr-1">
          {steps.map((step, index) => {
            const isComplete = index < currentStep;
            const isActive = index === currentStep;
            const canJump = Boolean(onStepClick) && index <= currentStep;

            return (
              <div key={step} className="flex min-w-[74px] flex-1 items-start gap-1.5">
                <button
                  ref={isActive ? activeStepRef : undefined}
                  type="button"
                  onClick={() => canJump && onStepClick?.(index)}
                  disabled={!canJump}
                  className={cn("flex flex-col items-center text-center", !canJump && "cursor-default")}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                      isComplete && "bg-cyan-500 text-slate-950",
                      isActive && "bg-cyan-500 text-slate-950 ring-2 ring-cyan-300/60",
                      !isComplete && !isActive && "bg-slate-700 text-slate-300",
                    )}
                  >
                    {isComplete ? (
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={cn(
                      "mt-1.5 text-[11px] font-medium leading-4",
                      index <= currentStep ? "text-slate-100" : "text-slate-500",
                    )}
                  >
                    {step}
                  </span>
                </button>

                {index < steps.length - 1 ? (
                  <div className={cn("mt-[18px] h-1 flex-1 rounded-full", isComplete ? "bg-cyan-500" : "bg-slate-700")} />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label="Scroll steps right"
        disabled={!canScrollRight}
        onClick={() => scrollSteps("right")}
        className="h-9 w-9 mt-2 shrink-0 rounded-xl border border-slate-700 p-0 text-slate-200 hover:border-slate-600 hover:bg-slate-800"
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M7.22 15.78a.75.75 0 010-1.06L11.94 10 7.22 5.28a.75.75 0 111.06-1.06l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 01-1.06 0z"
            clipRule="evenodd"
          />
        </svg>
      </Button>
    </div>
  );
}