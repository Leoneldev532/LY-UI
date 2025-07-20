"use client";

import { cn } from "@/lib/utils";
import React, { useState, forwardRef } from "react";
import { CheckIcon, Pencil, Copy, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type EditableQuestionProps = {
  className?: string;
  question?: string;
  onQuestionChange?: (newQuestion: string) => void;
};

const EditableQuestion = forwardRef<HTMLDivElement, EditableQuestionProps>(({
  className,
  question: initialQuestion,
  onQuestionChange,
  ...props
}, ref) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [question, setQuestion] = useState(initialQuestion || "");
  const [editingQuestion, setEditingQuestion] = useState("");

  const handleCopy = async () => {
    if (question) {
      try {
        await navigator.clipboard.writeText(question);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
      }
    }
  };

  const handleEdit = () => {
    setEditingQuestion(question);
    setIsEditing(true);
  };

  const handleUpdate = () => {
    setIsEditing(false);
    setQuestion(editingQuestion);
    if (onQuestionChange) onQuestionChange(editingQuestion);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingQuestion("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleUpdate();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div ref={ref} className="flex group flex-col justify-end items-end mb-4 gap-y-2" {...props}>
      <div
        className={cn(
          "p-3 bg-neutral-200/40 max-w-lg overflow-hidden whitespace-pre-wrap break-words rounded-xl dark:border-neutral-200/20 border border-neutral-300/50 dark:bg-neutral-900 dark:text-gray-200 text-neutral-700",
          className
        )}
      >
        {isEditing ? (
          <div className="flex gap-2 items-center">
            <Textarea
              className="flex-1 bg-transparent border-b border-neutral-400 outline-none px-1 resize-none"
              value={editingQuestion}
              onChange={(e) => setEditingQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              rows={2}
              placeholder="Saisissez votre question..."
            />
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full w-8 h-8 p-0"
                onClick={handleUpdate}
                title="Sauvegarder (Ctrl+Entrée)"
              >
                <CheckIcon size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full w-8 h-8 p-0"
                onClick={handleCancel}
                title="Annuler (Échap)"
              >
                <X size={16} />
              </Button>
            </div>
          </div>
        ) : (
          <span>{question}</span>
        )}
      </div>
      <div className="opacity-0 group-hover:opacity-100 w-full flex gap-4 justify-end items-center transition-opacity duration-200">
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            title="Modifier la question"
            className="bg-transparent dark:bg-transparent hover:bg-neutral-200/40 dark:hover:bg-neutral-500 rounded-full w-8 h-8 p-0"
            onClick={handleEdit}
          >
            <Pencil size={16} />
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="bg-transparent dark:bg-transparent hover:bg-neutral-200/40 dark:hover:bg-neutral-500 rounded-full w-8 h-8 p-0"
          onClick={handleCopy}
          title="Copier la question"
          disabled={!question}
        >
          {copied ? <CheckIcon size={16} /> : <Copy size={16} />}
        </Button>
      </div>
    </div>
  );
});

EditableQuestion.displayName = "EditableQuestion";

export default EditableQuestion;
