import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { baseOptions } from '@/app/layout.config';
import { source } from '@/lib/source';
import { MonitorPlayIcon } from 'lucide-react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout   sidebar={{
      defaultOpenLevel: 2, 
    }}  tree={source.pageTree} {...baseOptions}>
      {children}
    </DocsLayout>
  );
}
