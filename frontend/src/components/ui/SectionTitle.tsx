import React from "react";
import { cn } from "@/lib/utils";

interface SectionTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    subtitle?: string;
}

export const SectionTitle = React.forwardRef<HTMLHeadingElement, SectionTitleProps>(
    ({ className, children, subtitle, ...props }, ref) => {
        return (
            <div className="text-center mb-16 space-y-4">
                <h2
                    ref={ref}
                    className={cn(
                        "text-3xl font-serif italic font-medium text-text-primary",
                        className
                    )}
                    {...props}
                >
                    {children}
                </h2>
                {subtitle && (
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-8 h-[1px] bg-line-main" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-text-accent">
                            {subtitle}
                        </span>
                        <div className="w-8 h-[1px] bg-line-main" />
                    </div>
                )}
            </div>
        );
    }
);

SectionTitle.displayName = "SectionTitle";
