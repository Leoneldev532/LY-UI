"use client";
import { Button } from "@/components/ui/button";
import React, { ReactNode, forwardRef } from "react";

interface TagButtonProps {
    icon?: ReactNode;
    title: string;
    variant: "default" | "outline" | "ghost";
    onClick?: () => void;
}

const TagButton = forwardRef<HTMLButtonElement, TagButtonProps>(
    ({ icon, title, variant = "default", onClick, ...props }, ref) => {
        return (
            <Button
                ref={ref}
                variant={variant}
                type="button"
                role="tab"
                aria-selected="false"
                onClick={onClick}
                {...props}
            >
                <div className="flex items-center gap-x-2">
                    {icon && (
                        <span>
                            {icon}
                        </span>
                    )}
                    <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                        {title}
                    </span>
                </div>
            </Button>
        );
    }
);

TagButton.displayName = 'TagButton';
export default TagButton;
