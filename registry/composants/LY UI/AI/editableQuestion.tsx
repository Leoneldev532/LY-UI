import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { Button } from "../../../ui/button";
import { Textarea } from "../../../ui/textarea";
import { CheckIcon, Pencil, Copy } from "lucide-react";

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

  const handleCopy = async () => {
    if (title) {
      await navigator.clipboard.writeText(title);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleUpdate = () => {
    setIsEditing(false);
    if (onUpdateTitle) onUpdateTitle(title);
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
          <div className="flex gap-2 items-center ">
            <Textarea
              className="flex-1 bg-transparent border-b border-neutral-400 outline-none px-1 resize-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              rows={2}
            />
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                className="rounded-full"
                onClick={handleUpdate}
                title="Save"
              >
                <CheckIcon />
              </Button>
              <Button
                variant="ghost"
                className="rounded-full"
                onClick={() => {
                  setIsEditing(false);
                }}
                title="Annuler"
              >
                ✕
              </Button>
            </div>
          </div>
        ) : (
          <span>{title}</span>
        )}
      </div>
      <div className="opacity-0 group-hover:opacity-100 w-full flex gap-4 justify-end items-center">
        {!isEditing && (
          <Button
            variant="ghost"
            title="Edit question"
            className="bg-transparent dark:bg-transparent hover:bg-neutral-200/40 dark:hover:bg-neutral-500 rounded-full"
            onClick={handleEdit}
          >
            <Pencil />
          </Button>
        )}

        <Button
          variant="ghost"
          className="bg-transparent dark:bg-transparent hover:bg-neutral-200/40 dark:hover:bg-neutral-500 rounded-full"
          onClick={handleCopy}
          title="Copy question"
        >
          {copied ? <CheckIcon /> : <Copy />}
        </Button>
      </div>
    </div>
  );
};
EditableQuestion.displayName = 'EditableQuestion';

export default EditableQuestion;
