"use client"
 import React, { ReactNode } from 'react'
import PatternSVG from './patternSvg'
 
 const PatternLayout = ({children}:{children:ReactNode}) => {
   return (
    <div className='flex flex-col justify-center min-h-screen  
      border-x border-x-(--pattern-fg) px-4 md:px-16  w-full
       bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] 
       bg-[size:10px_10px] bg-fixed [--pattern-fg:var(--color-black)]/5 md:block dark:[--pattern-fg:var(--color-white)]/10 items-center gap-y-2'>
    <div className='flex flex-col bg-black justify-center items-center  min-h-screen w-full' >
        {children}
    </div>
    </div>
   )
 }

 export default PatternLayout