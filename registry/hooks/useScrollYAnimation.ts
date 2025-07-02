import { useEffect, useRef } from "react";

const useScrollYAnimation = (
  content: string[],
  scrollDirection: "up" | "down" = "up",
  animationSpeed: "slow" | "normal" | "fast" = "normal",
  callBackAnimationEnd?: () => void
) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleAnimationEnd = () => {
    callBackAnimationEnd && callBackAnimationEnd();
    if (contentRef.current) {
      const items = contentRef.current.querySelectorAll('li');
      items.forEach((item, index) => {
        if (index < items.length - 1) {
          item.classList.add('hidden');
        }
      });
    }
  };

  // Vitesse de défilement en pixels par seconde
  const speedConfig = {
    slow: 50, // Plus lent
    normal: 100, // Vitesse normale
    fast: 200, // Plus rapide
  };

useEffect(() => {
  const contentElement = contentRef.current;
  if (contentElement) {
    const containerHeight = 288;
    const contentHeight = contentElement.scrollHeight;
    const scrollDistance = contentHeight - containerHeight;

    if (scrollDistance > 0) {
      const speed = speedConfig[animationSpeed];
      const duration = scrollDistance / speed;

      if (scrollDirection === "up") {
        contentElement.style.animation = `scrollUp ${duration}s linear forwards`;
      } else {
        contentElement.style.animation = `scrollDown ${duration}s linear forwards`;
      }

      // Add animationend event listener
      contentElement.addEventListener('animationend', handleAnimationEnd);

      // Cleanup event listener on unmount
      return () => {
        contentElement.removeEventListener('animationend', handleAnimationEnd);
      };
    }
  }
}, [content, scrollDirection, animationSpeed]);

  return { contentRef, handleAnimationEnd };
};

export default useScrollYAnimation;
