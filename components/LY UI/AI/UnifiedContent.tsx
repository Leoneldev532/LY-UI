import React, { useEffect, useState, useCallback } from 'react';
import CodeSection from '../CODING/CodeSection';
import GeneratedImageCard from './generatedImageCard';
import AudioInteraction from './audioInteraction';
import GeneratedAnswer from './generatedAnswer';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Check, Copy, ThumbsUp, ThumbsDown, RotateCcw, MoreHorizontal } from 'lucide-react';

interface UnifiedContentItem {
  type: string;
  content: any;
  metadata?: any;
}

interface UnifiedContentProps {
  items: UnifiedContentItem[];
  onLike?: (idx: number) => void;
  onDislike?: (idx: number) => void;
  onCopy?: (idx: number) => void;
}

const UnifiedContent: React.FC<UnifiedContentProps> = React.memo(({
  items,
  onLike,
  onDislike,
  onCopy,
}) => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [revealAll, setRevealAll] = useState(false);

  // Reset currentIdx si items changent
  useEffect(() => {
    setCurrentIdx(0);
    setRevealAll(false);
  }, [items]);

  // Si revealAll, tout afficher
  useEffect(() => {
    if (revealAll) {
      setCurrentIdx(items.length);
    }
  }, [revealAll, items.length]);

  const handleCopy = useCallback((idx: number) => {
    const item = items[idx];
    let toCopy = '';
    if (item.type === 'text' || item.type === 'code') {
      toCopy = typeof item.content === 'string' ? item.content : JSON.stringify(item.content);
    }
    if (toCopy) navigator.clipboard.writeText(toCopy);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1200);
    if (onCopy) onCopy(idx);
  }, [items, onCopy]);

  // Révéler tout d'un coup
  const handleRevealAll = useCallback(() => {
    setRevealAll(true);
  }, []);

  // Callback pour avancer à l'item suivant
  const handleItemComplete = useCallback((idx: number) => {
    if (!revealAll && idx === currentIdx && currentIdx < items.length - 1) {
      setTimeout(() => setCurrentIdx(i => i + 1), 200); // délai optionnel
    }
  }, [currentIdx, items.length, revealAll]);

  return (
    <div className="w-full p-6 mb-4  relative flex flex-col gap-4">
      {items.slice(0, currentIdx + 1).map((item, idx) => {
        let contentNode = null;
        let metadata = item.metadata;
        if (item.type === 'code' && typeof metadata === 'string') {
          metadata = { language: metadata.toLowerCase() };
        }
        const isLastVisible = idx === currentIdx && !revealAll;
        switch (item.type?.toLowerCase()) {
          case 'text':
            contentNode = (
              <div className="whitespace-pre-line prose prose-invert dark:prose-invert text-base">
                <GeneratedAnswer content={item.content} {...metadata} hideControls={true} onComplete={isLastVisible ? () => handleItemComplete(idx) : undefined} />
              </div>
            );
            break;
          case 'code':
            contentNode = (
              <div className="mt-2">
                <CodeSection
                  defaultValue={item.content}
                  progressiveMode={true}
                  className="h-96"
                  defaultLanguage={metadata?.language || 'javascript'}
                  isEditable={false}
                  hideControls={true}
                  onComplete={isLastVisible ? () => handleItemComplete(idx) : undefined}
                />
              </div>
            );
            break;
          case 'html':
            contentNode = (
              <div className="mt-2">
                <CodeSection
                  defaultValue={item.content}
                  progressiveMode={true}
                  className="h-96"
                  defaultLanguage={'html'}
                  isEditable={false}
                  hideControls={true}
                  onComplete={isLastVisible ? () => handleItemComplete(idx) : undefined}
                />
              </div>
            );
            break;
          case 'image':
            contentNode = (
              <div className="flex justify-center items-center mt-2">
                <GeneratedImageCard src={item.content} />
              </div>
            );
            // Les images sont instantanées, avancer tout de suite
            if (isLastVisible && currentIdx === idx && !revealAll && currentIdx < items.length - 1) {
              setTimeout(() => setCurrentIdx(i => i + 1), 200);
            }
            break;
          case 'audio':
            contentNode = (
              <div className="flex justify-center items-center mt-2">
                <AudioInteraction audioUrl={item.content} {...(item.metadata || {})} />
              </div>
            );
            // Audio aussi instantané
            if (isLastVisible && currentIdx === idx && !revealAll && currentIdx < items.length - 1) {
              setTimeout(() => setCurrentIdx(i => i + 1), 200);
            }
            break;
          default:
            contentNode = (
              <div className="p-4 border border-red-300 bg-red-50 rounded-md">
                <p className="text-red-600">Type de contenu non supporté: <strong>{item.type}</strong></p>
                <p className="text-sm text-gray-600 mt-2">Contenu: {typeof item.content === 'string' ? item.content : JSON.stringify(item.content)}</p>
              </div>
            );
            // Avancer tout de suite
            if (isLastVisible && currentIdx === idx && !revealAll && currentIdx < items.length - 1) {
              setTimeout(() => setCurrentIdx(i => i + 1), 200);
            }
        }
        return (
          <div key={idx} className="w-full min-h-[48px] flex flex-col justify-center items-start mb-4">
            {contentNode}
          </div>
        );
      })}
      {currentIdx < items.length - 1 && !revealAll && (
        <button
          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 self-end"
          onClick={handleRevealAll}
        >
          Révéler tout
        </button>
      )}
    </div>
  );
});

export default UnifiedContent; 