import { useState, useCallback } from "react";
import { RenderContentItem } from "../utils";

export const useAnswerControls = (items: RenderContentItem[], completedItems: Set<number>) => {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const getAllVisibleTextContent = useCallback(() => {
    return items
      .filter((item, idx) => completedItems.has(idx))
      .map((item) => {
        if (item.type?.toLowerCase() === "code") {
          return typeof item.content === "string" ? item.content : "";
        } else if (item.type?.toLowerCase() === "text" || item.type?.toLowerCase() === "markdown") {
          return typeof item.content === "string" ? item.content : "";
        }
        return "";
      })
      .filter(Boolean)
      .join("\n\n");
  }, [items, completedItems]);

  const handleCopy = useCallback(() => {
    const plainText = getAllVisibleTextContent();
    if (plainText) {
      navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  }, [getAllVisibleTextContent]);

  const handleLike = useCallback(() => {
    setLiked(true);
    setDisliked(false);
  }, []);

  const handleDislike = useCallback(() => {
    setDisliked(true);
    setLiked(false);
  }, []);

  const handleRegenerate = useCallback(() => {
    setLiked(false);
    setDisliked(false);
    setCopied(false);
  }, []);

  const resetControls = useCallback(() => {
    setCopied(false);
    setLiked(false);
    setDisliked(false);
  }, []);

  return {
    copied,
    liked,
    disliked,
    handleCopy,
    handleLike,
    handleDislike,
    handleRegenerate,
    resetControls,
  };
};
