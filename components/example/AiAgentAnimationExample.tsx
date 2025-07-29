"use client";
import { useState } from "react";
import AiAgentAnimation from "../LY UI/AI/AiAgentAnimation";
import { Button } from "../ui/button";

export default function AiAgentAnimationExample() {
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const handleStart = () => {
    console.log("Animation started");
    setHasStarted(true);
  };

  const handleStop = () => {
    console.log("Animation stopped");
  };

  const handleReset = () => {
    setIsRunning(false);
    setHasStarted(false);
    setAnimationKey((prev) => prev + 1);
    console.log("Animation reset");
  };

  const handleComplete = () => {
    console.log("Animation completed");
    setIsRunning(false);
    setHasStarted(false);
  };

  const handleStartOrResume = () => {
    setIsRunning(true);
    if (!hasStarted) {
      handleStart();
    } else {
      console.log("Animation resumed");
    }
  };

  return (
    <div className="w-full flex flex-col justify-center items-center gap-y-8">
      <AiAgentAnimation
        key={animationKey}
        title="Agent Loading"
        dotType="square"
        className="w-1/2"
        isRunning={isRunning}
        onAnimationStart={handleStart}
        onAnimationStop={handleStop}
        onAnimationReset={handleReset}
        onAnimationComplete={handleComplete}
        rows={3}
        // columns={45}
        duration={40000}
        pauseDuration={1000}
      />
      <div className="flex rounded-full overflow-hidden max-w-xs bg-neutral-100 border border-neutral-300 flex-shrink-0 justify-center items-center dark:bg-neutral-700 dark:border-neutral-500">
        <Button
          onClick={handleStartOrResume}
          disabled={isRunning}
          variant={"outline"}
          className="rounded-none border-none px-4 text-neutral-800 dark:text-neutral-200"
        >
          {hasStarted ? "Resume" : "Start"}
        </Button>
        <Button
          className="rounded-none border-none px-4 text-neutral-800 dark:text-neutral-200"
          variant={"outline"}
          onClick={() => setIsRunning(false)}
          disabled={!isRunning}
        >
          Stop
        </Button>
        <Button
          className="rounded-none border-none px-4 text-neutral-800 dark:text-neutral-200"
          variant={"outline"}
          onClick={handleReset}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}