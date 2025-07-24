import React, { useState, useEffect, useCallback } from 'react';
import GeneratedAnswer from './generatedAnswer';
import CodeSection from '../CODING/CodeSection';
import GeneratedImageCard from './generatedImageCard';
import AudioInteraction from './audioInteraction';
import AnswerControlsBar from './AnswerControlsBar';

export interface RenderContentItem {
  type: string;
  content: any;
  metadata?: any;
}

interface ItemWrapperProps {
  item: RenderContentItem;
  index: number;
  onComplete: (index: number) => void;
  isVisible: boolean;
}

/**
 * Wrapper qui gère la completion de chaque élément individuellement
 */
const ItemWrapper: React.FC<ItemWrapperProps> = ({
  item,
  index,
  onComplete,
  isVisible
}) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Fonction appelée quand l'élément est prêt
  const handleItemComplete = useCallback(() => {
    if (!isCompleted) {
      setIsCompleted(true);
      // Délai court pour s'assurer que l'animation est visible
      setTimeout(() => {
        onComplete(index);
      }, 100);
    }
  }, [isCompleted, onComplete, index]);

  // Déclencher l'animation quand l'élément devient visible
  useEffect(() => {
    if (isVisible && !isAnimating) {
      setIsAnimating(true);

      // Auto-complétion pour les éléments simples après un délai
      const timer = setTimeout(() => {
        if (!isCompleted) {
          handleItemComplete();
        }
      }, 1000); // Délai augmenté pour voir l'animation

      return () => clearTimeout(timer);
    }
  }, [isVisible, isAnimating, isCompleted, handleItemComplete]);

  // Ne rien afficher si pas visible
  if (!isVisible) return null;

  const renderItem = () => {
    const { type, content, metadata } = item;
    const key = `content-${index}`;

    // Classes d'animation avec Tailwind
    const baseClasses = "transition-all duration-700 ease-out transform";
    const animationClasses = isAnimating
      ? "opacity-100 translate-y-0"
      : "opacity-0 translate-y-4";

    const wrapperClasses = `${baseClasses} ${animationClasses}`;

    switch (type?.toLowerCase()) {
      case 'text':
        return (
          <div key={key} className={wrapperClasses}>
            <GeneratedAnswer
              content={content}
              hideControls={true}
              onComplete={handleItemComplete}
            />
          </div>
        );

      case 'code':
        return (
          <div key={key} className={wrapperClasses}>
            <CodeSection
              className='h-96'
              progressiveMode={true}
              height='400px'
              onComplete={handleItemComplete}
              defaultValue={content}
              defaultLanguage={metadata || 'javascript'}
            />
          </div>
        );

      case 'image':
        return (
          <div key={key} className={wrapperClasses}>
            <GeneratedImageCard
              src={content}
              onComplete={handleItemComplete}
              imageTitle={metadata?.imageTitle}
              width={metadata?.width}
              height={metadata?.height}
              className={metadata?.className}
              timestamp={metadata?.timestamp}
              prompt={metadata?.prompt}

              onLike={metadata?.onLike}
              onDislike={metadata?.onDislike}
              onRegenerate={metadata?.onRegenerate}
            />
          </div>
        );

      case 'audio':
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
        return (
          <div key={key} className={`p-4 border border-red-300 bg-red-50 rounded-md ${wrapperClasses}`}>
            <p className="text-red-600">Type de contenu non supporté: <strong>{type}</strong></p>
            <p className="text-sm text-gray-600 mt-2">
              Contenu: {typeof content === 'string' ? content : JSON.stringify(content)}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="relative mb-4">
      {renderItem()}
      {/* Indicateur de completion (optionnel, pour debug) */}
      {isCompleted && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full opacity-75 flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
      )}
    </div>
  );
};

/**
 * Composant principal avec gestion séquentielle améliorée
 */
const SequentialContentRenderer: React.FC<{
  items: RenderContentItem[];
  onAllComplete?: () => void;
  showProgress?: boolean;
  className?: string;
  delay?: number; // Délai entre chaque élément
}> = ({
  items,
  onAllComplete,
  showProgress = true,
  className = "",
  delay = 500
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [completedItems, setCompletedItems] = useState<Set<number>>(new Set());
    const [isAllComplete, setIsAllComplete] = useState(false);

    // Reset quand les items changent
    useEffect(() => {
      setCurrentIndex(0);
      setCompletedItems(new Set());
      setIsAllComplete(false);
    }, [items]);

    // Démarrer automatiquement le premier élément
    useEffect(() => {
      if (items.length > 0 && currentIndex === 0) {
        // Petit délai initial pour la fluidité
        const timer = setTimeout(() => {
          setCurrentIndex(0);
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [items.length]);

    // Gestion de la completion d'un élément
    const handleItemComplete = useCallback((index: number) => {
      setCompletedItems(prev => {
        const newCompleted = new Set(prev);
        newCompleted.add(index);

        // Si l'élément complété est l'élément courant, on passe au suivant
        if (index === currentIndex) {
          setTimeout(() => {
            setCurrentIndex(prevIndex => {
              const nextIndex = prevIndex + 1;
              if (nextIndex >= items.length) {
                setIsAllComplete(true);
                onAllComplete?.();
                return prevIndex; // Ne pas dépasser la longueur
              }
              return nextIndex;
            });
          }, delay);
        }

        return newCompleted;
      });
    }, [currentIndex, items.length, onAllComplete, delay]);

    return (
      <div className={`space-y-4 ${className}`}>
        {items.map((item, index) => (
          <ItemWrapper
            key={`item-${index}-${item.type}`}
            item={item}
            index={index}
            onComplete={handleItemComplete}
            isVisible={index <= currentIndex}
          />
        ))}

        {/* Indicateur de progression */}
        {showProgress && !isAllComplete && items.length > 0 && (
          <div className="sticky bottom-4 mx-auto max-w-md">
            <div className="flex items-center gap-3 py-3 px-4 bg-white/90 backdrop-blur-sm rounded-lg border shadow-lg">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-700">
                  Chargement en cours...
                </span>
                <div className="text-xs text-gray-500 mt-1">
                  Élément {Math.min(currentIndex + 1, items.length)} sur {items.length}
                </div>
              </div>
              {/* Barre de progression */}
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-500 ease-out"
                  style={{
                    width: `${(completedItems.size / items.length) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Message de completion */}
        {isAllComplete && showProgress && (

          <div className="space-y-2 mt-4">

            <AnswerControlsBar
              key={`1`}
              timestamp={'00:00'}
              copied={false}
              onCopy={() => { }}
              onLike={() => { }}
              onDislike={() => { }}
              onRegenerate={() => { }}
            />

          </div>
        )}
      </div>
    );
  };

/**
 * Version avec timeout de sécurité et retry
 */
const SafeSequentialRenderer: React.FC<{
  items: RenderContentItem[];
  onAllComplete?: () => void;
  showProgress?: boolean;
  maxWaitTime?: number;
  className?: string;
  retryCount?: number;
}> = ({
  items,
  onAllComplete,
  showProgress = true,
  maxWaitTime = 8000,
  className = "",
  retryCount = 1
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [completedItems, setCompletedItems] = useState<Set<number>>(new Set());
    const [isAllComplete, setIsAllComplete] = useState(false);
    const [timeoutWarnings, setTimeoutWarnings] = useState<Set<number>>(new Set());
    const [retryAttempts, setRetryAttempts] = useState<Map<number, number>>(new Map());

    // Ajout demandé : message à la fin de chaque réponse
    // (à utiliser dans le rendu après chaque réponse)
    const endMessage = (
      <div className="w-full flex justify-end mt-2">
        <span className="text-xs text-green-600 font-semibold">
          Réponse terminée ✓
        </span>
      </div>
    );

    useEffect(() => {
      setCurrentIndex(0);
      setCompletedItems(new Set());
      setIsAllComplete(false);
      setTimeoutWarnings(new Set());
      setRetryAttempts(new Map());
    }, [items]);

    // Démarrage automatique
    useEffect(() => {
      if (items.length > 0) {
        const timer = setTimeout(() => setCurrentIndex(0), 200);
        return () => clearTimeout(timer);
      }
    }, [items.length]);

    // Timeout de sécurité pour chaque élément
    useEffect(() => {
      if (currentIndex < items.length && !completedItems.has(currentIndex)) {
        const timeoutId = setTimeout(() => {
          const attempts = retryAttempts.get(currentIndex) || 0;

          if (attempts < retryCount) {
            // Retry
            setRetryAttempts(prev => new Map(prev).set(currentIndex, attempts + 1));
            console.log(`Retry attempt ${attempts + 1} for item ${currentIndex}`);
          } else {
            // Force completion après tous les retries
            setTimeoutWarnings(prev => new Set(prev).add(currentIndex));
            handleItemComplete(currentIndex, true);
          }
        }, maxWaitTime);

        return () => clearTimeout(timeoutId);
      }
    }, [currentIndex, completedItems, maxWaitTime, retryAttempts, retryCount]);

    const handleItemComplete = useCallback((index: number, isTimeout = false) => {
      setCompletedItems(prev => {
        const newCompleted = new Set(prev);
        newCompleted.add(index);

        if (index === currentIndex) {
          setTimeout(() => {
            setCurrentIndex(prevIndex => {
              const nextIndex = prevIndex + 1;
              if (nextIndex >= items.length) {
                setIsAllComplete(true);
                onAllComplete?.();
                return prevIndex;
              }
              return nextIndex;
            });
          }, isTimeout ? 100 : 400);
        }

        return newCompleted;
      });
    }, [currentIndex, items.length, onAllComplete]);

    return (
      <div className={`space-y-4 ${className}`}>
        {items.map((item, index) => (
          <div key={`safe-item-${index}-${item.type}`} className="relative">
            <ItemWrapper
              item={item}
              index={index}
              onComplete={(idx) => handleItemComplete(idx, false)}
              isVisible={index <= currentIndex}
            />

            {/* Indicateurs d'état */}
            <div className="absolute top-2 right-2 flex gap-1">
              {retryAttempts.has(index) && retryAttempts.get(index)! > 0 && (
                <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                  Retry {retryAttempts.get(index)}
                </div>
              )}
              {timeoutWarnings.has(index) && (
                <div className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                  Timeout
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Indicateur de progression avancé */}
        {showProgress && !isAllComplete && items.length > 0 && (
          <div className="sticky bottom-4 mx-auto max-w-lg">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl border shadow-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      Traitement séquentiel
                    </span>
                    {timeoutWarnings.size > 0 && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                        {timeoutWarnings.size} timeout(s)
                      </span>
                    )}
                    {retryAttempts.size > 0 && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                        {Array.from(retryAttempts.values()).reduce((a, b) => a + b, 0)} retry(s)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.min(currentIndex + 1, items.length)} / {items.length} éléments
                  </div>
                </div>
              </div>

              {/* Barre de progression détaillée */}
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700 ease-out"
                  style={{
                    width: `${(completedItems.size / items.length) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Completion message */}

        {isAllComplete && showProgress && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 flex items-center justify-center bg-green-500 rounded-full">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <span className="text-sm font-medium text-green-700">
                  Traitement séquentiel terminé avec succès !
                </span>
                {(timeoutWarnings.size > 0 || retryAttempts.size > 0) && (
                  <div className="text-xs text-gray-500 mt-1">
                    {timeoutWarnings.size > 0 && `${timeoutWarnings.size} timeout(s)`}
                    {timeoutWarnings.size > 0 && retryAttempts.size > 0 && ' • '}
                    {retryAttempts.size > 0 && `${Array.from(retryAttempts.values()).reduce((a, b) => a + b, 0)} retry(s)`}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

/**
 * Fonction utilitaire principale améliorée
 */
const renderContentSequentially = (
  items: RenderContentItem[],
  options: {
    onComplete?: () => void;
    showProgress?: boolean;
    maxWaitTime?: number;
    useSafeMode?: boolean;
    delay?: number;
    retryCount?: number;
  } = {}
) => {
  const {
    onComplete,
    showProgress = true,
    maxWaitTime = 8000,
    useSafeMode = true,
    delay = 500,
    retryCount = 1
  } = options;

  // Validation des items
  if (!items || items.length === 0) {
    return <div className="text-gray-500 text-sm">Aucun contenu à afficher</div>;
  }

  if (useSafeMode) {
    return (
      <SafeSequentialRenderer
        items={items}
        onAllComplete={onComplete}
        showProgress={showProgress}
        maxWaitTime={maxWaitTime}
        retryCount={retryCount}
      />
    );
  }

  return (
    <SequentialContentRenderer
      items={items}
      onAllComplete={onComplete}
      showProgress={showProgress}
      delay={delay}
    />
  );
};

export {
  renderContentSequentially,
  SequentialContentRenderer,
  SafeSequentialRenderer,
  ItemWrapper
};