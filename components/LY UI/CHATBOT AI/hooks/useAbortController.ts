import { useRef, useCallback } from "react";

export const useAbortController = () => {
  const abortControllersRef = useRef<Record<number, AbortController>>({});

  const createController = useCallback((idx: number): AbortController => {
    const controller = new AbortController();
    abortControllersRef.current[idx] = controller;
    return controller;
  }, []);

  const abortController = useCallback((idx: number) => {
    const controller = abortControllersRef.current[idx];
    if (controller) {
      controller.abort();
      delete abortControllersRef.current[idx];
    }
  }, []);

  const abortAllControllers = useCallback(() => {
    Object.entries(abortControllersRef.current).forEach(([idx, controller]) => {

      controller.abort();
    });
    abortControllersRef.current = {};
  }, []);

  const hasController = useCallback((idx: number): boolean => {
    return !!abortControllersRef.current[idx];
  }, []);

  return {
    createController,
    abortController,
    abortAllControllers,
    hasController,
  };
};
