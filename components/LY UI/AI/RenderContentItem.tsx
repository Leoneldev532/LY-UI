import React from 'react';
import GeneratedAnswer from './generatedAnswer';
import CodeSection from '../CODING/CodeSection';
import GeneratedImageCard from './generatedImageCard';
import AudioInteraction from './audioInteraction';

export interface RenderContentItem {
  type: string;
  content: any;
  metadata?: any;
}

type RenderContentComponentProps = [item: RenderContentItem, index: number];

const renderContentComponent = ([item, index]: RenderContentComponentProps) => {
  const { type, content, metadata } = item;

  const key = `content-${index}`;

  console.log(content, "item",type)



  switch (type?.toLowerCase()) {
    case 'text':
      return (
        <GeneratedAnswer 
          key={key} 
          content={content}  // Directement le texte/markdown
        />
      );
      
    case 'code':
      return (
        <CodeSection 
          key={key} 
           progressiveMode={true}
          className='h-96'
          defaultValue={content}  // Directement le code
          language={'javascript'}  // Le langage depuis metadata
        />
      );
      
    case 'image':
      return (
        <GeneratedImageCard 
          key={key} 
          src={content}  // Directement l'URL ou base64
          alt={metadata?.alt || 'Generated image'}
        />
      );
      
    case 'audio':
      return (
        <AudioInteraction 
          key={key} 
          audioUrl={content}  // Directement l'URL audio
          {...(metadata || {})} 
        />
      );
      
    default:
      return (
        <div key={key} className="p-4 border border-red-300 bg-red-50 rounded-md">
          <p className="text-red-600">Type de contenu non supporté: <strong>{type}</strong></p>
          <p className="text-sm text-gray-600 mt-2">Contenu: {typeof content === 'string' ? content : JSON.stringify(content)}</p>
        </div>
      );
  }
};

export { renderContentComponent };