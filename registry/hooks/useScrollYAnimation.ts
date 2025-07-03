import { useEffect, useRef } from "react";

const useScrollYAnimation = (
  content: string[],
  scrollDirection: "up" | "down" = "up",
  animationSpeed: "slow" | "normal" | "fast" = "normal",
  callBackAnimationEnd?: () => void
) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false); // Track if animation has run

  const handleAnimationEnd = () => {
    if (contentRef.current) {
      // Clear animation and reset transform to show all content
      contentRef.current.style.animation = "none";
      contentRef.current.style.transform = "translateY(0)";
    }
    callBackAnimationEnd?.();
    hasAnimated.current = true; // Mark animation as complete
  };

  // Scroll speed in pixels per second
  const speedConfig = {
    slow: 50, // Slower
    normal: 100, // Normal speed
    fast: 200, // Faster
  };

  useEffect(() => {
    const contentElement = contentRef.current;
    if (contentElement && content.length > 0 && !hasAnimated.current) {
      const containerHeight = contentElement.parentElement?.offsetHeight || 200; // Use parent container height
      const contentHeight = contentElement.scrollHeight;
      const scrollDistance = Math.max(0, contentHeight - containerHeight);

      if (scrollDistance > 0) {
        const speed = speedConfig[animationSpeed];
        const duration = scrollDistance / speed;

        // Apply animation based on scroll direction
        if (scrollDirection === "up") {
          contentElement.style.animation = `scrollUp ${duration}s linear forwards`;
        } else {
          contentElement.style.animation = `scrollDown ${duration}s linear forwards`;
        }

        // Add animationend event listener
        contentElement.addEventListener("animationend", handleAnimationEnd);

        // Cleanup event listener on unmount
        return () => {
          contentElement.removeEventListener("animationend", handleAnimationEnd);
        };
      } else {
        // If content fits, reset styles and call callback
        contentElement.style.animation = "none";
        contentElement.style.transform = "translateY(0)";
        callBackAnimationEnd?.();
        hasAnimated.current = true;
      }
    }
  }, [content, scrollDirection, animationSpeed, callBackAnimationEnd]);

  return { contentRef, handleAnimationEnd };
};

export default useScrollYAnimation;