import { useMemo } from "react";
import GeneratedAnswer from "../../AI/generatedAnswer";
import CodeSection from "../../CODING/CodeSection";
import { RenderContentItem } from "../utils";
import GeneratedImageCard from "../../AI/generatedImageCard";
import AudioInteraction from "../../AI/audioInteraction";

export const useItemRenderer = (
  item: RenderContentItem,
  index: number,
  isVisible: boolean,
  isAnimating: boolean,
  handleItemComplete: () => void
) => {
  const itemContent = useMemo(() => {
    if (!isVisible) return null;

    const { type, content, metadata } = item;
    const key = `content-${index}`;
    const baseClasses = "transition-all duration-300 ease-out transform";
    const animationClasses = isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2";
    const wrapperClasses = `${baseClasses} ${animationClasses}`;

    switch (type?.toLowerCase()) {
      case "text":
      case "markdown":
        return (
          <div key={key} className={wrapperClasses}>
            <GeneratedAnswer
              content={content}
              hideControls={true}
              onComplete={handleItemComplete}
            />
          </div>
        );
      case "code":
        return (
          <div key={key} className={wrapperClasses}>
            <CodeSection
              autoHeight={true}
              progressiveMode={true}
              onComplete={handleItemComplete}
              defaultValue={content}
              defaultLanguage={metadata?.language || metadata || "javascript"}
            />
          </div>
        );
      case "image":
        return (
          <div key={key} className={wrapperClasses}>
            <GeneratedImageCard
              src={content}
              hideControls={true}
              onComplete={handleItemComplete}
              imageTitle={metadata?.imageTitle}
              width={400}
              height={400}
              className={"w-96"}
              timestamp={metadata?.timestamp}
              prompt={metadata?.prompt}
            />
          </div>
        );
      case "audio":
        return (
          <div key={key} className={wrapperClasses}>
            <AudioInteraction
              audioUrl={content}
              onComplete={handleItemComplete}
              {...(metadata || {})}
            />
          </div>
        );
      default:
        setTimeout(() => handleItemComplete(), 100);
        return (
          <div key={key} className={`p-4 border border-red-300 bg-red-50 rounded-md ${wrapperClasses}`}>
            <p className="text-red-600">
              Type de contenu non supporté: <strong>{type}</strong>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Contenu: {typeof content === "string" ? content : JSON.stringify(content)}
            </p>
          </div>
        );
    }
  }, [isVisible, item, index, isAnimating, handleItemComplete]);

  return { itemContent };
};