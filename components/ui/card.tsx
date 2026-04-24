import * as React from "react";

import { cn } from "@/lib/utils/cn";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "raised" | "ghost";
  padding?: "sm" | "md" | "lg" | "none";
};

const paddingClasses: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6 md:p-7"
};

const variantClasses: Record<NonNullable<CardProps["variant"]>, string> = {
  default: "surface",
  raised: "surface-raised shadow-panel",
  ghost: "rounded-xl border border-transparent bg-transparent"
};

export function Card({
  className,
  variant = "default",
  padding = "md",
  children,
  ...rest
}: CardProps) {
  return (
    <div className={cn(variantClasses[variant], paddingClasses[padding], className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...rest }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-base font-semibold text-foreground", className)} {...rest}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...rest }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm leading-6 text-muted", className)} {...rest}>
      {children}
    </p>
  );
}
