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
import ChatbotIA from "@/components/ChatbotIA";
import { ArrowRight, Phone } from "lucide-react";
import NewsLetter from "../components/newsletter";

export default function HomePage() {
  // Animation state for long lines
  const [linesExpanded, setLinesExpanded] = useState(false);
  const longLineRefs = useRef<(SVGPolygonElement | null)[]>([]);
  const animationValues = useRef<number[]>([]);
  // const animationTimeout = useRef<NodeJS.Timeout | null>(null); // Cette variable n'est pas utilisée, on la retire

  // Initialiser les valeurs d'animation
  useEffect(() => {
    // Initialiser 12 valeurs (96/8 = 12 lignes longues)
    animationValues.current = new Array(12).fill(0);
  }, []);

  // Fonction pour recalculer les points du polygone
  const calculatePolygonPoints = (i: number, animValue: number) => {
    const angle = ((i * 360) / 96) * (Math.PI / 180);
    const center = 200;

    // Paramètres d'animation - correction pour un meilleur recul
    const r1Collapsed = 130; // Position initiale (état normal)
    const r2Collapsed = 170; // Position finale (état normal)
    const r1Expanded = 60; // Position contractée (recul plus important)
    const r2Expanded = 170; // Position finale reste la même
    const baseWidth = 4;
    const tipLength = 80; // Réduction de la longueur des pointes

    // Interpolation avec les bonnes valeurs
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
        // Animation synchronisée pour toutes les lignes
        const tl = gsap.timeline();

        // Animer toutes les lignes en même temps avec un léger décalage
        tl.to(longLineRefs.current, {
          duration: 2.5,
          stagger: 0.05, // Réduction du décalage pour meilleure synchronisation
          ease: "power2.inOut", // Changement d'easing pour plus de fluidité
          onUpdate: function () {
            // Correction: this.targets() peut ne pas exister selon le contexte d'appel
            // On utilise tl.getChildren() ou on stocke les refs dans une variable
            const targets = longLineRefs.current;
            targets.forEach((target: SVGPolygonElement | null, index: number) => {
              if (target) {
                // Correction: Typage explicite et vérification de l'existence des méthodes
                const timeline = this as unknown as gsap.core.Timeline;
                const progress =
                  typeof timeline.progress === "function"
                    ? timeline.progress()
                    : 0;
                const totalDuration =
                  typeof timeline.duration === "function"
                    ? timeline.duration()
                    : 1;
                const staggerDelay = index * 0.05; // Même valeur que le stagger
                const currentTime = progress * totalDuration;
                const elementStartTime = staggerDelay * totalDuration;

                // Calculer le progrès pour cet élément spécifique
                let elementProgress = Math.max(
                  0,
                  Math.min(
                    1,
                    (currentTime - elementStartTime) /
                    (totalDuration - elementStartTime)
                  )
                );

                // Appliquer une courbe d'animation pour un meilleur effet
                if (elementProgress > 0) {
                  elementProgress = toExpand
                    ? elementProgress
                    : 1 - elementProgress;
                }

                // Calculer l'index original (i)
                const originalIndex = index * 8;
                const points = calculatePolygonPoints(
                  originalIndex,
                  elementProgress
                );
                target.setAttribute("points", points);

                // Mise à jour de la valeur d'animation
                animationValues.current[index] = elementProgress;
              }
            });
          },
          onStart: () => setLinesExpanded(toExpand),
        });
      }
    }

    // Démarrer avec l'état normal (collapsed)
    animateLines(false);

    // Première expansion après 2 secondes
    timeout = setTimeout(() => {
      animateLines(true);
      direction = "collapse";

      // Puis alterner toutes les 8 secondes
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
    <main className="flex flex-col h-full relative justify-center text-center w-full">
      <div className="flex flex-col h-full gap-4 w-full justify-center items-center">
        <div className="relative flex items-center justify-center">
          <svg
            className="relative left-0 top-0"
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
                    fill="#222"
                    className="dark:fill-white fill-neutral-400"
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
                    stroke="#222"
                    strokeWidth={2}
                    strokeLinecap="round"
                    className="dark:stroke-white"
                  />
                );
              }
            })}
          </svg>
        </div>

        <div className="flex flex-col gap-y-3 w-full border-y border-neutral-200/20 justify-center items-center mt-4">
          <h2 className="text-2xl sm:text-3xl max-w-xl md:text-5xl m-0 p-0 font-medium dark:text-white text-customDarkTwo text-center text-balance">
            Discover <span className="text-neutral-400">Free</span> UI{" "}
            <span className="text-neutral-400">Components</span> For Your Next{" "}
            <span className="text-neutral-400">AI Project</span>
          </h2>
        </div>

        <Link
          href="/docs"
          className="relative mt-8 border rounded-2xl p-1 hover:bg-neutral-300/20 transition-all ease duration-300 border-neutral-500/30 dark:border-white/20"
        >
          <span className="pointer-events-none absolute w-1 h-1 bg-black dark:bg-white rounded-full -top-1 -left-1"></span>
          <span className="pointer-events-none absolute w-1 h-1 bg-black dark:bg-white rounded-full -top-1 -right-1"></span>
          <span className="pointer-events-none absolute w-1 h-1 bg-black dark:bg-white rounded-full -bottom-1 -left-1"></span>
          <span className="pointer-events-none absolute w-1 h-1 bg-black dark:bg-white rounded-full -bottom-1 -right-1"></span>
          <button className="flex gap-x-3 bg-neutral-300/20 dark:bg-black border border-white/30 dark:text-white justify-center cursor-pointer items-center customGrayTwo border-customGrayTwoBorder rounded-xl dark:border-customDarkTwoBorder dark:hover:bg-transparent hover:bg-transparent bg-customGrayTwo dark:bg-customDarkTwo text-customDarkTwo px-4 py-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              fill="none"
              viewBox="0 0 103 109"
            >
              <path
                stroke="#fff"
                className="stroke-black dark:stroke-white"
                strokeWidth="3"
                d="m67.105 70.846-63.613 34.55c5.574-11.17 9.785-20.364 13.985-29.54 4.678-10.217 9.346-20.411 15.89-33.322L99.504 3.785zm-10.47-13.99c0 4.146-3.516 7.61-7.979 7.61s-7.978-3.464-7.978-7.61 3.515-7.61 7.978-7.61 7.979 3.463 7.979 7.61Zm3 0c0-5.915-4.972-10.61-10.979-10.61s-10.978 4.695-10.978 10.61 4.972 10.61 10.978 10.61c6.007 0 10.979-4.695 10.979-10.61Z"
              ></path>
            </svg>
            <span>Explore components</span>
          </button>
        </Link>

        <div className="flex gap-3"></div>

        <div className="flex gap-x-3 py-4 justify-center items-center">
          {/* ...icônes... */}
          {/* (Pas d'erreur ici) */}
        </div>

        <div className="w-full border-y border-neutral-400/20 py-3 flex justify-center items-center mt-16">
          <div className="w-full flex flex-col justify-center items-center gap-y-2">
            <div className="relative flex flex-col px-4 max-w-3xl w-full justify-start items-start">
              <h2 className="text-2xl m-0 inset-0 md:text-3xl">
                Crafted for today's web.
              </h2>
              <div className="flex flex-col text-left py-4 justify-start items-start">
                <p className="w-full text-left text-neutral-500">
                  Our library leverages cutting-edge CSS to deliver a seamless and
                  enjoyable developer experience with modern UI components.
                </p>
              </div>
            </div>
            <div className="w-full border-y group border-neutral-400/20 flex justify-center items-center">
              <div className="flex w-full md:flex-row flex-col max-w-3xl px-3 bg-gray-200/10 gap-4 p-2 justify-start items-start">
                {/* ...cartes de composants... */}
                <div
                  className="w-full md:w-1/2 flex bg-neutral-7 bg-neutral-800 border border-gray-400/10 p-4 rounded-xl h-full"
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
                          stroke="#fff"
                          d="M48.5.5c13.318 0 25.351 3.229 34.038 8.423C91.235 14.123 96.5 21.237 96.5 29s-5.265 14.877-13.962 20.077C73.851 54.271 61.818 57.5 48.5 57.5s-25.351-3.229-34.038-8.423C5.765 43.877.5 36.763.5 29S5.765 14.123 14.462 8.923C23.149 3.729 35.182.5 48.5.5Z"
                        ></path>
                        <path
                          stroke="#fff"
                          d="M43 12.5c11.792 0 22.444 3.113 30.133 8.12C80.827 25.63 85.5 32.493 85.5 40s-4.674 14.37-12.367 19.38C65.443 64.387 54.792 67.5 43 67.5s-22.444-3.113-30.133-8.12C5.173 54.37.5 47.507.5 40s4.673-14.37 12.367-19.38C20.557 15.613 31.21 12.5 43 12.5Z"
                        ></path>
                        <path
                          stroke="#fff"
                          d="M48.5.5c13.318 0 25.351 3.229 34.038 8.423C91.235 14.123 96.5 21.237 96.5 29s-5.265 14.877-13.962 20.077C73.851 54.271 61.818 57.5 48.5 57.5s-25.351-3.229-34.038-8.423C5.765 43.877.5 36.763.5 29S5.765 14.123 14.462 8.923C23.149 3.729 35.182.5 48.5.5Z"
                        ></path>
                        <path
                          stroke="#fff"
                          d="M43 12.5c11.792 0 22.444 3.113 30.133 8.12C80.827 25.63 85.5 32.493 85.5 40s-4.674 14.37-12.367 19.38C65.443 64.387 54.792 67.5 43 67.5s-22.444-3.113-30.133-8.12C5.173 54.37.5 47.507.5 40s4.673-14.37 12.367-19.38C20.557 15.613 31.21 12.5 43 12.5Z"
                        ></path>
                        <path
                          stroke="#fff"
                          d="m4.5 40-1.871 7.953-.129.547M8.5 44.5l-2.5 9M12.868 48l-2.943 9.5M8.453 45 6 54m11-4-3.15 10m7.65-7.5-3.236 10M26.5 54l-3.33 10.5m9.83-9L29.547 66M43.5 57.5l-1.689 5.75L40.34 68M49 57.5l-1.792 5.75L45.736 68M53 57.5l-1.377 5.75-.981 4.25M58 57.5s-.512 3.113-.981 4.75c-.484 1.69-1.472 4.25-1.472 4.25M61 65l2.5-8.5M66 63l1-3.5 1-4.5m4.5-1L71 60.5M38.5 57l-3.066 10 1.472-4.75z"
                        ></path>
                        <path
                          fill="#D9D9D9"
                          d="M12 35a1 1 0 1 1-2 0 1 1 0 0 1 2 0"
                        ></path>
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
                        <h2 className="text-xl md:text-2xl">AI Components</h2>
                        <p className="text-sm text-balance text-neutral-400 text-left">
                          Seamlessly add intelligent AI features to your UI for easy
                          content generation and interaction.
                        </p>
                      </div>
                    </div>
                    <div className="w-full flex justify-end pt-4 items-center">
                      <Link
                        className="gap-x-2 text-neutral-200/70 cursor-pointer group-hover:opacity-100 opacity-50 hover:opacity-100 transition-opacity ease duration-300 text-sm flex justify-center items-center"
                        href="/docs"
                      >
                        <span>Explore Now</span> <ArrowRight />
                      </Link>
                    </div>
                  </div>
                </div>

                <div
                  className="w-full md:w-1/2 flex bg-neutral-7 bg-neutral-800 border border-gray-400/10 p-4 rounded-xl h-full"
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
                              stroke="#D9D5D5"
                              d="M3.129 34.5c0-.724.478-1.447 1.435-2L52.195 5c1.913-1.104 5.015-1.104 6.928 0l47.632 27.5c.956.553 1.435 1.276 1.435 2m-105.061 0c0 .724.478 1.448 1.435 2L52.195 64c1.913 1.105 5.015 1.105 6.928 0l47.632-27.5c.956-.552 1.435-1.276 1.435-2m-105.061 0v3c0 .724.478 1.448 1.435 2L52.195 67c1.913 1.105 5.015 1.105 6.928 0l47.632-27.5c.956-.552 1.435-1.276 1.435-2v-3"
                            ></path>
                            <path
                              stroke="#FAFAFA"
                              d="m13.222 38.5 46.766-27c.478-.276 1.253-.276 1.732 0l41.569 24m-90.067 3 41.57 24c.478.276 1.253.276 1.732 0l46.765-27m-90.067 3-.866-.5c-.478-.276-.478-.724 0-1L59.988 9.5c.478-.276 1.253-.276 1.732 0L104.155 34c.478.276.478.724 0 1l-.866.5"
                            ></path>
                            <path
                              stroke="#fff"
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
                        <h2 className="text-xl md:text-2xl">Code Components</h2>
                        <p className="text-sm text-balance text-neutral-400 text-left">
                          Streamline coding with pre-built, customizable code blocks
                          for rapid development and editing.
                        </p>
                      </div>
                    </div>
                    <div className="w-full flex justify-end pt-4 items-center">
                      <Link
                        className="gap-x-2 text-neutral-200/70 cursor-pointer group-hover:opacity-100 opacity-50 hover:opacity-100 transition-opacity ease duration-300 text-sm flex justify-center items-center"
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
            <h2 className="text-3xl px-4 text-left">Test Our AI Chatbot</h2>
          </div>
          <ChatbotIA />
        </div>

        <div className="absolute sm:flex hidden w-full pointer-events-none justify-center h-full items-center">
          <div className="w-full max-w-[52rem] flex items-center justify-between h-full">
            <div
              className="w-8 h-full border-x border-neutral-400/20 bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] bg-fixed [--pattern-fg:var(--color-black)]/5 md:block dark:[--pattern-fg:var(--color-white)]/10"
            ></div>
            <div
              className="w-8 h-full border-x border-neutral-400/20 bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] bg-fixed [--pattern-fg:var(--color-black)]/5 md:block dark:[--pattern-fg:var(--color-white)]/10"
            ></div>
          </div>
        </div>

        <div className="flex border-y border-neutral-400/20 flex-col w-full justify-center items-center gap-x-4 pt-4">
          <div className="w-full px-4 flex justify-start items-center mb-8 max-w-3xl">
            <NewsLetter />
          </div>
        </div>

        <div className="flex border-y border-neutral-400/20 flex-col w-full justify-center items-center gap-x-4 pt-4">
          <div className="w-full px-4 flex justify-between items-center mb-8 max-w-3xl">
            <Link href={"/"}>
              <div className="flex gap-x-2 text-sm text-neutral-400/80 justify-start items-center">
                <div className="h-8 w-8 rounded-full bg-blue-700"></div>
                <span>By Leonel Yimga</span>
              </div>
            </Link>
            <span className="text-sm text-neutral-400/80">
              Copyright © 2025 ly-ui.dev
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
