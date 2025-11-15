import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "../../utils/cn";

type CardTone = "neutral" | "accent" | "success" | "danger" | "subtle";
type CardVariant = "solid" | "soft" | "outline";

const toneClasses: Record<CardTone, string> = {
  neutral: "border-slate-100 bg-white text-slate-900",
  accent: "border-blue-100 bg-blue-50 text-blue-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  danger: "border-rose-200 bg-rose-50 text-rose-800",
  subtle: "border-transparent bg-slate-50 text-slate-900",
};

const variantClasses: Record<CardVariant, string> = {
  solid: "",
  soft: "",
  outline: "border-dashed",
};

export type CardProps<T extends ElementType = "div"> = {
  as?: T;
  tone?: CardTone;
  variant?: CardVariant;
  interactive?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

const baseClass = "rounded-2xl border transition-colors duration-200";

export const Card = <T extends ElementType = "div">({
  as,
  tone = "neutral",
  variant = "soft",
  interactive = false,
  className,
  children,
  ...rest
}: CardProps<T>) => {
  const Component = (as || "div") as ElementType;
  return (
    <Component
      className={cn(
        baseClass,
        toneClasses[tone],
        variantClasses[variant],
        interactive && "hover:border-blue-200",
        className
      )}
      {...rest}
    >
      {children}
    </Component>
  );
};
