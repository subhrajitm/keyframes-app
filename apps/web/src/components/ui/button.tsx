"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:     "bg-white text-black hover:bg-white/90",
        rose:      "bg-gradient-to-r from-rose-500 to-violet-600 text-white shadow-lg shadow-rose-900/40 hover:from-rose-400 hover:to-violet-500 active:opacity-90",
        destructive: "bg-red-600 text-white shadow-sm shadow-red-900/30 hover:bg-red-500 active:bg-red-700",
        outline:     "border border-white/[0.15] bg-white/[0.05] text-white/70 hover:border-white/25 hover:bg-white/[0.08] hover:text-white/90",
        ghost:       "text-white/50 hover:bg-white/[0.05] hover:text-white",
        secondary:   "bg-white/[0.07] text-white hover:bg-white/10",
        link:        "text-white/55 underline underline-offset-4 hover:text-white",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm:      "h-8 px-3 text-xs",
        xs:      "h-7 px-2.5 text-xs",
        lg:      "h-11 px-6 text-base",
        icon:    "h-9 w-9",
        "icon-sm": "h-7 w-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled ?? loading}
        {...props}
      >
        {asChild ? children : (
          <>
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/20 border-t-current opacity-70" />
            )}
            {children}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
