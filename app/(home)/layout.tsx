import type { ReactNode } from 'react';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/app/layout.config';
import { Metadata } from 'next';
import Header from '../components/Header';
import PatternSVG from '../components/patternSvg';
import PatternLayout from '../components/patternLayout';

export const metadata: Metadata = {
  title: {
      template: "%s | LY  UI - Open Source Components",
      default: "LY  UI - Open Source Components",
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  // return <HomeLayout {...baseOptions}>{children}</HomeLayout>;
  return  <div className='flex flex-col min-h-screen  items-center justify-start w-full '>   
   <PatternLayout>
   <Header/> 
   {children} 
   </PatternLayout>
   </div>;
}
