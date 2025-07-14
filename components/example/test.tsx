import { motion, AnimatePresence } from "motion/react";
import { useState, ReactNode } from "react";

import { LucideSunSnow, MoreHorizontal } from "lucide-react";

type Props = {
  title: string;
  body: ReactNode;
};

export const  Disclosure = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="flex flex-col w-full bg-[#EFEFEF] p-3 rounded-lg"
      onClick={() => setIsOpen((prev) => !prev)}
    >
      <button
        aria-controls={props.title}
        aria-expanded={isOpen}
        className="flex justify-between text-left items-center w-full space-x-4"
      >
        <div className="text-xl font-semibold">{props.title}</div>
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={isOpen ? "minus" : "plus"}
            initial={{
              rotate: isOpen ? -90 : 90,
            }}
            animate={{
              rotate: 0,
              transition: {
                type: "tween",
                duration: 0.15,
                ease: "circOut",
              },
            }}
            exit={{
              rotate: isOpen ? -90 : 90,
              transition: {
                type: "tween",
                duration: 0.15,
                ease: "circIn",
              },
            }}
          >
            {isOpen ? <LucideSunSnow /> : <MoreHorizontal />}
          </motion.div>
        </AnimatePresence>
      </button>
      <motion.div
        id={props.title}
        initial={false}
        animate={
          isOpen
            ? {
                height: "auto",
                opacity: 1,
                display: "block",
                transition: {
                  height: {
                    duration: 0.4,
                  },
                  opacity: {
                    duration: 0.25,
                    delay: 0.15,
                  },
                },
              }
            : {
                height: 0,
                opacity: 0,
                transition: {
                  height: {
                    duration: 0.4,
                  },
                  opacity: {
                    duration: 0.25,
                  },
                },
                transitionEnd: {
                  display: "none",
                },
              }
        }
        className="font-light"
      >
        {props.body}
      </motion.div>
    </div>
  );
};
