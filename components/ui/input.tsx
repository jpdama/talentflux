import * as React from "react";

import { cn } from "@/lib/utils/cn";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 focus:border-cyan-300/40 focus:outline-none",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
