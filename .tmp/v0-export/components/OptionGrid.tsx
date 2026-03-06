import { ReactNode } from 'react';

interface OptionGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3;
}

export function OptionGrid({ children, columns = 2 }: OptionGridProps) {
  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };

  return (
    <div className={`grid gap-3 ${gridColsClass[columns]}`}>
      {children}
    </div>
  );
}
