import {
  Crosshair,
  Phone,
  KeyRound,
  Feather,
  Skull,
  Scissors,
  Clock,
  Gavel,
  type LucideIcon,
} from "lucide-react";
import type { BadgeIcon } from "@/data/badges";
import { cn } from "@/lib/utils";

const ICONS: Record<BadgeIcon, LucideIcon> = {
  crosshair: Crosshair,
  phone: Phone,
  key: KeyRound,
  feather: Feather,
  skull: Skull,
  scissors: Scissors,
  clock: Clock,
  gavel: Gavel,
};

export function BadgeGlyph({
  icon,
  className,
}: {
  icon: BadgeIcon;
  className?: string;
}) {
  const Icon = ICONS[icon] ?? Crosshair;
  return <Icon className={cn("h-6 w-6", className)} />;
}
