"use client";

import React, { useEffect, useRef, useState } from "react";
export const useResponsiveContainer = (dotSize: number) => {
    const [containerWidth, setContainerWidth] = useState(0);
    const containerRef = useRef<HTMLDivElement | null>(null);
  
    useEffect(() => {
      const updateWidth = () => {
        if (containerRef.current) {
          setContainerWidth(containerRef.current.offsetWidth);
        }
      };
      updateWidth();
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }, []);
  
    const computedColumns = Math.max(6, Math.floor((containerWidth * 0.95) / dotSize));
    
    return { containerRef, containerWidth, computedColumns };
  };