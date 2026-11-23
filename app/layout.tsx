import { siteConfig } from '@/config/site';
import './global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import { Crimson_Pro, Inter,  Lora } from 'next/font/google';
import type { ReactNode } from 'react';
import { Metadata } from 'next';
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const instrument = Crimson_Pro({
  weight: "400",
  subsets: ["latin"],
  variable: '--font-instrument-serif',
});


export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — Open-Source AI & Modern React UI Components`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
  keywords: [
      "LY UI",
      "AI UI components",
      "chatbot UI",
      "AI agent UI",
      "React component library",
      "Next.js UI",
      "Tailwind CSS 4",
      "shadcn",
      "shadcn registry",
      "Radix UI",
      "Framer Motion",
      "Fumadocs",
  ],
  robots: "index, follow",
  authors: [{ name: "Leonel Yimga", url: "https://github.com/Leoneldev532" }],
  creator: "Leonel Yimga",
  openGraph: {
      type: "website",
      title: `${siteConfig.name} — Open-Source AI & Modern React UI Components`,
      description: siteConfig.description,
      url: siteConfig.url,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          alt: siteConfig.name,
        },
      ],
  },
  twitter: {
      card: "summary_large_image",
      creator: "@leoy_dev",
      title: `${siteConfig.name} — Open-Source AI & Modern React UI Components`,
      description: siteConfig.description,
      images: [siteConfig.ogImage],
  },
};


export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${instrument.variable} ${inter.className}`} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="flex flex-col min-h-screen">
        <Toaster/>
        <RootProvider  >{children}</RootProvider>
        <Analytics />
      </body>
    </html>
  );
}
