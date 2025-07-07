import { siteConfig } from '@/config/site';
import './global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
});


export const metadata: Metadata = {
  title: `${siteConfig.name} - ${siteConfig.description}`,
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  keywords: [
      "ui",
      "components",
      "Tailwind CSS",
      "Next.js",
      "shadcn",
      "Framer Motion",
      "React Library",
  ],
  robots: "index, follow",
  authors: [{ name: "Leonel Yimga", url: "https://x.com/adrien_dorval" }],
  creator: "Leonel Yimga",
  openGraph: {
      title: siteConfig.name,
      description: siteConfig.description,
      url: siteConfig.url,
      siteName: siteConfig.name,
  },
  twitter: {
      card: "summary_large_image",
      creator: "@dorian_baffier",
      title: siteConfig.name,
      description: siteConfig.description,
  },
};


export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
