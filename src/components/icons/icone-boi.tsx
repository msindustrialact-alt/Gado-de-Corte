import type { SVGProps } from "react";

import { cn } from "@/lib/utils";

type IconeBoiProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

export function IconeBoi({
  className,
  title = "Animais",
  ...props
}: IconeBoiProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 80"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={title}
      className={cn("aspect-[120/80] h-auto w-6", className)}
      {...props}
    >
      <title>{title}</title>
      <path d="M14 26 C22 22 40 22 56 24 C64 25 66 14 76 13 C85 12 88 19 92 24 L96 27 C100 26 106 30 110 38 C112 42 112 47 108 49 C104 51 101 48 100 44 C98 41 96 40 94 42 C92 49 89 53 85 54 L85 75 L80 75 L79 56 C68 58 46 58 36 56 L36 75 L31 75 L29 52 C19 48 14 42 14 26 Z" />
      <path d="M72 57 L72 75 M43 57 L43 75" opacity="0.55" />
      <path d="M96 27 C95 21 98 17 102 17" />
      <path d="M93 31 C87 29 83 33 85 37 C88 38 91 36 93 34" />
      <path d="M14 30 C8 34 8 46 10 58 C9 62 8 64 9 68" />
      <circle cx="102" cy="34" r="1" fill="currentColor" stroke="none" />
      <path d="M108 44 L110 44" />
    </svg>
  );
}
