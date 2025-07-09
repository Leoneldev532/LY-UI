"use client";

import { useRef, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Check, CheckCheck, ChevronDown, Terminal } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { OpenInV0Button } from "../open-in-v0-button";
import ShadcnIcon from "../icons/shadcn";

const prePath = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

interface PreviewContentProps {
  link: string;
  prePath: string;
  isBlock?: boolean;
}

export default function PreviewContent({ link, prePath, isBlock = false }: PreviewContentProps) {
  const [isPending, startTransition] = useTransition();
  const [isTerminalCopied, setIsTerminalCopied] = useState(false);
  const [selectedPackageManager, setSelectedPackageManager] = useState<"bunx" | "npx" | "pnpm">("bunx");
  const terminalButtonRef = useRef<HTMLButtonElement>(null);

  const getFileName = () => {
    const [folder, filename] = link.split("/");
    return filename ? filename : folder;
  };

  const handleTerminalClick = (packageManager?: "bunx" | "npx" | "pnpm") => {
    const [folder, filename] = link.split("/");
    const componentName = filename ? filename : folder;
    const pm = packageManager || selectedPackageManager;

    let commandToCopy: string;
    const componentAddCommand = `shadcn@latest add ${prePath}/r/${componentName}`;

    if (pm === "pnpm") {
      commandToCopy = `pnpm dlx ${componentAddCommand}`;
    } else {
      commandToCopy = `${pm} ${componentAddCommand}`;
    }

    startTransition(() => {
      navigator.clipboard.writeText(commandToCopy);
      setIsTerminalCopied(true);
      setTimeout(() => setIsTerminalCopied(false), 1000);
    });
  };

  const openInV0 = () => {
    const [folder, filename] = link.split("/");
    return filename ? filename : folder;
  };

  function SuccessParticles({ buttonRef }: { buttonRef: React.RefObject<HTMLButtonElement | null> }) {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return null;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const particles = Array.from({ length: 6 }, (_, index) => ({
      id: `particle-${index}-${Math.random().toString(36).substr(2, 9)}`,
      index,
    }));

    return (
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="fixed w-1 h-1 bg-black dark:bg-white rounded-full"
            style={{ left: centerX, top: centerY }}
            initial={{ scale: 0, x: 0, y: 0 }}
            animate={{
              scale: [0, 1, 0],
              x: [(particle.index % 2 ? 1 : -1) * (Math.random() * 50 + 20)],
              y: [-Math.random() * 50 - 20],
            }}
            transition={{
              duration: 0.6,
              delay: particle.index * 0.1,
              ease: "easeOut",
            }}
          />
        ))}
      </AnimatePresence>
    );
  }

  return (
    <>
      {isTerminalCopied && <SuccessParticles buttonRef={terminalButtonRef} />}
      <div className={cn("relative mt-4", "rounded-xl p-3")}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <a
            href={`${prePath}/preview/${link}`}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "flex items-center gap-2",
              "text-sm font-medium",
              "text-zinc-800 dark:text-zinc-200",
              "hover:text-zinc-600 dark:hover:text-zinc-400",
              "transition-all duration-200 no-underline group"
            )}
          >
            Live Preview
            <ArrowUpRight
              className={cn(
                "h-4 w-4",
                "transition-transform duration-200 group-hover:rotate-12"
              )}
            />
          </a>

          <div className="flex items-center gap-2">
            <OpenInV0Button name={openInV0()} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  ref={terminalButtonRef}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 px-3 text-xs font-medium",
                    "text-black border hover:bg-zinc-200 dark:bg-transparent dark:text-white dark:border-zinc-600 dark:hover:bg-zinc-700",
                    "transition-all duration-200",
                    "flex items-center gap-1 rounded-xl shadow-none"
                  )}
                  title="copy ce composant à votre projet"
                >
                  {isTerminalCopied ? (
                    <CheckCheck className="h-3.5 w-3.5 text-white dark:text-black" />
                  ) : (
                    <ShadcnIcon className="h-3.5 w-3.5" />
                  )}
                  <span>
                    copy
                     {/* <span className="font-semibold">{getFileName()}</span> */}
                     <span className="font-semibold"> command</span>
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-70 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[190px] bg-black dark:bg-white text-white dark:text-black rounded-lg border border-neutral-700 dark:border-neutral-300"
              >
                <DropdownMenuItem
                  onSelect={() => {
                    setSelectedPackageManager("bunx");
                    handleTerminalClick("bunx");
                  }}
                  className="flex items-center gap-2 hover:bg-neutral-800 dark:hover:bg-neutral-200 focus:bg-neutral-800 dark:focus:bg-neutral-200"
                >
                  <Terminal className="h-3.5 w-3.5 text-white dark:text-black" />
                  <span className="text-white dark:text-black"> bunx</span>
                  {selectedPackageManager === "bunx" && (
                    <Check className="h-4 w-4 ml-auto text-white dark:text-black" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    setSelectedPackageManager("npx");
                    handleTerminalClick("npx");
                  }}
                  className="flex items-center gap-2 hover:bg-neutral-800 dark:hover:bg-neutral-200 focus:bg-neutral-800 dark:focus:bg-neutral-200"
                >
                  <Terminal className="h-3.5 w-3.5 text-white dark:text-black" />
                  <span className="text-white dark:text-black"> npx</span>
                  {selectedPackageManager === "npx" && (
                    <Check className="h-4 w-4 ml-auto text-white dark:text-black" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    setSelectedPackageManager("pnpm");
                    handleTerminalClick("pnpm");
                  }}
                  className="flex items-center gap-2 hover:bg-neutral-800 dark:hover:bg-neutral-200 focus:bg-neutral-800 dark:focus:bg-neutral-200"
                >
                  <Terminal className="h-3.5 w-3.5 text-white dark:text-black" />
                  <span className="text-white dark:text-black"> pnpm</span>
                  {selectedPackageManager === "pnpm" && (
                    <Check className="h-4 w-4 ml-auto text-white dark:text-black" />
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      {/* ------------0-----------0+++++++++++++++ ...........*/}
    </>
  );
}