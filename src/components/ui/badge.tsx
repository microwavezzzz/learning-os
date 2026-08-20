import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold transition-all backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-white/50 bg-gradient-to-r from-primary to-indigo-500 text-white shadow-[0_2px_10px_rgba(99,102,241,0.3)]",
        secondary:
          "border-white/60 dark:border-white/10 bg-white/50 dark:bg-slate-800/50 text-foreground",
        destructive:
          "border-rose-500/30 bg-rose-500/15 text-rose-600 dark:text-rose-400 shadow-[0_2px_10px_rgba(244,63,94,0.15)]",
        outline:
          "border-white/60 dark:border-white/15 bg-white/30 dark:bg-slate-800/30 text-foreground",
        success:
          "border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-[0_2px_10px_rgba(16,185,129,0.15)]",
        warning:
          "border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-[0_2px_10px_rgba(245,158,11,0.15)]",
        info:
          "border-cyan-500/30 bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 shadow-[0_2px_10px_rgba(6,182,212,0.15)]",
        purple:
          "border-purple-500/30 bg-purple-500/15 text-purple-600 dark:text-purple-400 shadow-[0_2px_10px_rgba(168,85,247,0.15)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
