# Guide de Contribution - Ajout d'un Nouveau Composant

Ce guide explique comment ajouter un nouveau composant à la bibliothèque LY-UI.

## 1. Structure des Fichiers

Les composants personnalisés sont organisés par catégorie dans le répertoire `components/LY UI/`.

```text
components/
  LY UI/
    [CATEGORIE]/
      votre-composant.tsx
      sous-composant.tsx (optionnel)
```

## 2. Standards de Code

- **React 19 & Next.js**: Utilisez `"use client"` si le composant est interactif.
- **forwardRef**: Tous les composants doivent utiliser `forwardRef` pour permettre l'accès au nœud DOM.
- **Tailwind CSS 4**: Utilisez Tailwind pour le style.
- **cn Utility**: Utilisez `@/lib/utils` `cn` pour fusionner les classes CSS.
- **JSDoc**: Ajoutez des commentaires JSDoc pour documenter l'auteur, la description et les props.

### Exemple de Template

```tsx
"use client";
import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * @author: @votre-nom
 * @description: Description de votre composant
 * @version: 1.0.0
 */
interface MonComposantProps extends React.HTMLAttributes<HTMLDivElement> {
  customProp?: string;
}

const MonComposant = forwardRef<HTMLDivElement, MonComposantProps>(({
  className,
  customProp,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn("votre-style-base", className)}
      {...props}
    >
      {customProp}
    </div>
  );
});

MonComposant.displayName = "MonComposant";
export default MonComposant;
```

## 3. Enregistrement dans le Registry

Pour que le composant soit disponible via le registry Shadcn, vous devez l'ajouter à `registry.json` à la racine.

```json
{
  "name": "votreComposant",
  "type": "registry:component",
  "title": "Titre du Composant",
  "dependencies": ["lucide-react", "framer-motion"],
  "registryDependencies": ["button"],
  "files": [
    {
      "path": "components/LY UI/[CATEGORIE]/votre-composant.tsx",
      "type": "registry:component"
    }
  ]
}
```

## 4. Documentation (Fumadocs)

Créez un fichier MDX dans `content/docs/components/[CATEGORIE]/votre-composant.mdx`.

```mdx
---
title: "Titre du Composant"
description: "Description courte"
---

import VotreComposant from '@/components/LY UI/[CATEGORIE]/votre-composant'

<Preview link="votreComposant">
  <VotreComposant />
</Preview>

## Documentation

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `customProp` | `string` | `undefined` | Description de la prop |
```

## 5. Build du Registry

Après avoir ajouté le composant, vous pouvez mettre à jour le registry :

```bash
npm run registry:build
```
