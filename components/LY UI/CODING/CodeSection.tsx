"use client";

import Editor from "@monaco-editor/react";
import React, { forwardRef, useRef, useState, useEffect } from "react";
import { cn, globalVariants } from "@/lib/utils";
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
  autoHeight?: boolean; // Nouvelle prop pour activer la hauteur adaptative
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
      autoHeight = false, // Par défaut false pour garder le comportement existant
    },
    ref
  ) => {
    const { displayedText, isWriting, isComplete } = useProgressiveText(defaultValue, processLoading, 10);

    const [copied, setCopied] = useState(false);
    const [currentValue, setCurrentValue] = useState(defaultValue);
    const [editorHeight, setEditorHeight] = useState(height);
    const codeValueRef = useRef<string>(defaultValue);
    const editorRef = useRef<any>(null);

    useEffect(() => {
      setCurrentValue(defaultValue);
      codeValueRef.current = defaultValue;
    }, [defaultValue]);

    // Calcul de la hauteur adaptative
    useEffect(() => {
      if (autoHeight && editorRef.current) {
        const editor = editorRef.current;
        const model = editor.getModel();
        if (model) {
          const lineCount = model.getLineCount();
          const lineHeight = 19; // Hauteur approximative d'une ligne avec fontSize: 14
          const padding = 20; // Padding supplémentaire
          
          // Calcul de la hauteur basée sur le nombre de lignes
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
    }, [currentValue, displayedText, autoHeight, minHeight, maxHeight]);

    // Appel du onComplete quand l'écriture progressive est terminée
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
      
      // Si autoHeight est activé, recalculer la hauteur au montage
      if (autoHeight) {
        const model = editor.getModel();
        if (model) {
          const lineCount = model.getLineCount();
          const lineHeight = 19;
          const padding = 20;
          
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
    };

    const handleCopy = async () => {
      if (processLoading) return;
      try {
        await navigator.clipboard.writeText(codeValueRef.current);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      } catch (err) { }
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

    const finalHeight = autoHeight ? editorHeight : height;

    return (
      <div
        className={cn(
          "rounded-md flex flex-col gap-y-2 border",
          CodeSectionVariants({ variant }),
          className
        )}
        ref={ref}
        style={{ 
          minHeight: autoHeight ? minHeight : finalHeight, 
          maxHeight: autoHeight ? maxHeight : finalHeight, 
          overflow: autoHeight ? "visible" : "hidden" 
        }}
      >
        <div className="flex w-full justify-between p-2 items-center">
          <div
            className="flex justify-center items-center gap-2 px-2 py-1 rounded-lg
              text-black dark:text-neutral-200"
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

        <div className="flex-1 overflow-hidden">
          <Editor
            defaultLanguage={defaultLanguage}
            value={progressiveMode ? displayedText : currentValue}
            theme="vs-dark"
            height={finalHeight}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: "off",
              scrollbar: {
                vertical: "auto", // Toujours afficher la scrollbar verticale quand nécessaire
                horizontal: "auto",
                useShadows: false,
                alwaysConsumeMouseWheel: false,
                verticalScrollbarSize: 10, // Taille de la scrollbar
                horizontalScrollbarSize: 10,
              },
              automaticLayout: true, // Important pour le redimensionnement automatique
              overviewRulerLanes: 0, // Supprime la règle de survol pour plus d'espace
            }}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            className="w-full"
          />
        </div>
      </div>
    );
  }
);

CodeSection.displayName = "CodeSection";

export default CodeSection;