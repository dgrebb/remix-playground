import { useLocation, useNavigationType } from "@remix-run/react";
import { useEffect, useState } from "react";

// Feature detection for View Transitions API
export const supportsViewTransitions =
  typeof document !== "undefined" && "startViewTransition" in document;

/**
 * Hook to handle different types of transitions based on browser support
 * 1. Native View Transitions API (most modern, Chrome/Edge 111+)
 * 2. CSS-based transitions (fallback for most modern browsers)
 * 3. No transition (ultimate fallback for older browsers)
 */
export function useViewTransition() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const [transitionState, setTransitionState] = useState<
    "idle" | "pending" | "transitioning"
  >("idle");

  // Track the previous and current paths for transition effects
  const [previousPath, setPreviousPath] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string | null>(
    location.pathname
  );

  useEffect(() => {
    // Save the previous path when navigation occurs
    if (currentPath !== location.pathname) {
      setPreviousPath(currentPath);
      setCurrentPath(location.pathname);
    }
  }, [location.pathname, currentPath]);

  // Set a class on the document body to control CSS-based transitions
  useEffect(() => {
    if (previousPath && currentPath) {
      const isNavigatingForward = navigationType === "PUSH";

      // Apply CSS transition classes for browsers without View Transitions API
      if (!supportsViewTransitions) {
        document.body.classList.add("is-transitioning");
        document.body.classList.toggle(
          "is-navigating-forward",
          isNavigatingForward
        );
        document.body.classList.toggle(
          "is-navigating-backward",
          !isNavigatingForward
        );

        // Remove classes after transition is complete
        const timeout = setTimeout(() => {
          document.body.classList.remove(
            "is-transitioning",
            "is-navigating-forward",
            "is-navigating-backward"
          );
        }, 400); // Match the CSS transition duration

        return () => clearTimeout(timeout);
      }
    }
  }, [previousPath, currentPath, navigationType]);

  return {
    previousPath,
    currentPath,
    isTransitioning: transitionState !== "idle",
    navigationType,
  };
}

/**
 * Component to wrap the application for view transitions
 */
export function ViewTransitionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useViewTransition();

  return <>{children}</>;
}

/**
 * Higher-order component to apply transition styles to a component
 */
export function withViewTransition<T extends object>(
  Component: React.ComponentType<T>
) {
  return function WithViewTransition(props: T) {
    useViewTransition();
    return <Component {...props} />;
  };
}
