import { cn } from "@/lib/utils/cn";

export function Badge({
  children,
  variant = "default"
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
}) {
  const styles =
    variant === "success"
      ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
      : variant === "warning"
        ? "border-amber-400/25 bg-amber-400/10 text-amber-100"
        : variant === "danger"
          ? "border-rose-400/25 bg-rose-500/10 text-rose-100"
          : "border-white/10 bg-white/5 text-slate-200";

  return (
    <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em]", styles)}>
      {children}
    </span>
  );
}
