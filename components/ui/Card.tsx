"use client";

import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
}

export default function Card({
  selected,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border-2 p-6 transition-all ${
        selected
          ? "border-gold shadow-gold/20 shadow-md"
          : "border-gray-200 hover:border-gray-300 hover:shadow-md"
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
