import React from 'react';
import GeneratedAnswer from './generatedAnswer';
import CodeSection from '../CODING/CodeSection';
import GeneratedImageCard from './generatedImageCard';
import AudioInteraction from './audioInteraction';
import { Copy, ThumbsUp, ThumbsDown } from 'lucide-react';

interface GeneralMixProps {
  type: string;
  content: any;
  metadata?: any;
  onLike?: () => void;
  onDislike?: () => void;
  onCopy?: () => void;
  // ...autres callbacks si besoin
}

const GeneralMix: React.FC<GeneralMixProps> = ({
  type,
  content,
  metadata,
  onLike,
  onDislike,
  onCopy,
}) => {
  let contentNode = null;

  switch (type?.toLowerCase()) {
    case 'text':
      contentNode = <GeneratedAnswer content={content} {...metadata} />;
      break;
    case 'code':
      contentNode = (
        <CodeSection
          defaultValue={content}
          progressiveMode={true}
          className="h-96"
          defaultLanguage={metadata?.language || 'javascript'}
        />
      );
      break;
    case 'image':
      contentNode = (
        <GeneratedImageCard
          src={content}
          // alt={metadata?.alt || 'Generated image'} // alt is not a valid prop
        />
      );
      break;
    case 'audio':
      contentNode = (
        <AudioInteraction
          audioUrl={content}
          {...(metadata || {})}
        />
      );
      break;
    default:
      contentNode = (
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <p className="text-red-600">Type de contenu non supporté: <strong>{type}</strong></p>
          <p className="text-sm text-gray-600 mt-2">Contenu: {typeof content === 'string' ? content : JSON.stringify(content)}</p>
        </div>
      );
  }

  // Barre de contrôle unique
  return (
    <div className="relative w-full">
      {contentNode}
      <div className="flex gap-2 mt-2 justify-end">
        {onCopy && (
          <button onClick={onCopy} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 flex items-center gap-1"><Copy size={16}/>Copy</button>
        )}
        {onLike && (
          <button onClick={onLike} className="px-2 py-1 bg-green-200 rounded hover:bg-green-300 flex items-center gap-1"><ThumbsUp size={16}/>Like</button>
        )}
        {onDislike && (
          <button onClick={onDislike} className="px-2 py-1 bg-red-200 rounded hover:bg-red-300 flex items-center gap-1"><ThumbsDown size={16}/>Dislike</button>
        )}
      </div>
    </div>
  );
};

export default GeneralMix; 