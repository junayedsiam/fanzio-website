import React from "react";

type LogoProps = {
  className?: string;
};

export function Logo({ className = "w-8 h-8" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Logo"
    >
      <path d="M20 0L40 20L20 40L0 20L20 0Z" fill="white" />
      <path d="M20 8L32 20L20 32L8 20L20 8Z" fill="black" />
      <path d="M20 14L26 20L20 26L14 20L20 14Z" fill="white" />
    </svg>
  );
}