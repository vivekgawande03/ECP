export type ClassValue =
  | string
  | number
  | false
  | null
  | undefined
  | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  const visit = (value: ClassValue): void => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (typeof value === "string" || typeof value === "number") {
      if (value) {
        classes.push(String(value));
      }
    }
  };

  inputs.forEach(visit);
  return classes.join(" ");
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}