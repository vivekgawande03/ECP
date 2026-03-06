import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type OptionGridProps = {
  children: ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
};

const columnClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
} as const;

export function OptionGrid({ children, columns = 2, className }: OptionGridProps) {
  return <div className={cn("grid gap-3", columnClasses[columns], className)}>{children}</div>;
}