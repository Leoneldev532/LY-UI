"use client";

import Editor from "@monaco-editor/react";
import React, { forwardRef, useRef, useState, useEffect } from "react";
import { cn, globalVariants } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { Code, History, Copy, Check, Download } from "lucide-react";
import { useProgressiveText } from "@/components/hooks/useProgressiveText";

const CodeSectionVariants = cva(
  "relative lg:min-w-xl max-w-3xl relative w-full rounded-xl text-neutral-900 dark:text-gray-200 inline-block text-left",
  {
    variants: {
      variant: {
        default:
          "bg-neutral-200/40 dark:border-neutral-200/20 border border-neutral-300/50 dark:bg-neutral-900 dark:text-gray-200 text-neutral-700",
        ghost:
          "bg-neutral-200/40 dark:border-neutral-200/20 dark:text-gray-200",
        outline:
          "border border-neutral-300/50 dark:border-neutral-200/40 dark:bg-neutral-900 dark:text-gray-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface CodeSectionProps {
  /** Height of the editor (e.g., '90vh', '300px'). Default: '90vh' */
  height?: string;
  /** Code language for syntax highlighting. Default: 'javascript' */
  defaultLanguage?: string;
  /** Default code to display in the editor. Default: '// some comment' */
  defaultValue?: string;
  /** Additional CSS classes for styling. Default: '' */
  className?: string;
  /** Allows code editing. Default: true */
  isEditable?: boolean;
  /** Visual style of the container. Default: 'default' */
  variant?: "default" | "outline" | "ghost";
  /** If true, disables control buttons (copy, download, etc) when a process is running */
  processLoading?: boolean;
  /** If true, display code progressively using animation */
  progressiveMode?: boolean;
  onComplete?: () => void;
  hideControls?: boolean;
}

const CodeSection = forwardRef<HTMLDivElement, CodeSectionProps>(
  (
    {
      height = "90vh",
      defaultLanguage = "javascript",
      defaultValue = "// some comment",
      className = "",
      isEditable = true,
      variant = "default",
      processLoading = false,
      progressiveMode = false,
      onComplete,
      hideControls = false,
    },
    ref
  ) => {
    // Hook texte progressif
    const { displayedText, isWriting, isComplete } = useProgressiveText(defaultValue, processLoading, 30);
    const [copied, setCopied] = useState(false);
    const [currentValue, setCurrentValue] = useState(defaultValue);
    const codeValueRef = useRef<string>(defaultValue);
    const [editorHeight, setEditorHeight] = useState<number>(200);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setCurrentValue(defaultValue);
      codeValueRef.current = defaultValue;
    }, [defaultValue]);

    // Affichage progressif si progressiveMode
    useEffect(() => {
      if (progressiveMode && !processLoading) {
        setCurrentValue(defaultValue);
        codeValueRef.current = defaultValue;
      }
    }, [progressiveMode, defaultValue, processLoading]);

    // Ajuste la hauteur dynamiquement selon le contenu
    useEffect(() => {
      const value = progressiveMode ? displayedText : currentValue;
      const lines = value.split('\n').length;
      // 24px par ligne + padding, max 600px
      const newHeight = Math.min(600, Math.max(120, lines * 24 + 32));
      setEditorHeight(newHeight);
      // Ajuste la hauteur du bloc parent
      if (containerRef.current) {
        containerRef.current.style.height = `${newHeight + 60}px`; // +60 pour la barre de contrôle et padding
      }
    }, [displayedText, currentValue, progressiveMode]);

    useEffect(() => {
      if (progressiveMode && isComplete && onComplete) {
        onComplete();
      }
    }, [progressiveMode, isComplete, onComplete]);

    const handleEditorChange = (value: string | undefined) => {
      const newValue = value ?? "";
      setCurrentValue(newValue);
      codeValueRef.current = newValue;
    };

    const handleCopy = async () => {
      if (processLoading) return;
      try {
        await navigator.clipboard.writeText(codeValueRef.current);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      } catch (err) {}
    };

    const handleDownload = () => {
      if (processLoading) return;
      const blob = new Blob([codeValueRef.current], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "code.html";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
    };

    return (
      <div
        ref={containerRef}
        className={cn(
          "rounded-md flex flex-col gap-y-2 overflow-hidden border transition-all duration-300",
          CodeSectionVariants({ variant }),
          className
        )}
        style={{ minHeight: 120, maxHeight: 700, height: editorHeight + 60 }}
      >
        {/* Toolbar (barre de contrôle) */}
        {!(progressiveMode || hideControls) && (
          <div className="flex w-full justify-between p-2 items-center">
            <div
              className="flex justify-center items-center gap-2 px-2 py-1 rounded-lg  
              text-black    dark:text-neutral-200"
            >
              <Code size={15} /> <span className="text-sm">Code</span>
            </div>

            <div className="flex gap-3 justify-center items-center">
              <button
                disabled={!!processLoading}
                type="button"
                tabIndex={processLoading ? -1 : 0}
                style={processLoading ? { opacity: 0.5, pointerEvents: "none" } : {}}
              >
                <History
                  size={20}
                  className="dark:text-neutral-200 cursor-pointer  text-neutral-700"
                />
              </button>

              <button
                onClick={handleCopy}
                className="flex items-center justify-center"
                title="Copy code"
                type="button"
                disabled={!!processLoading}
                tabIndex={processLoading ? -1 : 0}
                style={processLoading ? { opacity: 0.5, pointerEvents: "none" } : {}}
              >
                {copied ? (
                  <Check
                    size={16}
                    className="dark:text-neutral-200 cursor-pointer  text-neutral-700 transition-colors"
                  />
                ) : (
                  <Copy
                    size={16}
                    className="dark:text-neutral-200 cursor-pointer  text-neutral-700"
                  />
                )}
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center justify-center"
                title="Télécharger en .html"
                type="button"
                disabled={!!processLoading}
                tabIndex={processLoading ? -1 : 0}
                style={processLoading ? { opacity: 0.5, pointerEvents: "none" } : {}}
              >
                <Download
                  size={16}
                  className="dark:text-neutral-200 text-neutral-700"
                />
              </button>
            </div>
          </div>
        )}
        <Editor
          height={editorHeight}
          defaultLanguage={defaultLanguage}
          value={progressiveMode ? displayedText : currentValue}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            readOnly: progressiveMode ? !isComplete : !isEditable,
          }}
          onChange={handleEditorChange}
          className="overflow-auto max-h-[600px] "
        />
      </div>
    );
  }
);

CodeSection.displayName = "CodeSection";

export default CodeSection;