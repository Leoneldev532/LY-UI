"use client";
import { Button } from "@/components/ui/button";
import React, { ReactNode } from "react";

interface TagButtonProps {
    icon?: ReactNode;
    title: string;
    variant: "default" | "outline" | "ghost";
    onClick?: () => void; // Ajout de la prop onClick
}

const TagButton: React.FC<TagButtonProps> = ({ icon, title, variant = "default", onClick }) => {
    return (
        <Button
            variant={variant}
            type="button"
            role="tab"
            aria-selected="false"
            onClick={onClick} // Ajout du handler onClick
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
};

TagButton.displayName = 'TagButton';
export default TagButton;
