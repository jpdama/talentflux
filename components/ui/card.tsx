import { cn } from "@/lib/utils/cn";

export function Card({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("panel p-6", className)}>{children}</div>;
}
