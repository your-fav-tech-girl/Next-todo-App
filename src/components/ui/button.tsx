"use client";
import React, { ForwardedRef } from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "danger";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { children, className = "", variant = "default", ...props },
    ref: ForwardedRef<HTMLButtonElement>
  ) {
    const base =
      "inline-flex items-center justify-center rounded px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variants: Record<string, string> = {
      default: "bg-gray-500 text-white hover:bg-gray-600",
      outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
      ghost: "text-white bg-gray-500 hover:bg-gray-700",
      danger: "bg-red-500 text-white hover:bg-red-600",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant] || ""} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
