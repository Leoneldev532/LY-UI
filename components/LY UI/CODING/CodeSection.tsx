"use client";

import Editor from "@monaco-editor/react";
import React, { forwardRef, useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { Code, History, Copy, Check, Download } from "lucide-react";
import { useProgressiveText } from "@/components/hooks/useProgressiveText";

const CodeSectionVariants = cva(
  "relative lg:min-w-xl max-w-3xl w-full rounded-xl text-neutral-900 dark:text-gray-200 inline-block text-left",
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
  height?: string;
  maxHeight?: string;
  minHeight?: string;
  defaultLanguage?: string;
  defaultValue?: string;
  className?: string;
  isEditable?: boolean;
  variant?: "default" | "outline" | "ghost";
  processLoading?: boolean;
  progressiveMode?: boolean;
  onComplete?: () => void;
  autoHeight?: boolean;
}

const CodeSection = forwardRef<HTMLDivElement, CodeSectionProps>(
  (
    {
      height = "90vh",
      maxHeight = "80vh",
      minHeight = "200px",
      defaultLanguage = "javascript",
      defaultValue = "// some comment",
      className = "",
      isEditable = true,
      variant = "default",
      processLoading = false,
      progressiveMode = false,
      onComplete,
      autoHeight = false,
    },
    ref
  ) => {
    const { displayedText, isWriting, isComplete } = useProgressiveText(
      defaultValue,
      processLoading,
      10
    );

    const [copied, setCopied] = useState(false);
    const [currentValue, setCurrentValue] = useState(defaultValue);
    const [editorHeight, setEditorHeight] = useState(height);
    const codeValueRef = useRef<string>(defaultValue);
    const editorRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setCurrentValue(defaultValue);
      codeValueRef.current = defaultValue;
    }, [defaultValue]);

    useEffect(() => {
      if (autoHeight && editorRef.current) {
        const calculateHeight = () => {
          const editor = editorRef.current;
          if (!editor) return;

          const model = editor.getModel();
          if (model) {
            const lineCount = model.getLineCount();
            const lineHeight = 19;
            const padding = 30; // Increased padding for better spacing

            const calculatedHeight = Math.max(
              parseInt(minHeight),
              Math.min(
                lineCount * lineHeight + padding,
                parseInt(maxHeight)
              )
            );

            setEditorHeight(`${calculatedHeight}px`);
          }
        };

        calculateHeight();

        // Add resize observer for container
        const resizeObserver = new ResizeObserver(calculateHeight);
        if (containerRef.current) {
          resizeObserver.observe(containerRef.current);
        }

        return () => resizeObserver.disconnect();
      }
    }, [currentValue, displayedText, autoHeight, minHeight, maxHeight]);

    useEffect(() => {
      if (progressiveMode && isComplete && typeof onComplete === "function") {
        onComplete();
      }
    }, [progressiveMode, isComplete, onComplete]);

    const handleEditorChange = (value: string | undefined) => {
      const newValue = value ?? "";
      setCurrentValue(newValue);
      codeValueRef.current = newValue;
    };

    const handleEditorDidMount = (editor: any) => {
      editorRef.current = editor;
      editor.onDidChangeModelContent(() => {
        if (autoHeight) {
          const model = editor.getModel();
          if (model) {
            const lineCount = model.getLineCount();
            const lineHeight = 19;
            const padding = 30;

            const calculatedHeight = Math.max(
              parseInt(minHeight),
              Math.min(
                lineCount * lineHeight + padding,
                parseInt(maxHeight)
              )
            );

            setEditorHeight(`${calculatedHeight}px`);
          }
        }
      });
    };

    const handleCopy = async () => {
      if (processLoading) return;
      try {
        await navigator.clipboard.writeText(codeValueRef.current);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    };

    const handleDownload = () => {
      if (processLoading) return;
      const blob = new Blob([codeValueRef.current], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "code.txt";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
    };

    const finalHeight = autoHeight ? editorHeight : height;

    return (
      <div
        className={cn(
          "rounded-md flex flex-col gap-y-2 border",
          CodeSectionVariants({ variant }),
          className
        )}
        ref={containerRef}
        style={{
          height: autoHeight ? 'auto' : finalHeight,
          minHeight: minHeight,
          maxHeight: maxHeight,
          overflow: "hidden",
        }}
      >
        <div className="flex w-full justify-between p-2 items-center">
          <div className="flex justify-center items-center gap-2 px-2 py-1 rounded-lg text-black dark:text-neutral-200">
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
                className="dark:text-neutral-200 cursor-pointer text-neutral-700"
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
                  className="dark:text-neutral-200 cursor-pointer text-neutral-700 transition-colors"
                />
              ) : (
                <Copy
                  size={16}
                  className="dark:text-neutral-200 cursor-pointer text-neutral-700"
                />
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center justify-center"
              title="Download code"
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

        <div className="flex-1 overflow-auto" style={{ minHeight: minHeight }}>
          <Editor
            defaultLanguage={defaultLanguage}
            value={progressiveMode ? displayedText : currentValue}
            theme="vs-dark"
            height={finalHeight}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: true,
              scrollBeyondLastColumn: 5,
              wordWrap: "on",
              automaticLayout: true,
              overviewRulerLanes: 0,
              scrollbar: {
                vertical: "auto",
                horizontal: "auto",
                useShadows: false,
                alwaysConsumeMouseWheel: false,
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
              },
              readOnly: !isEditable,
            }}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
          />
        </div>
      </div>
    );
  }
);

CodeSection.displayName = "CodeSection";

export default CodeSection;
