// src/components/ui/badge.jsx

import * as React from "react";
import { cn } from "../../lib/utils"; // optional helper for class merging

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-700",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
