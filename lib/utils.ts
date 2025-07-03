import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const globalVariants = {
   variant: {
      default: "border bg-neutral-200/40 dark:bg-neutral-200/20 dark:hover:bg-neutral-200/40 text-black  dark:border-neutral-200/20  border-neutral-300/50 dark:text-neutral-200",
      ghost: "dark:hover:bg-neutral-700/40 dark:hover:bg-neutral-500/40 hover:bg-gray-200/40 bg-neutral-200/40 hover:bg-neutral-300/60 dark:bg-neutral-700 dark:text-gray-200",
      outline: "border border-neutral-300/40 dark:hover:bg-neutral-500/40 hover:bg-gray-200/40  dark:text-gray-200",
      none:"bg-none border-none",
    },
}
