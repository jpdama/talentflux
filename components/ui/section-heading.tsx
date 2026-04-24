import { cn } from "@/lib/utils/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  size = "md",
  className
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const titleClass = {
    sm: "text-base font-semibold text-foreground",
    md: "text-lg font-semibold text-foreground",
    lg: "text-2xl font-semibold text-foreground md:text-3xl"
  }[size];

  return (
    <div className={cn("flex items-start justify-between gap-6", className)}>
      <div className="space-y-1.5">
        {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
        <h2 className={titleClass}>{title}</h2>
        {description ? (
          <p className="max-w-3xl text-sm leading-6 text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
