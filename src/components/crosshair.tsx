import { cn } from "@/lib/utils";

/** The Zodiac's signature: a circle bisected by a cross (a gunsight). */
export function Crosshair({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("h-8 w-8", className)}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
    >
      <circle cx="50" cy="50" r="34" />
      <line x1="50" y1="4" x2="50" y2="96" />
      <line x1="4" y1="50" x2="96" y2="50" />
    </svg>
  );
}
