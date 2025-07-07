import type { ReactNode } from 'react';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/app/layout.config';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
      template: "%s | LY  UI - Open Source Components",
      default: "LY  UI - Open Source Components",
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <HomeLayout {...baseOptions}>{children}</HomeLayout>;
}
