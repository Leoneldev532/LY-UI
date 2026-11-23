<div align="center">

# LY UI

**Open-source React & Next.js UI component library specialized for AI interfaces, conversational chatbots, AI agents, and developer tools.**

Built with **React 19**, **Next.js 15**, **Tailwind CSS 4**, **shadcn/ui**, **Radix UI**, and **Motion (Framer Motion)** — installable directly via the **shadcn registry CLI**.

[![Website](https://img.shields.io/badge/Website-ly--ui.leonelyimga.com-000000?style=flat-square&logo=vercel)](https://ly-ui.leonelyimga.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)

[Documentation](https://ly-ui.leonelyimga.com/docs) · [Tutorial](https://ly-ui.leonelyimga.com/docs/tutorial) · [Components](https://ly-ui.leonelyimga.com/docs/components/AI/ai-searchbar) · [Contributing](./CONTRIBUTING.md) · [Report Bug](https://github.com/Leoneldev532/LY-UI/issues)

</div>

---

## Overview

**LY UI** is a modern, copy-paste and registry-driven UI component library designed to help developers build polished **AI-powered web applications** faster. Instead of wiring complex streaming markdown, agent reasoning timelines, audio visualizers, or interactive code blocks from scratch, LY UI gives you accessible, animated, and fully customizable components you own in your codebase.

## Key Features

- **AI-First Components** — Purpose-built for LLM chatbots, AI search bars, agent step timelines, thinking animations, streaming markdown answers, and voice interactions.
- **shadcn/ui Registry Compatible** — Install any component and its dependencies with a single CLI command, or copy-paste directly into your project.
- **Smooth Animations** — Powered by **Motion (Framer Motion)** and **GSAP** for fluid micro-interactions and progressive rendering.
- **Modern Stack** — Built for **React 19**, **Next.js 15 App Router**, **Tailwind CSS 4**, and **Radix UI** primitives.
- **TypeScript & Customizable** — Strongly typed with `forwardRef`, `class-variance-authority` (`cva`), and Tailwind `cn()` utilities.
- **Interactive Docs** — Powered by **Fumadocs** with live previews, code inspection, and full-text search.

---

## Component Catalog

### AI & Conversational Components

| Component | Registry Name | Description |
| :--- | :--- | :--- |
| **AI Search Bar** | `aiSearchbar` | Smart multi-action prompt input with popovers, options, and dropdown controls. |
| **AI Agent Animation** | `aiAgentAnimation` | Animated agent progress indicator with customizable dot grid, states, and callbacks. |
| **Generated Answer** | `generatedAnswer` | Progressive AI-generated markdown response renderer with smooth streaming animation. |
| **Thinking Search Animation** | `thinkingSearchAnimation` | Animated reasoning and intelligent search indicator for AI workflows. |
| **Step Progress Timeline** | `stepProgressTimeline` | Multi-step progress timeline inspired by v0 for tracking AI generation stages. |
| **Animated Process List** | `animatedProcessListLovable` | Animated list displaying sequential AI build/process steps (Lovable-inspired). |
| **Animated Code List** | `animatedCodeList` | Animated file/code generation list showing real-time edits and steps. |
| **Answer Controls Bar** | `answerControlsBar` | Action toolbar for AI responses (copy, regenerate, feedback, and contextual actions). |
| **Audio Interaction** | `audioInteraction` | Interactive voice/audio interface paired with reactive particle visuals. |
| **Particle Animation** | `particleAnimation` | Lightweight animated particle visual for voice and ambient AI states. |
| **Editable Question** | `editableQuestion` | Inline editable user prompt component for conversational chat threads. |
| **Generated Image Card** | `generatedImageCard` | Styled preview card with action menu for AI-generated images. |
| **Resizable Separator** | `resizableSeparator` | Draggable split-pane separator for side-by-side chat and preview layouts. |
| **Tag Button** | `tagButton` | Customizable animated tag button with icon, dropdown, and `forwardRef` support. |

### Coding & Developer Components

| Component | Registry Name | Description |
| :--- | :--- | :--- |
| **Code Section** | `codeSection` | Interactive code viewer powered by Monaco Editor with progressive text animation and syntax highlighting. |

---

## Quick Start

### Install a Component via shadcn CLI

Make sure your project is configured with [shadcn/ui](https://ui.shadcn.com/), then install any LY UI component directly from the registry:

```bash
npx shadcn@latest add https://ly-ui.leonelyimga.com/r/aiSearchbar.json
```

Replace `aiSearchbar` with any component registry name from the [Component Catalog](#component-catalog).

---

## Local Development

Clone the repository and run the documentation & preview app locally:

```bash
git clone https://github.com/Leoneldev532/LY-UI.git
cd LY-UI
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to explore the landing page, live previews, and documentation.

### Useful Scripts

```bash
pnpm dev             # Start Next.js development server (Turbopack)
pnpm build           # Build the production application
pnpm start           # Start the production server
pnpm registry:build  # Rebuild shadcn registry JSON files
```

---

## Project Structure

```text
LY-UI/
├── app/                   # Next.js App Router (landing page, docs, previews, API routes)
├── components/
│   ├── LY UI/             # Core LY UI components grouped by category (AI, CODING)
│   ├── hooks/             # Reusable animation & progressive rendering hooks
│   ├── ui/                # Base shadcn/ui primitives
│   └── example/           # Interactive component usage examples
├── config/                # Site metadata and navigation configuration
├── content/docs/          # Fumadocs MDX documentation pages
├── lib/                   # Shared utilities and Fumadocs content loader
├── public/r/              # Built shadcn registry JSON manifests
└── registry.json          # Master shadcn component registry definition
```

---

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) & [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) & [class-variance-authority](https://cva.style/)
- **Primitives:** [Radix UI](https://www.radix-ui.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Animations:** [Motion](https://motion.dev/) (Framer Motion) & [GSAP](https://gsap.com/)
- **Code Editor & Markdown:** [Monaco Editor](https://microsoft.github.io/monaco-editor/), `marked`, `react-markdown`
- **Documentation:** [Fumadocs](https://fumadocs.dev/)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## Contributing

Contributions are welcome! Whether you want to add a new AI component, improve animations, fix a bug, or enhance documentation, please read the [Contributing Guide](./CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/my-new-component`)
3. Commit your changes (`git commit -m "feat: add my-new-component"`)
4. Push to the branch (`git push origin feat/my-new-component`)
5. Open a Pull Request

---

## Author

Created by **Leonel Yimga**

- GitHub: [@Leoneldev532](https://github.com/Leoneldev532)
- X / Twitter: [@leoy_dev](https://x.com/leoy_dev)
- Website: [ly-ui.leonelyimga.com](https://ly-ui.leonelyimga.com)

---

## License

This project is open source and available under the [MIT License](./LICENSE).
