"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import DefaultSearchDialog from "@/components/search";
import PatternSVG from "./patternSvg";
import { Toggle } from "@/components/ui/toggle";


const Header = () => {
  const [searchIsOpen, setSearchIsOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Initialiser le thème au chargement
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      const isDark = savedTheme === "dark" || 
        (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
      setIsDarkMode(isDark);
    }
  }, []);

  const handleOpenSearchBar = () => {
    setSearchIsOpen(true);
  };

  const handleThemeChange = (checked: boolean) => {
    setIsDarkMode(checked);
  };

  return (
    <header
      className="flex h-16 flex-col w-full md:px-0 px-4 relative border-b border-neutral-200 dark:border-neutral-700 justify-between items-start
     dark:bg-black bg-white"
    >
      <div className="flex w-full py-4 px-4 items-center justify-between">
        <Link href="/" className="">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 39 62"
            fill="none"
          >
            <path
              className="fill-black dark:fill-white"
              d="M24.7206 29.6901H7.49192C3.62493 29.6901 0.490126 26.5624 0.490126 22.7042V0H4.11203V20.2093C4.11203 23.1029 3.55341 25.3239 9.36337 25.4487H24.7206V29.6901Z"
            />
            <path
              className="fill-black dark:fill-white"
              d="M39 21.2072C39 22.7624 38.5895 24.1904 37.7686 25.4911C36.9717 26.7635 35.8852 27.7815 34.5088 28.5449C33.1325 29.3084 31.6113 29.6901 29.9452 29.6901H9.69881V25.4487H29.9452C30.9352 25.4487 31.8407 25.2649 32.6617 24.8973C33.4826 24.5014 34.1346 23.9783 34.6175 23.328C35.1246 22.6776 35.3781 21.9707 35.3781 21.2072V19.0865H18.7536C17.0875 19.0865 15.5663 18.6058 14.19 17.6444C12.8378 16.683 11.7512 15.4106 10.9303 13.8271C10.1093 12.2154 9.69881 10.434 9.69881 8.4829V0H13.3207V8.4829C13.3207 9.64223 13.5622 10.7167 14.0451 11.7064C14.528 12.6678 15.18 13.4313 16.0009 13.9968C16.846 14.5623 17.7636 14.8451 18.7536 14.8451H35.3781V0H39V21.2072Z"
            />
            <path
              className="fill-black dark:fill-white"
              d="M27.0619 37.5493L27.0269 49.7746C27.0269 51.4746 26.7119 53.0697 26.0817 54.56C25.4515 56.027 24.5763 57.3194 23.456 58.4372C22.3357 59.5549 21.0287 60.4282 19.535 61.0569C18.0646 61.6856 16.4892 62 14.8088 62H12.2181C10.5377 62 8.95063 61.6856 7.45691 61.0569C5.98654 60.4282 4.6912 59.5549 3.57092 58.4372C2.45063 57.2961 1.5754 55.9921 0.945242 54.5251C0.315081 53.0347 0 51.4513 0 49.7746V37.5493H3.5009V49.7746C3.5009 51.3814 3.886 52.8484 4.65619 54.1758C5.44973 55.4798 6.51167 56.5277 7.84201 57.3194C9.17235 58.1112 10.6311 58.507 12.2181 58.507H14.8088C16.4192 58.507 17.8779 58.1112 19.1849 57.3194C20.5153 56.5277 21.5655 55.4798 22.3357 54.1758C23.1293 52.8484 23.526 51.3814 23.526 49.7746V37.5493H27.0619Z"
            />
            <path
              className="fill-black dark:fill-white"
              d="M35.1684 62H31.6675L31.8772 37.5493H35.3781L35.1684 62Z"
            />
          </svg>
        </Link>
        <div className="flex items-center gap-2">
        <Toggle 
            className={` ${isDarkMode ? "dark:bg-neutral-300" : "bg-neutral-700"}`}
            checked={isDarkMode}
            onCheckedChange={handleThemeChange}
            themeToggle={true}
            showLabel={true}
            
          />
          <button
            className="ml-4 px-3 py-1 gap-x-2 cursor-pointer flex bg-neutral-200/40 dark:bg-neutral-800 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
            onClick={handleOpenSearchBar}
            aria-label="Ouvrir la recherche"
          >
            <span className="text-neutral-500 dark:text-neutral-300">
              crtl + k
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
                stroke="currentColor"
                strokeWidth="2"
                className="text-neutral-500 dark:text-neutral-300"
              />
              <line
                x1="16.018"
                y1="16.485"
                x2="21"
                y2="21.467"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-neutral-500 dark:text-neutral-300"
              />
            </svg>
          </button>
          
        </div>
      </div>
      <DefaultSearchDialog
        onOpenChange={(open) => setSearchIsOpen(open)}
        open={searchIsOpen}
      />
    </header>
  );
};

export default Header;
