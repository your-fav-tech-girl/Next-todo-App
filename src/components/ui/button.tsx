import React from "react";

type Button = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
  type?: string;
  variant?: "default" | "outline" | "ghost" | "danger";
};
export const Button = React.forwardRef<HTMLButtonElement, Button>(
  (
    {
      children,
      className = "",
      type = "button",
      variant = "default",
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center rounded px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
    const variants = {
      default: "bg-gray-500 text-white hover:bg-gray-600 px-2 py-2",
      outline:
        "border border-gray-300 text-gray-700 hover:bg-gray-100 px-2 py-2",
      ghost: "text-white bg-gray-500",
      danger: "bg-red-500 text-white",
    };

    return (
      <button
        type={type}
        ref={ref}
        className={`${base} ${variants[variant] || ""} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
