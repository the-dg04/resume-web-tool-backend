"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * A custom React hook to apply client-side anti-cheating measures.
 *
 * @param {object} props - The hook's properties.
 * @param {function(string, number): void} [props.onViolation] - Optional callback. Receives violation type (e.g., 'tab_switch') and the new total violation count.
 * @param {boolean} [props.enabled=true] - Whether the anti-cheat measures are active.
 *
 * @returns {object} An object containing:
 * @returns {number} violationCount - The number of violations detected.
 * @returns {function(): void} requestFullscreen - A function to request fullscreen mode.
 */
const useAntiCheat = ({ onViolation, enabled = true }) => {
  const [violationCount, setViolationCount] = useState(0);

  // Memoize the violation handler to keep event listeners stable
  const handleViolation = useCallback(
    (violationType) => {
      // This function is called by the event listeners.
      // We calculate the new count and then call the prop-based handler.
      const newCount = violationCount + 1;
      setViolationCount(newCount);
      if (onViolation) {
        onViolation(violationType, newCount); // Pass newCount to the parent
      }
    },
    [onViolation, violationCount] // Dependency on violationCount ensures newCount is correct
  );

  // Section 2a: Detecting Tab Switching / Losing Focus
  useEffect(() => {
    if (typeof window === "undefined" || !enabled) {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.warn("Violation: User left the tab.");
        handleViolation("tab_switch");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, handleViolation]);

  // Section 2b: Disabling Copy, Paste, and Right-Click
  useEffect(() => {
    if (typeof window === "undefined" || !enabled) {
      return;
    }

    const preventCheating = (e) => {
      e.preventDefault();
      const violationType = e.type === "contextmenu" ? "right_click" : e.type;
      console.warn(`Violation: ${violationType} attempt.`);
      handleViolation(violationType);
      return false;
    };

    document.addEventListener("copy", preventCheating);
    document.addEventListener("paste", preventCheating);
    document.addEventListener("cut", preventCheating);
    document.addEventListener("contextmenu", preventCheating);

    return () => {
      document.removeEventListener("copy", preventCheating);
      document.removeEventListener("paste", preventCheating);
      document.removeEventListener("cut", preventCheating);
      document.removeEventListener("contextmenu", preventCheating);
    };
  }, [enabled, handleViolation]);

  // Section 2c: Requesting Fullscreen Mode
  const requestFullscreen = useCallback(() => {
    // This function must be called by a user gesture (e.g., a "Start Test" button click)
    if (!enabled) return;
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) { // Firefox
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) { // Chrome, Safari, Opera
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) { // IE/Edge
      element.msRequestFullscreen();
    }
  }, [enabled]);

  return { violationCount, requestFullscreen };
};

export default useAntiCheat;

