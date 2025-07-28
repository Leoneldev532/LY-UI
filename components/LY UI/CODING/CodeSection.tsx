"use client";

import Editor from "@monaco-editor/react";
import React, { forwardRef, useRef, useState, useEffect, useCallback } from "react";
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
    const [containerHeight, setContainerHeight] = useState(minHeight);
    const codeValueRef = useRef<string>(defaultValue);
    const editorRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Convert CSS units to pixels for calculations
    const parseHeightValue = useCallback((value: string): number => {
      if (value.endsWith('px')) {
        return parseInt(value);
      } else if (value.endsWith('vh')) {
        return (parseInt(value) * window.innerHeight) / 100;
      } else if (value.endsWith('%')) {
        return (parseInt(value) * window.innerHeight) / 100;
      }
      return parseInt(value) || 200;
    }, []);

    useEffect(() => {
      setCurrentValue(defaultValue);
      codeValueRef.current = defaultValue;
    }, [defaultValue]);

    // Automatic height calculation based on content
    const calculateDynamicHeight = useCallback((textContent: string): string => {
      const lines = textContent.split('\n');
      const lineCount = Math.max(1, lines.length);
      const lineHeight = 19;
      const headerHeight = 50; // Header height with padding
      const padding = 20; // Extra padding
      
      const minHeightPx = parseHeightValue(minHeight);
      const maxHeightPx = parseHeightValue(maxHeight);
      
      const calculatedHeight = Math.max(
        minHeightPx,
        Math.min(
          lineCount * lineHeight + headerHeight + padding,
          maxHeightPx
        )
      );

      return `${calculatedHeight}px`;
    }, [minHeight, maxHeight, parseHeightValue]);

    // Auto-scroll to the last line in progressive mode
    const scrollToBottom = useCallback(() => {
      if (editorRef.current && progressiveMode && isWriting) {
        requestAnimationFrame(() => {
          const editor = editorRef.current;
          const model = editor.getModel();
          if (model) {
            const lineCount = model.getLineCount();
            editor.revealLine(lineCount, 1); // 1 = Smooth scroll
            editor.setPosition({ lineNumber: lineCount, column: 1 });
          }
        });
      }
    }, [progressiveMode, isWriting]);

    // Update height and scroll in progressive mode
    useEffect(() => {
      if (progressiveMode) {
        const newHeight = calculateDynamicHeight(displayedText);
        setContainerHeight(prevHeight => {
          if (prevHeight !== newHeight) {
            return newHeight;
          }
          return prevHeight;
        });
        
        // Scroll to bottom after content update
        scrollToBottom();
      } else if (autoHeight) {
        const newHeight = calculateDynamicHeight(currentValue);
        setContainerHeight(prevHeight => {
          if (prevHeight !== newHeight) {
            return newHeight;
          }
          return prevHeight;
        });
      }
    }, [displayedText, currentValue, progressiveMode, autoHeight, calculateDynamicHeight, scrollToBottom]);

    // Effect for editor mount
    useEffect(() => {
      if (autoHeight && !progressiveMode && editorRef.current) {
        const editor = editorRef.current;
        
        const disposable = editor.onDidChangeModelContent(() => {
          const model = editor.getModel();
          if (model) {
            const newHeight = calculateDynamicHeight(model.getValue());
            setContainerHeight(prevHeight => {
              if (prevHeight !== newHeight) {
                return newHeight;
              }
              return prevHeight;
            });
          }
        });

        return () => disposable.dispose();
      }
    }, [autoHeight, progressiveMode, calculateDynamicHeight]);

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
      
      // Initial configuration for auto scroll
      if (progressiveMode) {
        editor.updateOptions({
          scrollBeyondLastLine: false,
          automaticLayout: true,
        });
      }
    };

    const handleCopy = async () => {
      if (processLoading) return;
      try {
        const textToCopy = progressiveMode ? displayedText : codeValueRef.current;
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    };

    const handleDownload = () => {
      if (processLoading) return;
      const textToDownload = progressiveMode ? displayedText : codeValueRef.current;
      const blob = new Blob([textToDownload], { type: "text/plain" });
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

    // Determine if we use dynamic height
    const shouldUseDynamicHeight = autoHeight || progressiveMode;
    const finalHeight = shouldUseDynamicHeight ? containerHeight : height;

    return (
      <div
        className={cn(
          "rounded-md flex flex-col gap-y-2 border transition-all duration-200 ease-out",
          CodeSectionVariants({ variant }),
          className
        )}
        ref={containerRef}
        style={{
          height: shouldUseDynamicHeight ? containerHeight : finalHeight,
          minHeight: minHeight,
          maxHeight: shouldUseDynamicHeight ? maxHeight : undefined,
          overflow: "hidden",
        }}
      >
        <div className="flex w-full justify-between p-2 items-center">
          <div className="flex justify-center items-center gap-2 px-2 py-1 rounded-lg text-black dark:text-neutral-200">
            <Code size={15} /> 
            <span className="text-sm">Code</span>
            
            {/* Animation indicator - Blinking green dot */}
            {progressiveMode && isWriting && (
              <div className="flex items-center gap-1 ml-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Generating...
                </span>
              </div>
            )}
            
            {/* Completion indicator */}
            {progressiveMode && isComplete && (
              <div className="flex items-center gap-1 ml-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Done
                </span>
              </div>
            )}
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

        <div 
          className="flex-1 overflow-hidden" 
          style={{ 
            minHeight: `calc(${minHeight} - 50px)`,
            height: `calc(${containerHeight} - 50px)`
          }}
        >
          <Editor
            defaultLanguage={defaultLanguage}
            value={progressiveMode ? displayedText : currentValue}
            theme="vs-dark"
            height="100%"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
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
              readOnly: !isEditable || (progressiveMode && isWriting),
              smoothScrolling: true,
              cursorBlinking: progressiveMode && isWriting ? "solid" : "blink",
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