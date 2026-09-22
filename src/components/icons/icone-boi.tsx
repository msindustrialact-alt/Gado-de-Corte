import type { SVGProps } from "react";

import { cn } from "@/lib/utils";

type IconeBoiProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

export function IconeBoi({
  className,
  title = "Animais",
  strokeWidth = 1.75,
  ...props
}: IconeBoiProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={title}
      className={cn("size-5", className)}
      {...props}
    >
      <title>{title}</title>
      <path d="M7 10a5 5 0 0 1-4-8 4 4 0 0 0 4 4h10a4 4 0 0 0 4-4 5 5 0 0 1-4 8" />
      <path d="M6.4 15c-.3-.6-.4-1.3-.4-2 0-4 3-3 3-7" />
      <path d="M10 12.5v1.6" />
      <path d="M17.6 15c.3-.6.4-1.3.4-2 0-4-3-3-3-7" />
      <path d="M14 12.5v1.6" />
      <path d="M15 22a4 4 0 1 0-3-6.7A4 4 0 1 0 9 22Z" />
      <path d="M9 18h.01" />
      <path d="M15 18h.01" />
    </svg>
  );
}
