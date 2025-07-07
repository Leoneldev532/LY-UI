export interface NavItem {
    id: string | number;
    title: string;
    href: string;
    description?: string;
    count?: number | string;
    isComingSoon?: boolean;
    isNew?: boolean;
    isLab?: boolean;
}

export interface NavSection {
    title: string;
    items: NavItem[];
}

export const navigationSections: NavSection[] = [
    {
        title: "Getting Started",
        items: [
            {
                id: "intro",
                title: "Installation",
                href: "/docs",
                description: "Introduction and usage guidelines",
            },
        ],
    },
    {
        title: "Components",
        items: [
            {
                id: 1,
                title: "AI Searchbar",
                href: "/docs/components/ai-searchbar",
            },
            {
                id: 2,
                title: "Animated Process List V0",
                href: "/docs/components/stepProgressTimeline",
            },
            {
                id: 3,
                title: "Animated Process List",
                href: "/docs/components/animatedProcessList",
            },
            {
                id: 4,
                title: "Audio Interaction",
                href: "/docs/components/audioInteraction",
            },
            {
                id: 5,
                title: "Editable Question",
                href: "/docs/components/editableQuestion",
            },
            {
                id: 6,
                title: "Generated Answer",
                href: "/docs/components/generatedAnswer",
            },
            {
                id: 7,
                title: "Generated Image Card",
                href: "/docs/components/generatedImageCard",
            },
            {
                id: 8,
                title: "Resizable Separator",
                href: "/docs/components/resizableSeparator",
            },
            {
                id: 9,
                title: "Thinking Search Animation",
                href: "/docs/components/thinkingSearchAnimation",
            },
        ],
    },
    {
        title: "Hooks",
        items: [
            {
                id: 1,
                title: "Custom Hooks",
                href: "/docs/hooks",
            },
        ],
    },
  
];
