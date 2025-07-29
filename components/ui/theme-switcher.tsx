"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";

interface ThemeSwitcherProps {
  className?: string;
  variant?: "default" | "minimal" | "floating";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "center";
}

const ThemeSwitcher = ({
  className,
  variant = "default",
  size = "md",
  showLabel = false,
  position = "top-right"
}: ThemeSwitcherProps) => {
  const [theme, setTheme] = useState<string>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  };

  const variantClasses = {
    default: "bg-neutral-200/40 dark:bg-neutral-800 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors",
    minimal: "hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors",
    floating: "bg-white dark:bg-neutral-900 shadow-lg border border-neutral-200 dark:border-neutral-700 rounded-full hover:shadow-xl transition-all"
  };

  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "center": "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
  };

  const containerClasses = cn(
    "flex items-center justify-center cursor-pointer",
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  const wrapperClasses = cn(
    position === "center" ? "fixed z-50" : "absolute",
    positionClasses[position]
  );

  if (!mounted) {
    return null;
  }

  return (
    <div className={wrapperClasses}>
      <div className={containerClasses} onClick={toggleTheme}>
        {theme === "light" ? (
          <Moon className="h-5 w-5 text-neutral-700" />
        ) : (
          <Sun className="h-5 w-5 text-neutral-300" />
        )}
        {showLabel && (
          <span className="ml-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {theme === "light" ? "Dark" : "Light"}
          </span>
        )}
      </div>
    </div>
  );
};

export default ThemeSwitcher; 