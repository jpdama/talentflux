import { cn } from "@/lib/utils/cn";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "accent" | "outline";

export function Badge({
  children,
  variant = "default",
  className,
  dot = false
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}) {
  const styles: Record<BadgeVariant, string> = {
    default: "border-border-strong bg-surface-raised text-muted-strong",
    success: "border-success/30 bg-success/10 text-success",
    warning: "border-warning/30 bg-warning/10 text-warning",
    danger: "border-danger/30 bg-danger/10 text-danger",
    accent: "border-primary/30 bg-primary/10 text-primary",
    outline: "border-border-strong bg-transparent text-muted-strong"
  };

  const dotStyles: Record<BadgeVariant, string> = {
    default: "bg-muted",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    accent: "bg-primary",
    outline: "bg-muted"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[variant],
        className
      )}
    >
      {dot ? <span className={cn("inline-block h-1.5 w-1.5 rounded-full", dotStyles[variant])} aria-hidden /> : null}
      {children}
    </span>
  );
}
