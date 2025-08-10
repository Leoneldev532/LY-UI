"use client";
import Editor, { OnMount } from "@monaco-editor/react";
import React, { forwardRef, useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { Code, History, Copy, Check, Download } from "lucide-react";
import { useProgressiveText } from "@/components/hooks/useProgressiveText";

const CodeSectionVariants = cva(
  "relative max-w-3xl w-full rounded-xl text-neutral-900 dark:text-gray-200 inline-block text-left",
  {
    variants: {
      variant: {
        default:
          "bg-neutral-200/40 dark:border-neutral-200/20 border border-neutral-300/50 dark:bg-neutral-900 dark:text-gray-200 text-neutral-700",
        ghost: "bg-neutral-200/40 dark:border-neutral-200/20 dark:text-gray-200",
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
  // Nouvelle prop pour contrôler la vitesse d'affichage
  typingSpeed?: number; // en millisecondes par caractère
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
      typingSpeed = 8, // Vitesse optimisée : 8ms au lieu de 50ms
    },
    ref
  ) => {
    // Hook progressif avec vitesse optimisée
    const { displayedText, isWriting, isComplete } = useProgressiveText(
      defaultValue,
      processLoading && progressiveMode,
      typingSpeed
    );

    const [copied, setCopied] = useState(false);
    const [currentValue, setCurrentValue] = useState(defaultValue);
    const [containerHeight, setContainerHeight] = useState(minHeight);
    const codeValueRef = useRef<string>(defaultValue);
    const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const parseHeightValue = useCallback((value: string): number => {
      if (value.endsWith("px")) return parseInt(value);
      if (value.endsWith("vh")) return (parseInt(value) * window.innerHeight) / 100;
      if (value.endsWith("%")) return (parseInt(value) * window.innerHeight) / 100;
      return parseInt(value) || 200;
    }, []);

    // Optimisation : éviter les re-renders inutiles
    useEffect(() => {
      if (defaultValue !== codeValueRef.current) {
        setCurrentValue(defaultValue);
        codeValueRef.current = defaultValue;
      }
    }, [defaultValue]);

    const calculateDynamicHeight = useCallback(
      (textContent: string): string => {
        const lines = textContent.split("\n");
        const lineCount = Math.max(1, lines.length);
        const lineHeight = 19;
        const headerHeight = 50;
        const padding = 20;

        const minHeightPx = parseHeightValue(minHeight);
        const maxHeightPx = parseHeightValue(maxHeight);

        const calculatedHeight = Math.max(
          minHeightPx,
          Math.min(lineCount * lineHeight + headerHeight + padding, maxHeightPx)
        );

        return `${calculatedHeight}px`;
      },
      [minHeight, maxHeight, parseHeightValue]
    );

    // Optimisation du scroll : utiliser requestAnimationFrame
    const scrollToBottom = useCallback(() => {
      if (editorRef.current && progressiveMode && isWriting) {
        requestAnimationFrame(() => {
          const editor = editorRef.current;
          if (editor) {
            const model = editor.getModel();
            if (model) {
              const lineCount = model.getLineCount();
              editor.revealLine(lineCount, 1);
            }
          }
        });
      }
    }, [progressiveMode, isWriting]);

    // Optimisation : debounce des calculs de hauteur
    useEffect(() => {
      let timeoutId: NodeJS.Timeout;

      const updateHeight = () => {
        const textToMeasure = progressiveMode ? displayedText : currentValue;
        if (progressiveMode || autoHeight) {
          const newHeight = calculateDynamicHeight(textToMeasure);
          setContainerHeight(newHeight);
        }
      };

      if (progressiveMode && isWriting) {
        // Pendant l'écriture, mise à jour plus fréquente mais throttlée
        timeoutId = setTimeout(updateHeight, 16); // ~60fps
        scrollToBottom();
      } else {
        // Mise à jour immédiate quand pas en cours d'écriture
        updateHeight();
      }

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }, [displayedText, currentValue, progressiveMode, autoHeight, isWriting, calculateDynamicHeight, scrollToBottom]);

    // Optimisation : écouter les changements de contenu seulement quand nécessaire
    useEffect(() => {
      if (autoHeight && !progressiveMode && editorRef.current) {
        const editor = editorRef.current;
        let timeoutId: NodeJS.Timeout;

        const disposable = editor.onDidChangeModelContent(() => {
          // Debounce pour éviter trop de calculs
          if (timeoutId) clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            const model = editor.getModel();
            if (model) {
              const newHeight = calculateDynamicHeight(model.getValue());
              setContainerHeight(newHeight);
            }
          }, 100);
        });

        return () => {
          disposable.dispose();
          if (timeoutId) clearTimeout(timeoutId);
        };
      }
    }, [autoHeight, progressiveMode, calculateDynamicHeight]);

    // Callback optimisé pour onComplete
    useEffect(() => {
      if (progressiveMode && isComplete && typeof onComplete === "function") {
        // Délai court pour s'assurer que l'UI est mise à jour
        const timeoutId = setTimeout(() => {
          onComplete();
        }, 50);
        return () => clearTimeout(timeoutId);
      }
    }, [progressiveMode, isComplete, onComplete]);

    const handleEditorChange = useCallback((value: string | undefined) => {
      const newValue = value ?? "";
      setCurrentValue(newValue);
      codeValueRef.current = newValue;
    }, []);

    const handleEditorDidMount: OnMount = useCallback((editor) => {
      editorRef.current = editor;
      if (progressiveMode) {
        editor.updateOptions({
          scrollBeyondLastLine: false,
          automaticLayout: true,
          // Optimisations pour de meilleures performances
          renderLineHighlight: 'none',
          renderIndentGuides: false,
          renderValidationDecorations: 'off',
        });
      }
    }, [progressiveMode]);

    const handleCopy = useCallback(async () => {
      if (processLoading && isWriting) return;
      try {
        const textToCopy = progressiveMode ? displayedText : codeValueRef.current;
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      } catch (err) {
        console.error("Failed to copy text:", err);
      }
    }, [processLoading, isWriting, progressiveMode, displayedText]);

    const handleDownload = useCallback(() => {
      if (processLoading && isWriting) return;
      const textToDownload = progressiveMode ? displayedText : codeValueRef.current;
      const blob = new Blob([textToDownload], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `code.${defaultLanguage === 'javascript' ? 'js' : defaultLanguage}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, [processLoading, isWriting, progressiveMode, displayedText, defaultLanguage]);

    const shouldUseDynamicHeight = autoHeight || progressiveMode;
    const finalHeight = shouldUseDynamicHeight ? containerHeight : height;

    // Valeur à afficher dans l'éditeur
    const editorValue = progressiveMode ? displayedText : currentValue;

    return (
      <div
        className={cn(CodeSectionVariants({ variant }), className)}
        ref={ref || containerRef}
        style={{
          height: finalHeight,
          minHeight,
          maxHeight: shouldUseDynamicHeight ? maxHeight : undefined,
          overflow: "hidden",
        }}
      >
        <div className="flex w-full justify-between p-2 items-center bg-neutral-100/50 dark:bg-neutral-800/50 rounded-t-xl border-b border-neutral-300/30 dark:border-neutral-700/30">
          <div className="flex justify-center items-center gap-2 px-2 py-1 rounded-lg text-black dark:text-neutral-200">
            <Code size={15} />
            <span className="text-sm font-medium">{defaultLanguage}</span>
            {progressiveMode && isWriting && (
              <div className="flex items-center gap-1 ml-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Generating...
                </span>
              </div>
            )}
            {progressiveMode && isComplete && (
              <div className="flex items-center gap-1 ml-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Complete
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2 justify-center items-center">
            <button
              disabled={processLoading && isWriting}
              type="button"
              className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              style={(processLoading && isWriting) ? { opacity: 0.5, pointerEvents: "none" } : {}}
            >
              <History
                size={16}
                className="dark:text-neutral-200 text-neutral-700"
              />
            </button>
            <button
              onClick={handleCopy}
              title="Copy code"
              type="button"
              disabled={processLoading && isWriting}
              className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              style={(processLoading && isWriting) ? { opacity: 0.5, pointerEvents: "none" } : {}}
            >
              {copied ? (
                <Check
                  size={16}
                  className="dark:text-green-400 text-green-600"
                />
              ) : (
                <Copy
                  size={16}
                  className="dark:text-neutral-200 text-neutral-700"
                />
              )}
            </button>
            <button
              onClick={handleDownload}
              title="Download code"
              type="button"
              disabled={processLoading && isWriting}
              className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              style={(processLoading && isWriting) ? { opacity: 0.5, pointerEvents: "none" } : {}}
            >
              <Download size={16} className="dark:text-neutral-200 text-neutral-700" />
            </button>
          </div>
        </div>
        <div
          className="flex-1 overflow-hidden"
          style={{
            minHeight: `calc(${minHeight} - 50px)`,
            height: `calc(${containerHeight} - 46px)`,
          }}
        >
          <Editor
            defaultLanguage={defaultLanguage}
            value={editorValue}
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
              // Optimisations pour de meilleures performances
              renderLineHighlight: progressiveMode ? 'none' : 'line',
              renderIndentGuides: !progressiveMode,
              renderValidationDecorations: progressiveMode ? 'off' : 'editable',
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
