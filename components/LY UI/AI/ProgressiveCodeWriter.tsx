"use client";

import Editor from "@monaco-editor/react";
import React, { forwardRef, useRef, useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { Code, History, Copy, Check, Download } from "lucide-react";
import { useProgressiveText } from "@/components/hooks/useProgressiveText";

const CodeSectionVariants = cva(
  "relative lg:min-w-xl max-w-3xl w-full rounded-xl text-neutral-900 dark:text-gray-200 text-left",
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
    const lastValueRef = useRef<string>("");

    // Synchronisation initiale et mise à jour de la valeur
    useEffect(() => {
      if (!progressiveMode) {
        setCurrentValue(defaultValue);
        codeValueRef.current = defaultValue;
      }
    }, [defaultValue, progressiveMode]);

    // Mise à jour de codeValueRef quand displayedText change en mode progressif
    useEffect(() => {
      if (progressiveMode) {
        codeValueRef.current = displayedText;
        // Mettre à jour currentValue une fois l'écriture terminée
        if (isComplete) {
          setCurrentValue(displayedText);
        }
      }
    }, [displayedText, isComplete, progressiveMode]);

    // Utilisation de useMemo pour stabiliser la valeur affichée
    const editorValue = useMemo(() => {
      if (progressiveMode) {
        return displayedText;
      }
      return currentValue;
    }, [progressiveMode, displayedText, currentValue]);

    // Calcul de la hauteur adaptative seulement quand nécessaire
    useEffect(() => {
      if (!autoHeight || !editorRef.current || editorValue === lastValueRef.current) {
        return;
      }

      lastValueRef.current = editorValue;

      const calculateHeight = () => {
        const editor = editorRef.current;
        const model = editor.getModel();

        if (model) {
          requestAnimationFrame(() => {
            const lineCount = model.getLineCount();
            const lineHeight = editor.getOption(49); // 49 = EditorOption.lineHeight
            const padding = 40;
            const calculatedHeight = Math.max(
              parseInt(minHeight),
              Math.min(lineCount * lineHeight + padding, parseInt(maxHeight))
            );

            setEditorHeight(`${calculatedHeight}px`);
          });
        }
      };

      // On attend que Monaco ait fini de render
      const timer = setTimeout(calculateHeight, 100);
      return () => clearTimeout(timer);
    }, [editorValue, autoHeight, minHeight, maxHeight]);

    useEffect(() => {
      if (progressiveMode && isComplete && typeof onComplete === "function") {
        onComplete();
      }
    }, [progressiveMode, isComplete, onComplete]);

    const handleEditorChange = (value: string | undefined) => {
      if (!isEditable) return;

      const newValue = value ?? "";
      setCurrentValue(newValue);
      codeValueRef.current = newValue;
    };

    const handleEditorDidMount = (editor: any) => {
      editorRef.current = editor;
      if (autoHeight) {
        const model = editor.getModel();
        if (model) {
          const lineCount = model.getLineCount();
          const lineHeight = editor.getOption(49);
          const padding = 40;
          const calculatedHeight = Math.max(
            parseInt(minHeight),
            Math.min(lineCount * lineHeight + padding, parseInt(maxHeight))
          );
          setEditorHeight(`${calculatedHeight}px`);
        }
      }
    };

    const handleCopy = async () => {
      if (processLoading) return;
      try {
        // Utiliser la valeur actuelle de l'éditeur selon le mode
        const textToCopy = progressiveMode ? displayedText : codeValueRef.current;
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      } catch (err) { }
    };

    const handleDownload = () => {
      if (processLoading) return;
      const textToDownload = progressiveMode ? displayedText : codeValueRef.current;
      const blob = new Blob([textToDownload], { type: "text/html" });
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

    const finalHeight = autoHeight ? editorHeight : height;

    // Correction de la logique readOnly
    const isReadOnly = progressiveMode ?
      (isWriting && !isComplete) : // En mode progressif: readonly seulement pendant l'écriture
      !isEditable; // En mode normal: suit isEditable

    return (
      <div
        className={cn(
          "rounded-md flex flex-col border overflow-hidden",
          CodeSectionVariants({ variant }),
          className
        )}
        ref={ref}
        style={{
          height: finalHeight,
          minHeight: minHeight,
          maxHeight: maxHeight,
        }}
      >
        <div className="flex w-full justify-between p-2 items-center shrink-0 h-12">
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
              <History size={20} className="dark:text-neutral-200 cursor-pointer text-neutral-700" />
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
                <Check size={16} className="dark:text-neutral-200 cursor-pointer text-neutral-700 transition-colors" />
              ) : (
                <Copy size={16} className="dark:text-neutral-200 cursor-pointer text-neutral-700" />
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
              <Download size={16} className="dark:text-neutral-200 text-neutral-700" />
            </button>
          </div>
        </div>

        <div
          className="w-full overflow-hidden"
          style={{
            height: `calc(${finalHeight} - 48px)`,
          }}
        >
          <Editor
            key={`editor-${progressiveMode}-${defaultValue.length}`} // Force remount when mode or content changes
            defaultLanguage={defaultLanguage}
            value={editorValue}
            theme="vs-dark"
            height="100%"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              scrollbar: {
                vertical: "auto",
                horizontal: "auto",
                useShadows: false,
              },
              automaticLayout: true,
              overviewRulerLanes: 0,
              readOnly: isReadOnly,
              lineNumbersMinChars: 3,
              renderWhitespace: 'none',
              folding: false,
              glyphMargin: false,
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
