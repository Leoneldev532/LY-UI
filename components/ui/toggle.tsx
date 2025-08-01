"use client";

import React, { forwardRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

export interface ToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof toggleVariants> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  showLabel?: boolean;
  label?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  themeToggle?: boolean;
}

const toggleVariants = cva(
  "relative inline-flex cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-neutral-300",
  {
    variants: {
      variant: {
        default: "bg-neutral-200 dark:bg-neutral-700",
        primary: "bg-neutral-200 dark:bg-neutral-700",
        success: "bg-green-200 dark:bg-green-700",
        warning: "bg-yellow-200 dark:bg-yellow-700",
        danger: "bg-red-200 dark:bg-red-700",
      },
      size: {
        sm: "h-5 w-9",
        md: "h-6 w-11",
        lg: "h-7 w-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

const toggleThumbVariants = cva(
  "pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform",
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

// Hook pour la gestion du thème
function useThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Appliquer le thème
    const applyTheme = (newTheme: 'light' | 'dark') => {
      document.documentElement.classList.toggle("dark", newTheme === 'dark');
      document.documentElement.classList.toggle("light", newTheme === 'light');
      localStorage.setItem("theme", newTheme);
      setTheme(newTheme);
    };

    // Détecter le thème système
    const detectSystemTheme = () =>
      window.matchMedia("(prefers-color-scheme: dark)").matches ? 'dark' : 'light';

    // Initialiser le thème
    const savedTheme = localStorage.getItem("theme") as 'light' | 'dark' | null;
    const initialTheme = savedTheme || detectSystemTheme();
    applyTheme(initialTheme);

    // Écouter les changements du thème système
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      // Appliquer le thème système seulement si aucun thème n'est explicitement sauvegardé
      if (!localStorage.getItem("theme")) {
        applyTheme(newSystemTheme);
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, []);

  // Fonction pour basculer le thème
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle("dark", newTheme === 'dark');
    document.documentElement.classList.toggle("light", newTheme === 'light');
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
  };

  return { theme, toggleTheme };
}

const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      checked: controlledChecked,
      onCheckedChange,
      showLabel = false,
      label,
      icon,
      loading = false,
      disabled,
      themeToggle = false,
      ...props
    },
    ref
  ) => {
    const { theme, toggleTheme } = useThemeToggle();
    const [internalChecked, setInternalChecked] = useState(theme === 'dark');

    // Synchroniser l'état interne avec le thème ou la prop checked
    useEffect(() => {
      if (themeToggle) {
        setInternalChecked(theme === 'dark');
      } else if (controlledChecked !== undefined) {
        setInternalChecked(controlledChecked);
      }
    }, [theme, controlledChecked, themeToggle]);

    const handleClick = () => {
      if (disabled || loading) return;

      const newChecked = !internalChecked;
      setInternalChecked(newChecked);

      if (themeToggle) {
        toggleTheme();
      }

      if (onCheckedChange) {
        onCheckedChange(newChecked);
      }
    };

    return (
      <div className="flex items-center gap-2">
        <button
          ref={ref}
          type="button"
          role="switch"
          aria-checked={internalChecked}
          disabled={disabled || loading}
          className={cn(
            toggleVariants({ variant, size }),
            internalChecked && "bg-neutral-900 dark:bg-neutral-100",
            className
          )}
          onClick={handleClick}
          aria-label={label}
          {...props}
        >
          <span
            className={cn(
              toggleThumbVariants({ size }),
              internalChecked && "translate-x-full",
              loading && "animate-pulse"
            )}
          >
            {icon && (
              <div className="flex items-center justify-center w-full h-full">
                {icon}
              </div>
            )}
          </span>
        </button>
        {showLabel && label && (
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {label}
          </span>
        )}
      </div>
    );
  }
);
// -------------

Toggle.displayName = "Toggle";

export { Toggle, toggleVariants };