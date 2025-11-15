import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

type Alignment = "start" | "center";

export type SectionHeaderProps = {
  label?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: Alignment;
  className?: string;
};

export const SectionHeader = ({
  label,
  title,
  description,
  action,
  align = "start",
  className,
}: SectionHeaderProps) => (
  <header
    className={cn(
      "flex flex-wrap items-center justify-between gap-3",
      align === "center" && "text-center justify-center",
      className,
    )}
  >
    <div>
      {label && (
        <p className="text-xs uppercase tracking-widest text-slate-400">
          {label}
        </p>
      )}
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      {description && <p className="text-xs text-slate-500">{description}</p>}
    </div>
    {action ? <div className="flex items-center gap-2">{action}</div> : null}
  </header>
);
