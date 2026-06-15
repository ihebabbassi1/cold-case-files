import { cn } from "@/lib/utils";

export function Stamp({
  children,
  className,
  straight = false,
}: {
  children: React.ReactNode;
  className?: string;
  straight?: boolean;
}) {
  return (
    <span className={cn("stamp text-xs", straight && "stamp-straight", className)}>
      {children}
    </span>
  );
}
