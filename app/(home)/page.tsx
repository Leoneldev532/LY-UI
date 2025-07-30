"use client";
import Link from "next/link";
import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import TagButton from "@/components/LY UI/AI/tagButton";
import Editor, { DiffEditor, useMonaco, loader } from "@monaco-editor/react";
import CodeSection from "@/components/LY UI/CODING/CodeSection";
import PatternSVG from "../components/patternSvg";
import { ArrowRight, Phone } from "lucide-react";
import NewsLetter from "../components/newsletter";
import ChatbotIA from "@/components/LY UI/CHATBOT AI/ChatbotIA";

export default function HomePage() {
  // Animation state for long lines
  const [linesExpanded, setLinesExpanded] = useState(false);
  const longLineRefs = useRef<(SVGPolygonElement | null)[]>([]);
  const animationValues = useRef<number[]>([]);

  // Initialiser les valeurs d'animation
  useEffect(() => {
    animationValues.current = new Array(12).fill(0);
  }, []);

  // Fonction pour recalculer les points du polygone
  const calculatePolygonPoints = (i: number, animValue: number) => {
    const angle = ((i * 360) / 96) * (Math.PI / 180);
    const center = 200;

    const r1Collapsed = 130;
    const r2Collapsed = 170;
    const r1Expanded = 60;
    const r2Expanded = 170;
    const baseWidth = 4;
    const tipLength = 80;

    const r1 = r1Collapsed + (r1Expanded - r1Collapsed) * animValue;
    const r2 = r2Collapsed + (r2Expanded - r2Collapsed) * animValue;

    const x1 = center + r1 * Math.cos(angle);
    const y1 = center + r1 * Math.sin(angle);
    const x2 = center + r2 * Math.cos(angle);
    const y2 = center + r2 * Math.sin(angle);
    const tipInX = center + (r1 - tipLength) * Math.cos(angle);
    const tipInY = center + (r1 - tipLength) * Math.sin(angle);
    const tipOutX = center + (r2 + tipLength) * Math.cos(angle);
    const tipOutY = center + (r2 + tipLength) * Math.sin(angle);

    const perpAngle = angle + Math.PI / 2;
    const bx1 = x1 + (baseWidth / 2) * Math.cos(perpAngle);
    const by1 = y1 + (baseWidth / 2) * Math.sin(perpAngle);
    const bx2 = x1 - (baseWidth / 2) * Math.cos(perpAngle);
    const by2 = y1 - (baseWidth / 2) * Math.sin(perpAngle);
    const ex1 = x2 + (baseWidth / 2) * Math.cos(perpAngle);
    const ey1 = y2 + (baseWidth / 2) * Math.sin(perpAngle);
    const ex2 = x2 - (baseWidth / 2) * Math.cos(perpAngle);
    const ey2 = y2 - (baseWidth / 2) * Math.sin(perpAngle);

    return `${tipInX},${tipInY} ${bx1},${by1} ${ex1},${ey1} ${tipOutX},${tipOutY} ${ex2},${ey2} ${bx2},${by2}`;
  };

  // Animate with GSAP - correction pour synchronisation
  useEffect(() => {
    let direction: "expand" | "collapse" = "expand";
    let interval: NodeJS.Timeout | null = null;
    let timeout: NodeJS.Timeout | null = null;

    function animateLines(toExpand: boolean) {
      if (longLineRefs.current.length > 0) {
        const tl = gsap.timeline();

        tl.to(longLineRefs.current, {
          duration: 2.5,
          stagger: 0.05,
          ease: "power2.inOut",
          onUpdate: function () {
            const targets = longLineRefs.current;
            targets.forEach((target: SVGPolygonElement | null, index: number) => {
              if (target) {
                const timeline = this as unknown as gsap.core.Timeline;
                const progress =
                  typeof timeline.progress === "function"
                    ? timeline.progress()
                    : 0;
                const totalDuration =
                  typeof timeline.duration === "function"
                    ? timeline.duration()
                    : 1;
                const staggerDelay = index * 0.05;
                const currentTime = progress * totalDuration;
                const elementStartTime = staggerDelay * totalDuration;

                let elementProgress = Math.max(
                  0,
                  Math.min(
                    1,
                    (currentTime - elementStartTime) /
                      (totalDuration - elementStartTime)
                  )
                );

                if (elementProgress > 0) {
                  elementProgress = toExpand
                    ? elementProgress
                    : 1 - elementProgress;
                }

                const originalIndex = index * 8;
                const points = calculatePolygonPoints(
                  originalIndex,
                  elementProgress
                );
                target.setAttribute("points", points);

                animationValues.current[index] = elementProgress;
              }
            });
          },
          onStart: () => setLinesExpanded(toExpand),
        });
      }
    }

    animateLines(false);

    timeout = setTimeout(() => {
      animateLines(true);
      direction = "collapse";

      interval = setInterval(() => {
        animateLines(direction === "expand");
        direction = direction === "expand" ? "collapse" : "expand";
      }, 8000);
    }, 2000);

    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, []);



  return (
    <main className="flex flex-col h-full relative justify-center text-center w-full bg-white 
    dark:bg-black transition-colors duration-300">
      <div className="flex flex-col h-full gap-4 w-full justify-center items-center">
        <div className="relative flex items-center justify-center">
          <svg
            className="relative h-56 md:h-auto left-0 top-0"
            width={300}
            height={300}
            viewBox="0 0 400 400"
            style={{ pointerEvents: "none" }}
          >
            {Array.from({ length: 96 }).map((_, i) => {
              const angle = ((i * 360) / 96) * (Math.PI / 180);
              const center = 200;
              const isLong = i % 8 === 0;

              if (isLong) {
                const longLineIndex = i / 8;
                const initialPoints = calculatePolygonPoints(i, 0);

                return (
                  <polygon
                    key={i}
                    ref={(el) => {
                      longLineRefs.current[longLineIndex] = el;
                    }}
                    points={initialPoints}
                    // dark:fill-white (dark mode), fill-neutral-400 (light mode)
                    className="fill-neutral-400 dark:fill-white transition-colors duration-300"
                  />
                );
              } else {
                const r1 = 130;
                const r2 = 170;
                const x1 = center + r1 * Math.cos(angle);
                const y1 = center + r1 * Math.sin(angle);
                const x2 = center + r2 * Math.cos(angle);
                const y2 = center + r2 * Math.sin(angle);
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    // dark:stroke-white (dark mode), stroke-neutral-400 (light mode)
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    className="stroke-neutral-400 dark:stroke-white transition-colors duration-300"
                  />
                );
              }
            })}
          </svg>
        </div>

        <div className="flex flex-col gap-y-3 w-full border-y border-neutral-200 dark:border-neutral-700 justify-center items-center mt-4 transition-colors duration-300">
          <h2 className="text-3xl sm:text-3xl max-w-xl md:text-5xl m-0 p-0 font-medium text-customDarkTwo dark:text-white text-center text-balance transition-colors duration-300">
            Discover{" "}
            <span className="text-neutral-400 dark:text-neutral-400">Free</span> UI{" "}
            <span className="text-neutral-400 dark:text-neutral-400">Components</span> For Your Next{" "}
            <span className="text-neutral-400 dark:text-neutral-400">AI Project</span>
          </h2>
        </div>

       
<Link
  href="/docs"
  className="relative mt-8 border rounded-2xl p-1 group ease duration-300 border-neutral-300 dark:border-white/20"
>
  <span className="pointer-events-none absolute w-1 h-1 bg-black dark:bg-white rounded-full -top-1 -left-1 transition-colors duration-300"></span>
  <span className="pointer-events-none absolute w-1 h-1 bg-black dark:bg-white rounded-full -top-1 -right-1 transition-colors duration-300"></span>
  <span className="pointer-events-none absolute w-1 h-1 bg-black dark:bg-white rounded-full -bottom-1 -left-1 transition-colors duration-300"></span>
  <span className="pointer-events-none absolute w-1 h-1 bg-black dark:bg-white rounded-full -bottom-1 -right-1 transition-colors duration-300"></span>

  <button className="flex gap-x-3 w-full justify-center items-center px-4 py-2 
                   bg-customGrayTwo dark:bg-customDarkTwo 
                   border border-neutral-300 cursor-pointer dark:border-white/30 
                   text-customDarkTwo dark:text-white 
                   rounded-xl transition-colors duration-300
                   group-hover:bg-neutral-100/40 group-hover:dark:bg-neutral-100/40">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 103 109"
    >
      <path
        className="stroke-black dark:stroke-white transition-colors duration-300"
        strokeWidth="3"
        d="m67.105 70.846-63.613 34.55c5.574-11.17 9.785-20.364 13.985-29.54 4.678-10.217 9.346-20.411 15.89-33.322L99.504 3.785zm-10.47-13.99c0 4.146-3.516 7.61-7.979 7.61s-7.978-3.464-7.978-7.61 3.515-7.61 7.978-7.61 7.979 3.463 7.979 7.61Zm3 0c0-5.915-4.972-10.61-10.979-10.61s-10.978 4.695-10.978 10.61 4.972 10.61 10.978 10.61c6.007 0 10.979-4.695 10.979-10.61Z"
      ></path>
    </svg>
    <span>Explore components</span>
  </button>
</Link>

        <div className="flex gap-3"></div>

<div className="flex gap-x-3 py-4 justify-center items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            width="1em"
            height="1em"
            className="w-8 h-8 text-black dark:text-white"
            aria-label="Shadcn/ui"
          >
            <title>Shadcn UI</title>
            <path fill="none" d="M0 0h256v256H0z"></path>
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="25"
              strokeLinecap="round"
              d="M208 128l-80 80M192 40L40 192"
            ></path>
          </svg>

          <svg
            viewBox="0 0 256 228"
            width="1em"
            height="1em"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid"
            className="w-8 h-8"
            aria-label="React"
          >
            <path
              d="M210.483 73.824a171.49 171.49 0 0 0-8.24-2.597c.465-1.9.893-3.777 1.273-5.621 6.238-30.281 2.16-54.676-11.769-62.708-13.355-7.7-35.196.329-57.254 19.526a171.23 171.23 0 0 0-6.375 5.848 155.866 155.866 0 0 0-4.241-3.917C100.759 3.829 77.587-4.822 63.673 3.233 50.33 10.957 46.379 33.89 51.995 62.588a170.974 170.974 0 0 0 1.892 8.48c-3.28.932-6.445 1.924-9.474 2.98C17.309 83.498 0 98.307 0 113.668c0 15.865 18.582 31.778 46.812 41.427a145.52 145.52 0 0 0 6.921 2.165 167.467 167.467 0 0 0-2.01 9.138c-5.354 28.2-1.173 50.591 12.134 58.266 13.744 7.926 36.812-.22 59.273-19.855a145.567 145.567 0 0 0 5.342-4.923 168.064 168.064 0 0 0 6.92 6.314c21.758 18.722 43.246 26.282 56.54 18.586 13.731-7.949 18.194-32.003 12.4-61.268a145.016 145.016 0 0 0-1.535-6.842c1.62-.48 3.21-.974 4.76-1.488 29.348-9.723 48.443-25.443 48.443-41.52 0-15.417-17.868-30.326-45.517-39.844Zm-6.365 70.984c-1.4.463-2.836.91-4.3 1.345-3.24-10.257-7.612-21.163-12.963-32.432 5.106-11 9.31-21.767 12.459-31.957 2.619.758 5.16 1.557 7.61 2.4 23.69 8.156 38.14 20.213 38.14 29.504 0 9.896-15.606 22.743-40.946 31.14Zm-10.514 20.834c2.562 12.94 2.927 24.64 1.23 33.787-1.524 8.219-4.59 13.698-8.382 15.893-8.067 4.67-25.32-1.4-43.927-17.412a156.726 156.726 0 0 1-6.437-5.87c7.214-7.889 14.423-17.06 21.459-27.246 12.376-1.098 24.068-2.894 34.671-5.345.522 2.107.986 4.173 1.386 6.193ZM87.276 214.515c-7.882 2.783-14.16 2.863-17.955.675-8.075-4.657-11.432-22.636-6.853-46.752a156.923 156.923 0 0 1 1.869-8.499c10.486 2.32 22.093 3.988 34.498 4.994 7.084 9.967 14.501 19.128 21.976 27.15a134.668 134.668 0 0 1-4.877 4.492c-9.933 8.682-19.886 14.842-28.658 17.94ZM50.35 144.747c-12.483-4.267-22.792-9.812-29.858-15.863-6.35-5.437-9.555-10.836-9.555-15.216 0-9.322 13.897-21.212 37.076-29.293 2.813-.98 5.757-1.905 8.812-2.773 3.204 10.42 7.406 21.315 12.477 32.332-5.137 11.18-9.399 22.249-12.634 32.792a134.718 134.718 0 0 1-6.318-1.979Zm12.378-84.26c-4.811-24.587-1.616-43.134 6.425-47.789 8.564-4.958 27.502 2.111 47.463 19.835a144.318 144.318 0 0 1 3.841 3.545c-7.438 7.987-14.787 17.08-21.808 26.988-12.04 1.116-23.565 2.908-34.161 5.309a160.342 160.342 0 0 1-1.76-7.887Zm110.427 27.268a347.8 347.8 0 0 0-7.785-12.803c8.168 1.033 15.994 2.404 23.343 4.08-2.206 7.072-4.956 14.465-8.193 22.045a381.151 381.151 0 0 0-7.365-13.322Zm-45.032-43.861c5.044 5.465 10.096 11.566 15.065 18.186a322.04 322.04 0 0 0-30.257-.006c4.974-6.559 10.069-12.652 15.192-18.18ZM82.802 87.83a323.167 323.167 0 0 0-7.227 13.238c-3.184-7.553-5.909-14.98-8.134-22.152 7.304-1.634 15.093-2.97 23.209-3.984a321.524 321.524 0 0 0-7.848 12.897Zm8.081 65.352c-8.385-.936-16.291-2.203-23.593-3.793 2.26-7.3 5.045-14.885 8.298-22.6a321.187 321.187 0 0 0 7.257 13.246c2.594 4.48 5.28 8.868 8.038 13.147Zm37.542 31.03c-5.184-5.592-10.354-11.779-15.403-18.433 4.902.192 9.899.29 14.978.29 5.218 0 10.376-.117 15.453-.343-4.985 6.774-10.018 12.97-15.028 18.486Zm52.198-57.817c3.422 7.8 6.306 15.345 8.596 22.52-7.422 1.694-15.436 3.058-23.88 4.071a382.417 382.417 0 0 0 7.859-13.026 347.403 347.403 0 0 0 7.425-13.565Zm-16.898 8.101a358.557 358.557 0 0 1-12.281 19.815 329.4 329.4 0 0 1-23.444.823c-7.967 0-15.716-.248-23.178-.732a310.202 310.202 0 0 1-12.513-19.846h.001a307.41 307.41 0 0 1-10.923-20.627 310.278 310.278 0 0 1 10.89-20.637l-.001.001a307.318 307.318 0 0 1 12.413-19.761c7.613-.576 15.42-.876 23.31-.876H128c7.926 0 15.743.303 23.354.883a329.357 329.357 0 0 1 12.335 19.695 358.489 358.489 0 0 1 11.036 20.54 329.472 329.472 0 0 1-11 20.722Zm22.56-122.124c8.572 4.944 11.906 24.881 6.52 51.026-.344 1.668-.73 3.367-1.15 5.09-10.622-2.452-22.155-4.275-34.23-5.408-7.034-10.017-14.323-19.124-21.64-27.008a160.789 160.789 0 0 1 5.888-5.4c18.9-16.447 36.564-22.941 44.612-18.3ZM128 90.808c12.625 0 22.86 10.235 22.86 22.86s-10.235 22.86-22.86 22.86-22.86-10.235-22.86-22.86 10.235-22.86 22.86-22.86Z"
              fill="#00D8FF"
            ></path>
          </svg>

          <svg
            width="1em"
            height="1em"
            viewBox="0 0 180 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8"
            aria-label="Next.js"
          >
            <mask
              id="mask0_408_139"
              style={{ maskType: "alpha" }}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="180"
              height="180"
            >
              <circle cx="90" cy="90" r="90" fill="black"></circle>
            </mask>
            <g mask="url(#mask0_408_139)">
              <circle
                cx="90"
                cy="90"
                r="87"
                fill="black"
                stroke="white"
                strokeWidth="6"
              ></circle>
              <path
                d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z"
                fill="url(#paint0_linear_408_139)"
              ></path>
              <rect
                x="115"
                y="54"
                width="12"
                height="72"
                fill="url(#paint1_linear_408_139)"
              ></rect>
            </g>
            <defs>
              <linearGradient
                id="paint0_linear_408_139"
                x1="109"
                y1="116.5"
                x2="144.5"
                y2="160.5"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="white"></stop>
                <stop offset="1" stopColor="white" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint1_linear_408_139"
                x1="121"
                y1="54"
                x2="120.799"
                y2="106.875"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="white"></stop>
                <stop offset="1" stopColor="white" stopOpacity="0"></stop>
              </linearGradient>
            </defs>
          </svg>

          <svg
            viewBox="0 0 54 33"
            className="w-8 h-8"
            aria-labelledby="tailwindcss-icon-title"
            role="img"
          >
            <title id="tailwindcss-icon-title">TailwindCSS</title>
            <g clipPath="url(#prefix__clip0)">
              <path
                fill="#38bdf8"
                fillRule="evenodd"
                d="M27 0c-7.2 0-11.7 3.6-13.5 10.8 2.7-3.6 5.85-4.95 9.45-4.05 2.054.513 3.522 2.004 5.147 3.653C30.744 13.09 33.808 16.2 40.5 16.2c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C36.756 3.11 33.692 0 27 0zM13.5 16.2C6.3 16.2 1.8 19.8 0 27c2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C17.244 29.29 20.308 32.4 27 32.4c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C23.256 19.31 20.192 16.2 13.5 16.2z"
                clipRule="evenodd"
              ></path>
            </g>
          </svg>
        </div>

        <div className="w-full border-y border-neutral-200 dark:border-neutral-700 py-3 flex justify-center items-center mt-16 transition-colors duration-300">
          <div className="w-full flex flex-col justify-center items-center gap-y-2">
            <div className="relative flex flex-col px-4 max-w-3xl w-full justify-start items-start">
              <h2 className="text-2xl m-0 inset-0 md:text-3xl text-customDarkTwo dark:text-white transition-colors duration-300">
                Crafted for today's web.
              </h2>
              <div className="flex flex-col text-left py-4 justify-start items-start">
                <p className="w-full text-left text-neutral-600 dark:text-neutral-500 transition-colors duration-300">
                  Our library leverages cutting-edge CSS to deliver a seamless and
                  enjoyable developer experience with modern UI components.
                </p>
              </div>
            </div>
            <div className="w-full border-y group border-neutral-200 dark:border-neutral-700 flex justify-center items-center transition-colors duration-300">
              <div className="flex w-full md:flex-row flex-col max-w-3xl px-3 bg-gray-50/60 dark:bg-gray-200/10 gap-4 p-2 justify-start items-start transition-colors duration-300">
                {/* ...cartes de composants... */}
                <div
                  className="w-full md:w-1/2 flex bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-gray-400/10 p-4 rounded-xl h-full transition-colors duration-300"
                >
                  <div className="flex flex-col gap-3 justify-start items-start">
                    <div className="w-full flex gap-x-4 justify-center items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="97"
                        height="69"
                        fill="none"
                        viewBox="0 0 97 69"
                      >
                        <path
                          stroke="#222"
                          className="stroke-neutral-400 dark:stroke-white transition-colors duration-300"
                          d="M48.5.5c13.318 0 25.351 3.229 34.038 8.423C91.235 14.123 96.5 21.237 96.5 29s-5.265 14.877-13.962 20.077C73.851 54.271 61.818 57.5 48.5 57.5s-25.351-3.229-34.038-8.423C5.765 43.877.5 36.763.5 29S5.765 14.123 14.462 8.923C23.149 3.729 35.182.5 48.5.5Z"
                        ></path>
                        <path
                          stroke="#222"
                          className="stroke-neutral-400 dark:stroke-white transition-colors duration-300"
                          d="M43 12.5c11.792 0 22.444 3.113 30.133 8.12C80.827 25.63 85.5 32.493 85.5 40s-4.674 14.37-12.367 19.38C65.443 64.387 54.792 67.5 43 67.5s-22.444-3.113-30.133-8.12C5.173 54.37.5 47.507.5 40s4.673-14.37 12.367-19.38C20.557 15.613 31.21 12.5 43 12.5Z"
                        ></path>
                        <path
                          stroke="#222"
                          className="stroke-neutral-400 dark:stroke-white transition-colors duration-300"
                          d="M48.5.5c13.318 0 25.351 3.229 34.038 8.423C91.235 14.123 96.5 21.237 96.5 29s-5.265 14.877-13.962 20.077C73.851 54.271 61.818 57.5 48.5 57.5s-25.351-3.229-34.038-8.423C5.765 43.877.5 36.763.5 29S5.765 14.123 14.462 8.923C23.149 3.729 35.182.5 48.5.5Z"
                        ></path>
                        <path
                          stroke="#222"
                          className="stroke-neutral-400 dark:stroke-white transition-colors duration-300"
                          d="M43 12.5c11.792 0 22.444 3.113 30.133 8.12C80.827 25.63 85.5 32.493 85.5 40s-4.674 14.37-12.367 19.38C65.443 64.387 54.792 67.5 43 67.5s-22.444-3.113-30.133-8.12C5.173 54.37.5 47.507.5 40s4.673-14.37 12.367-19.38C20.557 15.613 31.21 12.5 43 12.5Z"
                        ></path>
                        <path
                          stroke="#222"
                          className="stroke-neutral-400 dark:stroke-white transition-colors duration-300"
                          d="m4.5 40-1.871 7.953-.129.547M8.5 44.5l-2.5 9M12.868 48l-2.943 9.5M8.453 45 6 54m11-4-3.15 10m7.65-7.5-3.236 10M26.5 54l-3.33 10.5m9.83-9L29.547 66M43.5 57.5l-1.689 5.75L40.34 68M49 57.5l-1.792 5.75L45.736 68M53 57.5l-1.377 5.75-.981 4.25M58 57.5s-.512 3.113-.981 4.75c-.484 1.69-1.472 4.25-1.472 4.25M61 65l2.5-8.5M66 63l1-3.5 1-4.5m4.5-1L71 60.5M38.5 57l-3.066 10 1.472-4.75z"
                        ></path>
                        <path
                          fill="#D9D9D9"
                          d="M12 35a1 1 0 1 1-2 0 1 1 0 0 1 2 0"
                        ></path>
                        {/* Les cercles sont neutres, pas besoin de changer */}
                        <circle cx="14" cy="28" r="1" fill="#D9D9D9"></circle>
                        <circle cx="19" cy="24" r="1" fill="#D9D9D9"></circle>
                        <circle cx="25" cy="22" r="1" fill="#D9D9D9"></circle>
                        <circle cx="33" cy="20" r="1" fill="#D9D9D9"></circle>
                        <circle cx="25" cy="22" r="1" fill="#D9D9D9"></circle>
                        <circle cx="15" cy="43" r="1" fill="#D9D9D9"></circle>
                        <circle cx="21" cy="48" r="1" fill="#D9D9D9"></circle>
                        <circle cx="25" cy="50" r="1" fill="#D9D9D9"></circle>
                        <circle cx="33" cy="51" r="1" fill="#D9D9D9"></circle>
                        <circle cx="40" cy="53" r="1" fill="#D9D9D9"></circle>
                        <circle cx="49" cy="53" r="1" fill="#D9D9D9"></circle>
                        <circle cx="56" cy="53" r="1" fill="#D9D9D9"></circle>
                        <circle cx="63" cy="52" r="1" fill="#D9D9D9"></circle>
                        <circle cx="74" cy="48" r="1" fill="#D9D9D9"></circle>
                        <circle cx="79" cy="46" r="1" fill="#D9D9D9"></circle>
                        <circle cx="81" cy="41" r="1" fill="#D9D9D9"></circle>
                        <circle cx="80" cy="36" r="1" fill="#D9D9D9"></circle>
                        <circle cx="77" cy="30" r="1" fill="#D9D9D9"></circle>
                        <circle cx="72" cy="26" r="1" fill="#D9D9D9"></circle>
                        <circle cx="68" cy="23" r="1" fill="#D9D9D9"></circle>
                        <circle cx="64" cy="21" r="1" fill="#D9D9D9"></circle>
                        <circle cx="55" cy="19" r="1" fill="#D9D9D9"></circle>
                        <circle cx="49" cy="18" r="1" fill="#D9D9D9"></circle>
                        <circle cx="40" cy="19" r="1" fill="#D9D9D9"></circle>
                        <circle cx="68" cy="50" r="1" fill="#D9D9D9"></circle>
                        <circle cx="63" cy="52" r="1" fill="#D9D9D9"></circle>
                        <circle cx="40" cy="53" r="1" fill="#D9D9D9"></circle>
                        <circle cx="40" cy="53" r="1" fill="#D9D9D9"></circle>
                        <circle
                          cx="23.5"
                          cy="29.5"
                          r="0.5"
                          fill="#D9D9D9"
                        ></circle>
                        <circle
                          cx="18.5"
                          cy="34.5"
                          r="0.5"
                          fill="#D9D9D9"
                        ></circle>
                        <circle
                          cx="21.5"
                          cy="39.5"
                          r="0.5"
                          fill="#D9D9D9"
                        ></circle>
                        <circle
                          cx="25.5"
                          cy="44.5"
                          r="0.5"
                          fill="#D9D9D9"
                        ></circle>
                      </svg>
                      <div className="flex flex-col w-full justify-start items-start gap-1">
                        <h2 className="text-xl md:text-2xl text-customDarkTwo dark:text-white transition-colors duration-300">AI Components</h2>
                        <p className="text-sm text-balance text-neutral-600 dark:text-neutral-400 text-left transition-colors duration-300">
                          Seamlessly add intelligent AI features to your UI for easy
                          content generation and interaction.
                        </p>
                      </div>
                    </div>
                    <div className="w-full flex justify-end pt-4 items-center">
                      <Link
                        className="gap-x-2 text-neutral-500 dark:text-neutral-200/70 cursor-pointer group-hover:opacity-100 opacity-70 dark:opacity-50 hover:opacity-100 transition-opacity ease duration-300 text-sm flex justify-center items-center"
                        href="/docs"
                      >
                        <span>Explore Now</span> <ArrowRight />
                      </Link>
                    </div>
                  </div>
                </div>

                <div
                  className="w-full md:w-1/2 flex bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-gray-400/10 p-4 rounded-xl h-full transition-colors duration-300"
                >
                  <div className="flex flex-col gap-3 justify-start items-start">
                    <div className="w-full flex gap-x-4 justify-start items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="112"
                        height="72"
                        fill="none"
                        viewBox="0 0 112 72"
                      >
                        <g clipPath="url(#clip0_327_186)">
                          <mask
                            id="mask0_327_186"
                            width="112"
                            height="72"
                            x="0"
                            y="0"
                            maskUnits="userSpaceOnUse"
                            style={{ maskType: "luminance" }}
                          >
                            <path fill="#fff" d="M112 0H0v72h112z"></path>
                          </mask>
                          <g mask="url(#mask0_327_186)">
                            <path
                              stroke="#BDBDBD"
                              className="stroke-neutral-400 transition-colors duration-300"
                              d="M3.129 34.5c0-.724.478-1.447 1.435-2L52.195 5c1.913-1.104 5.015-1.104 6.928 0l47.632 27.5c.956.553 1.435 1.276 1.435 2m-105.061 0c0 .724.478 1.448 1.435 2L52.195 64c1.913 1.105 5.015 1.105 6.928 0l47.632-27.5c.956-.552 1.435-1.276 1.435-2m-105.061 0v3c0 .724.478 1.448 1.435 2L52.195 67c1.913 1.105 5.015 1.105 6.928 0l47.632-27.5c.956-.552 1.435-1.276 1.435-2v-3"
                            ></path>
                            <path
                              stroke="#E5E5E5"
                              className="stroke-neutral-200 transition-colors duration-300"
                              d="m13.222 38.5 46.766-27c.478-.276 1.253-.276 1.732 0l41.569 24m-90.067 3 41.57 24c.478.276 1.253.276 1.732 0l46.765-27m-90.067 3-.866-.5c-.478-.276-.478-.724 0-1L59.988 9.5c.478-.276 1.253-.276 1.732 0L104.155 34c.478.276.478.724 0 1l-.866.5"
                            ></path>
                            <path
                              stroke="#222"
                              className="stroke-neutral-400 transition-colors duration-300"
                              d="M10.73 33.493c-.002-.27-.182-.538-.537-.743-.718-.414-1.88-.414-2.598 0-.356.205-.535.474-.538.743m3.674 0c.003.274-.176.548-.538.757-.718.414-1.88.414-2.598 0-.362-.209-.542-.483-.538-.757m3.674 0V34.5c0 .272-.18.543-.538.75-.718.414-1.88.414-2.598 0-.355-.204-.534-.472-.538-.74v-1.017M15.061 31c0-.271-.18-.543-.538-.75-.718-.414-1.88-.414-2.598 0-.357.206-.536.476-.538.746M15.06 31c0 .272-.18.543-.538.75-.718.414-1.88.414-2.598 0-.36-.208-.54-.482-.538-.754M15.06 31v1.003c-.001.27-.18.54-.538.747-.718.414-1.88.414-2.598 0-.357-.206-.537-.476-.538-.747v-1.007M15.717 28.5c0 .272.18.543.538.75.717.414 1.88.414 2.598 0 .359-.207.538-.478.538-.75m-3.674 0c0-.271.18-.543.538-.75.717-.414 1.88-.414 2.598 0 .359.207.538.479.538.75m-3.674 0v1c0 .271.18.543.538.75.717.414 1.88.414 2.598 0 .359-.207.538-.479.538-.75v-1"
                            ></path>
                            <path
                              fill="#fff"
                              d="m30.976 35.75-6.062 3.5c-.24.138-.24.362 0 .5l.865.5c.24.138.627.138.866 0l6.063-3.5c.239-.138.239-.362 0-.5l-.866-.5a.96.96 0 0 0-.866 0M48.298 45.75l-6.062 3.5c-.24.138-.24.362 0 .5l.866.5c.239.138.627.138.866 0l6.062-3.5c.24-.138.24-.362 0-.5l-.866-.5a.96.96 0 0 0-.866 0M25.78 34.75l-6.062 3.5c-.239.138-.239.362 0 .5l.866.5c.24.138.627.138.866 0l6.062-3.5c.24-.138.24-.362 0-.5l-.866-.5a.96.96 0 0 0-.866 0M37.038 32.25l-3.464 2c-.24.138-.24.362 0 .5l.866.5c.239.138.627.138.866 0l3.464-2c.239-.138.239-.362 0-.5l-.866-.5a.96.96 0 0 0-.866 0M54.36 42.25l-3.464 2c-.24.138-.24.362 0 .5l.866.5c.24.138.627.138.866 0l3.464-2c.24-.138.24-.362 0-.5l-.866-.5a.96.96 0 0 0-.866 0M35.307 37.25l-5.196 3c-.24.138-.24.362 0 .5l.866.5c.239.138.627.138.866 0l5.196-3c.24-.138.24-.362 0-.5l-.866-.5a.96.96 0 0 0-.866 0M52.627 47.25l-5.196 3c-.24.138-.24.362 0 .5l.866.5c.24.138.627.138.866 0l5.196-3c.24-.138.24-.362 0-.5l-.866-.5a.96.96 0 0 0-.866 0M37.904 39.75l-2.598 1.5c-.24.138-.24.362 0 .5l.866.5c.24.138.627.138.866 0l2.598-1.5c.24-.138.24-.362 0-.5l-.866-.5a.96.96 0 0 0-.866 0M56.957 52.75l-2.598 1.5c-.24.138-.24.362 0 .5l.866.5c.239.138.627.138.866 0l2.598-1.5c.24-.138.24-.362 0-.5l-.866-.5a.96.96 0 0 0-.866 0M55.224 49.75l-2.598 1.5c-.239.138-.239.362 0 .5l.866.5c.24.138.627.138.866 0l2.599-1.5c.239-.138.239-.362 0-.5l-.867-.5a.96.96 0 0 0-.866 0M39.637 42.75l-2.599 1.5c-.239.138-.239.362 0 .5l.867.5c.239.138.626.138.865 0l2.599-1.5c.239-.138.239-.362 0-.5l-.866-.5a.96.96 0 0 0-.866 0M58.69 55.75l-2.599 1.5c-.239.138-.239.362 0 .5l.866.5c.24.138.627.138.866 0l2.598-1.5c.24-.138.24-.362 0-.5l-.866-.5a.96.96 0 0 0-.866 0M41.369 45.75l-2.598 1.5c-.24.138-.24.362 0 .5l.866.5c.24.138.627.138.866 0l2.598-1.5c.24-.138.24-.362 0-.5l-.866-.5a.96.96 0 0 0-.866 0M44.832 27.75l-5.196 3c-.239.138-.239.362 0 .5l.866.5c.24.138.627.138.866 0l5.196-3c.24-.138.24-.362 0-.5l-.866-.5a.96.96 0 0 0-.866 0M60.42 38.75l-3.464 2c-.239.138-.239.362 0 .5l.866.5c.24.138.627.138.866 0l3.465-2c.239-.138.239-.362 0-.5l-.866-.5a.96.96 0 0 0-.867 0M42.236 33.25l-4.33 2.5c-.24.138-.24.362 0 .5l.866.5c.239.138.627.138.866 0l4.33-2.5c.239-.138.239-.362 0-.5l-.866-.5a.96.96 0 0 0-.866 0M59.556 43.25l-4.33 2.5c-.24.138-.24.362 0 .5l.866.5c.24.138.627.138.866 0l4.33-2.5c.24-.138.24-.362 0-.5l-.866-.5a.96.96 0 0 0-.866 0M47.432 34.25l-6.929 4c-.239.138-.239.362 0 .5l.866.5c.24.138.627.138.866 0l6.929-4c.239-.138.239-.362 0-.5l-.867-.5a.96.96 0 0 0-.865 0M64.752 44.25l-6.928 4c-.24.138-.24.362 0 .5l.866.5c.239.138.627.138.866 0l6.928-4c.239-.138.239-.362 0-.5l-.866-.5a.96.96 0 0 0-.866 0M47.43 30.25l-2.599 1.5c-.239.138-.239.362 0 .5l.866.5c.24.138.627.138.866 0l2.599-1.5c.239-.138.239-.362 0-.5l-.867-.5a.96.96 0 0 0-.866 0M71.68 36.25l-9.526 5.5c-.24.138-.24.362 0 .5l.866.5c.239.138.627.138.866 0l9.526-5.5c.24-.138.24-.362 0-.5l-.866-.5a.96.96 0 0 0-.866 0M55.225 29.75l-5.196 3c-.24.138-.24.362 0 .5l.866.5c.239.138.627.138.866 0l5.196-3c.24-.138.24-.362 0-.5l-.866-.5a.96.96 0 0 0-.866 0M72.547 39.75l-5.196 3c-.24.138-.24.362 0 .5l.866.5c.24.138.627.138.866 0l5.196-3c.24-.138.24-.362 0-.5l-.866-.5a.96.96 0 0 0-.866 0M65.618 23.75l-7.794 4.5c-.24.138-.24.362 0 .5l.866.5c.239.138.627.138.866 0l7.794-4.5c.24-.138.24-.362 0-.5l-.866-.5a.96.96 0 0 0-.866 0M82.938 33.75l-7.794 4.5c-.24.138-.24.362 0 .5l.866.5c.24.138.627.138.866 0l7.794-4.5c.24-.138.24-.362 0-.5l-.866-.5a.96.96 0 0 0-.866 0"
                            ></path>
                          </g>
                        </g>
                        <defs>
                          <clipPath id="clip0_327_186">
                            <path fill="#fff" d="M0 0h112v72H0z"></path>
                          </clipPath>
                        </defs>
                      </svg>
                      <div className="flex flex-col w-full justify-start items-start gap-2">
                        <h2 className="text-xl md:text-2xl text-customDarkTwo dark:text-white transition-colors duration-300">Code Components</h2>
                        <p className="text-sm text-balance text-neutral-600 dark:text-neutral-400 text-left transition-colors duration-300">
                          Streamline coding with pre-built, customizable code blocks
                          for rapid development and editing.
                        </p>
                      </div>
                    </div>
                    <div className="w-full flex justify-end pt-4 items-center">
                      <Link
                        className="gap-x-2 text-neutral-500 dark:text-neutral-200/70 cursor-pointer group-hover:opacity-100 opacity-70 dark:opacity-50 hover:opacity-100 transition-opacity ease duration-300 text-sm flex justify-center items-center"
                        href="/docs"
                      >
                        <span>Explore Now</span> <ArrowRight />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-full justify-center items-center gap-x-4">
          <div className="flex max-w-3xl flex-col justify-start items-start w-full">
            <h2 className="text-3xl px-4 text-left text-customDarkTwo dark:text-white transition-colors duration-300">Test Our AI Chatbot</h2>
          </div>
          <ChatbotIA/>
          {/* <ChatbotIA /> */}
        </div>

        <div className="absolute sm:flex hidden w-full pointer-events-none justify-center h-full items-center">
          <div className="w-full max-w-[52rem] flex items-center justify-between h-full">
            <div
              className="w-8 h-full border-x border-neutral-200 dark:border-neutral-400/40 bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] bg-fixed [--pattern-fg:var(--color-black)]/5 md:block dark:[--pattern-fg:var(--color-white)]/10 transition-colors duration-300"
            ></div>
            <div
              className="w-8 h-full border-x border-neutral-200 dark:border-neutral-400/40 bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] bg-fixed [--pattern-fg:var(--color-black)]/5 md:block dark:[--pattern-fg:var(--color-white)]/10 transition-colors duration-300"
            ></div>
          </div>
        </div>

        <div className="flex border-y border-neutral-200 dark:border-neutral-400/40 flex-col w-full justify-center items-center gap-x-4 pt-4 transition-colors duration-300">
          <div className="w-full px-4 flex justify-start items-center mb-8 max-w-3xl">
            <NewsLetter />
          </div>
        </div>

        <div className="flex border-y border-neutral-200 dark:border-neutral-400/40 flex-col w-full justify-center items-center gap-x-4 pt-4 transition-colors duration-300">
          <div className="w-full px-4 flex justify-between items-center mb-8 max-w-3xl">
            <Link href={"/"}>
              <div className="flex gap-x-2 text-sm text-neutral-500 dark:text-neutral-400/80 justify-start items-center transition-colors duration-300">
                <div className="h-8 w-8 rounded-full bg-blue-700"></div>
                <span>By Leonel Yimga</span>
              </div>
            </Link>
            <span className="text-sm text-neutral-500 dark:text-neutral-400/80 transition-colors duration-300">
              Copyright © 2025 ly-ui.dev
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
