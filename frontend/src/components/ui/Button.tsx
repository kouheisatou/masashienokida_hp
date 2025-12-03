import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "outline", size = "md", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "uppercase tracking-[0.2em] transition-all duration-300 font-sans font-bold",
                    "border border-border-main text-text-primary hover:bg-bg-accent hover:text-white",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    {
                        "px-4 py-2 text-xs": size === "sm",
                        "px-6 py-3 text-sm": size === "md",
                        "px-8 py-4 text-base": size === "lg",
                    },
                    className
                )}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";
