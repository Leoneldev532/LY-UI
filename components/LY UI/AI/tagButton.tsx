"use client";
import { Button } from "@/components/ui/button";
import React, { ReactNode, forwardRef, useState } from "react";
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight } from "lucide-react";

interface TagButtonProps {
    icon?: ReactNode;
    title: string;
    variant: "default" | "outline" | "ghost";
    onClick?: () => void;
    items?: string[];
    onItemClick?: (item: string) => void;
}

const TagButton = forwardRef<HTMLButtonElement, TagButtonProps>(
    ({ icon, title, variant = "default", onClick, items = [], onItemClick, ...props }, ref) => {
        const [show, setShow] = useState<boolean>(false);

        const handleShow = () => {
            setShow(true);
        };

        const handleItemClick = (item: string) => {
            if (onItemClick) {
                onItemClick(item);
            }
            setShow(false);
        };

        const handleClose = () => {
            setShow(false);
        }

        const MotionButton = motion(Button);

        return (
            <div className="relative inline-block">
                <AnimatePresence>
                    {!show && (
                        <MotionButton
                            ref={ref}
                            variant={variant}
                            type="button"
                            role="tab"
                            className="relative"
                            aria-selected="false"
                            exit={{
                                opacity: 0,
                                scale: 0.9,
                                transition: {
                                    duration: 0.2,
                                    ease: [0.4, 0, 0.2, 1],
                                }
                            }}
                            initial={{ opacity: 1, scale: 1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{
                                scale: 1.02,
                                transition: { duration: 0.2 }
                            }}
                            whileTap={{
                                scale: 0.98,
                                transition: { duration: 0.1 }
                            }}
                            onClick={handleShow}
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
                        </MotionButton>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {show && (
                        <motion.div
                            initial={{
                                opacity: 0,
                                scale: 0.95,
                                y: -20
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.95,
                                y: -20,
                                transition: {
                                    duration: 0.15,
                                    ease: [0.4, 0, 0.2, 1],
                                }
                            }}
                            transition={{
                                duration: 0.25,
                                ease: [0.25, 0.1, 0.25, 1],
                                type: "spring",
                                damping: 25,
                                stiffness: 400
                            }}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col p-4 rounded-xl w-80 bg-neutral-700/95 shadow-2xl border border-neutral-500/50 backdrop-blur-md z-50"
                        >
                            <div className="flex gap-x-2 w-full justify-between items-center mb-3">
                                <span className="text-white font-medium text-sm">{title}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="bg-transparent hover:bg-neutral-600 text-white p-1 h-7 w-7 rounded-md"
                                    onClick={handleClose}
                                >
                                    <X size={14} />
                                </Button>
                            </div>

                            <ul className="w-full space-y-1 max-h-60 overflow-y-auto">
                                {items.length > 0 ? (
                                    items.map((item, index) => (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{
                                                opacity: 1,
                                                x: 0,
                                                transition: {
                                                    delay: index * 0.05,
                                                    duration: 0.2
                                                }
                                            }}
                                            className="text-neutral-200 hover:text-white cursor-pointer py-2 px-3 rounded-md hover:bg-neutral-600 transition-all duration-200 text-sm flex items-center justify-between group"
                                            onClick={() => handleItemClick(item)}
                                        >
                                            <span className="flex-1">{item}</span>
                                            <ChevronRight
                                                size={14}
                                                className="text-neutral-400 group-hover:text-white transition-colors duration-200"
                                            />
                                        </motion.li>
                                    ))
                                ) : (
                                    <motion.li
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-neutral-200 hover:text-white cursor-pointer py-2 px-3 rounded-md hover:bg-neutral-600 transition-all duration-200 text-sm flex items-center justify-between group"
                                        onClick={() => handleItemClick("Hello les amis")}
                                    >
                                        <span className="flex-1">Hello les amis</span>
                                        <ChevronRight
                                            size={14}
                                            className="text-neutral-400 group-hover:text-white transition-colors duration-200"
                                        />
                                    </motion.li>
                                )}
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }
);

TagButton.displayName = 'TagButton';
export default TagButton;
