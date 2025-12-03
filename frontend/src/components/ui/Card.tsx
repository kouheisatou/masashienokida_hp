import React from "react";
import { cn } from "@/lib/utils";

export const Card = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "bg-bg-base border-4 border-double border-border-main p-8 md:p-16 shadow-2xl relative",
                className
            )}
            {...props}
        >
            {/* Corner Decorations (Optional, adds to the theater feel) */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-text-accent opacity-50" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-text-accent opacity-50" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-text-accent opacity-50" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-text-accent opacity-50" />

            {props.children}
        </div>
    );
});

Card.displayName = "Card";
