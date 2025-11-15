import type { HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export type BadgeTone = "neutral" | "accent" | "success" | "danger";

const badgeClasses: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-600 border border-slate-200",
  accent: "bg-blue-50 text-blue-700 border border-blue-100",
  success: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  danger: "bg-rose-50 text-rose-700 border border-rose-100",
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export const Badge = ({ tone = "neutral", className, children, ...rest }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
      badgeClasses[tone],
      className,
    )}
    {...rest}
  >
    {children}
  </span>
);
