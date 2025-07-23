// import React from 'react';
// import GeneratedAnswer from './generatedAnswer';
// import CodeSection from '../CODING/CodeSection';
// import GeneratedImageCard from './generatedImageCard';
// import AudioInteraction from './audioInteraction';

// export interface RenderContentItem {
//   type: string;
//   content: any;
//   metadata?: any;
// }

// /**
//  * Rend tous les éléments du tableau de façon séquentielle (dans l'ordre du tableau).
//  * Chaque élément est rendu selon son type.
//  * @param items Tableau d'objets RenderContentItem
//  * @returns Un tableau de composants React, dans l'ordre du tableau
//  */
// const renderContentSequentially = (items: RenderContentItem[]) => {
//   return items.map((item, index) => {
//     const { type, content, metadata } = item;
//     const key = `content-${index}`;

//     switch (type?.toLowerCase()) {
//       case 'text':
//         return (
//           <GeneratedAnswer
//             key={key}
//             content={content}
//           />
//         );

//       case 'code':
//         return (
//           <CodeSection
//             key={key}
//             className='h-96'
//             progressiveMode={true}
//             height='400px'
//             defaultValue={content}
//             language={'javascript'}
//           />
//         );

//       case 'image':
//         return (
//           <GeneratedImageCard
//             key={key}
//             src={content}
//             alt={metadata?.alt || 'Generated image'}
//           />
//         );

//       case 'audio':
//         return (
//           <AudioInteraction
//             key={key}
//             audioUrl={content}
//             {...(metadata || {})}
//           />
//         );

//       default:
//         return (
//           <div key={key} className="p-4 border border-red-300 bg-red-50 rounded-md">
//             <p className="text-red-600">Type de contenu non supporté: <strong>{type}</strong></p>
//             <p className="text-sm text-gray-600 mt-2">Contenu: {typeof content === 'string' ? content : JSON.stringify(content)}</p>
//           </div>
//         );
//     }
//   });
// };

// export { renderContentSequentially };



import React, { useState, useEffect } from 'react';
import GeneratedAnswer from './generatedAnswer';
import CodeSection from '../CODING/CodeSection';
import GeneratedImageCard from './generatedImageCard';
import AudioInteraction from './audioInteraction';

export interface RenderContentItem {
  type: string;
  content: any;
  metadata?: any;
}

/**
 * Composant qui rend les éléments de façon progressive
 */
const ProgressiveContentRenderer: React.FC<{
  items: RenderContentItem[];
  delay?: number; // Délai entre chaque élément en ms
  className?: string;
}> = ({ items, delay = 800, className = "" }) => {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount < items.length) {
      const timer = setTimeout(() => {
        setVisibleCount(prev => prev + 1);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [visibleCount, items.length, delay]);

  // Reset quand les items changent
  useEffect(() => {
    setVisibleCount(0);
  }, [items]);

  const renderItem = (item: RenderContentItem, index: number) => {
    const { type, content, metadata } = item;
    const key = `content-${index}`;

    switch (type?.toLowerCase()) {
      case 'text':
        return (
          <div key={key} className="animate-fadeIn">
            <GeneratedAnswer content={content} />
          </div>
        );

      case 'code':
        return (
          <div key={key} className="animate-fadeIn">
            <CodeSection
              className='h-96'
              progressiveMode={true}
              height='400px'
              defaultValue={content}
              language={metadata || 'javascript'}
            />
          </div>
        );

      case 'image':
        return (
          <div key={key} className="animate-fadeIn">
            <GeneratedImageCard
              src={content}
              alt={metadata?.alt || 'Generated image'}
            />
          </div>
        );

      case 'audio':
        return (
          <div key={key} className="animate-fadeIn">
            <AudioInteraction
              audioUrl={content}
              {...(metadata || {})}
            />
          </div>
        );

      default:
        return (
          <div key={key} className="p-4 border border-red-300 bg-red-50 rounded-md animate-fadeIn">
            <p className="text-red-600">Type de contenu non supporté: <strong>{type}</strong></p>
            <p className="text-sm text-gray-600 mt-2">
              Contenu: {typeof content === 'string' ? content : JSON.stringify(content)}
            </p>
          </div>
        );
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {items.slice(0, visibleCount).map((item, index) => renderItem(item, index))}

      {/* Indicateur de chargement pour le prochain élément */}
      {visibleCount < items.length && (
        <div className="flex items-center gap-2 py-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-gray-100"></div>
          <span className="text-sm text-gray-500">Chargement du contenu suivant...</span>
        </div>
      )}
    </div>
  );
};

/**
 * Version simplifiée qui retourne directement le composant progressif
 * @param items Tableau d'objets RenderContentItem
 * @param delay Délai entre chaque élément (défaut: 800ms)
 * @returns Composant React avec rendu progressif
 */
const renderContentSequentially = (items: RenderContentItem[], delay: number = 800) => {
  return <ProgressiveContentRenderer items={items} delay={delay} />;
};

// Version alternative avec plus de contrôle
const ProgressiveContentList: React.FC<{
  items: RenderContentItem[];
  delay?: number;
  onComplete?: () => void;
  showLoadingIndicator?: boolean;
  className?: string;
}> = ({
  items,
  delay = 800,
  onComplete,
  showLoadingIndicator = true,
  className = ""
}) => {
    const [visibleCount, setVisibleCount] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
      if (visibleCount < items.length) {
        const timer = setTimeout(() => {
          setVisibleCount(prev => {
            const newCount = prev + 1;
            if (newCount >= items.length) {
              setIsComplete(true);
              onComplete?.();
            }
            return newCount;
          });
        }, delay);

        return () => clearTimeout(timer);
      }
    }, [visibleCount, items.length, delay, onComplete]);

    useEffect(() => {
      setVisibleCount(0);
      setIsComplete(false);
    }, [items]);

    const renderItem = (item: RenderContentItem, index: number) => {
      const { type, content, metadata } = item;
      const key = `content-${index}`;

      // Animation d'entrée avec délai échelonné
      const animationClass = "opacity-0 animate-fadeInUp";
      const style = {
        animationDelay: `${index * 100}ms`,
        animationFillMode: 'forwards'
      };

      switch (type?.toLowerCase()) {
        case 'text':
          return (
            <div key={key} className={animationClass} style={style}>
              <GeneratedAnswer content={content} />
            </div>
          );

        case 'code':
          return (
            <div key={key} className={animationClass} style={style}>
              <CodeSection
                className='h-96'
                progressiveMode={true}
                height='400px'
                defaultValue={content}
                language={metadata || 'javascript'}
              />
            </div>
          );

        case 'image':
          return (
            <div key={key} className={animationClass} style={style}>
              <GeneratedImageCard
                src={content}
                alt={metadata?.alt || 'Generated image'}
              />
            </div>
          );

        case 'audio':
          return (
            <div key={key} className={animationClass} style={style}>
              <AudioInteraction
                audioUrl={content}
                {...(metadata || {})}
              />
            </div>
          );

        default:
          return (
            <div key={key} className={`p-4 border border-red-300 bg-red-50 rounded-md ${animationClass}`} style={style}>
              <p className="text-red-600">Type de contenu non supporté: <strong>{type}</strong></p>
              <p className="text-sm text-gray-600 mt-2">
                Contenu: {typeof content === 'string' ? content : JSON.stringify(content)}
              </p>
            </div>
          );
      }
    };

    return (
      <div className={`space-y-4 ${className}`}>
        {items.slice(0, visibleCount).map((item, index) => renderItem(item, index))}

        {/* Indicateur de chargement */}
        {showLoadingIndicator && visibleCount < items.length && (
          <div className="flex items-center gap-2 py-2 opacity-70">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
            <span className="text-xs text-gray-500">
              Affichage en cours... ({visibleCount}/{items.length})
            </span>
          </div>
        )}

        {/* Message de fin */}
        {isComplete && showLoadingIndicator && (
          <div className="text-xs text-green-600 py-1">
            ✓ Contenu entièrement chargé
          </div>
        )}
      </div>
    );
  };

export { renderContentSequentially, ProgressiveContentRenderer, ProgressiveContentList };
