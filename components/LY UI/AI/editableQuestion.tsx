"use client";

import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { CheckIcon, Pencil, Copy, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type EditableQuestionProps = {
  className?: string;
  title?: string;
  onUpdateTitle?: (newTitle: string) => void;
};

const EditableQuestion: React.FC<EditableQuestionProps> = ({
  className,
  title: initialTitle,
  onUpdateTitle,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle || "");
  const [editingTitle, setEditingTitle] = useState("");

  const handleCopy = async () => {
    if (title) {
      try {
        await navigator.clipboard.writeText(title);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
      }
    }
  };

  const handleEdit = () => {
    setEditingTitle(title);
    setIsEditing(true);
  };

  const handleUpdate = () => {
    setIsEditing(false);
    setTitle(editingTitle);
    if (onUpdateTitle) onUpdateTitle(editingTitle);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingTitle("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleUpdate();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div className="flex group flex-col justify-end items-end mb-4 gap-y-2">
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
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
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
          <span>{title}</span>
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
          disabled={!title}
        >
          {copied ? <CheckIcon size={16} /> : <Copy size={16} />}
        </Button>
      </div>
    </div>
  );
};

EditableQuestion.displayName = "EditableQuestion";

export default EditableQuestion;
