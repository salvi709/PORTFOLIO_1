import { useEffect } from "react";

// Reduce physical wheel input displacement to ~58-65% for tight, controlled scroll-scrubbing.
// Immediate 1:1 direct response: no lag, no artificial momentum, instant stop and reversal.
const WHEEL_SCALE = 0.60;

export default function useWheelSensitivity() {
  useEffect(() => {
    const desktop = matchMedia("(hover: hover) and (pointer: fine)");
    let remainder = 0;
    let direction = 0;

    const reset = () => {
      remainder = 0;
      direction = 0;
    };

    const wheel = (event) => {
      if (
        !desktop.matches ||
        event.defaultPrevented ||
        !event.cancelable ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey ||
        Math.abs(event.deltaX) >= Math.abs(event.deltaY)
      ) {
        reset();
        return;
      }

      // Let nested scroll containers, dialogs, and form inputs handle their own scroll
      if (
        document.querySelector("dialog[open]") ||
        getComputedStyle(document.body).overflowY === "hidden"
      ) {
        reset();
        return;
      }

      for (const node of event.composedPath()) {
        if (
          !(node instanceof Element) ||
          node === document.body ||
          node === document.documentElement
        )
          continue;
        if (
          node.matches(
            "input,textarea,select,[contenteditable]:not([contenteditable='false'])"
          )
        ) {
          reset();
          return;
        }
        if (
          node.scrollHeight > node.clientHeight &&
          /^(auto|scroll|overlay)$/.test(getComputedStyle(node).overflowY)
        ) {
          reset();
          return;
        }
      }

      let delta = event.deltaY;
      if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
        const style = getComputedStyle(document.documentElement);
        delta *= parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2 || 20;
      } else if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
        delta *= window.innerHeight;
      }

      if (!Number.isFinite(delta) || delta === 0) return;

      const root = document.scrollingElement || document.documentElement;
      const max = Math.max(0, root.scrollHeight - root.clientHeight);
      const current = window.scrollY;

      if (!max || (delta < 0 && current <= 0) || (delta > 0 && current >= max)) {
        reset();
        return;
      }

      const sign = Math.sign(delta);
      if (sign !== direction) remainder = 0;
      direction = sign;

      // Scale the displacement to ~60% of standard wheel travel for tight control
      const scaled = delta * WHEEL_SCALE + remainder;
      const pixels = Math.trunc(scaled);
      remainder = scaled - pixels;

      // Consume sub-pixel input too, otherwise it leaks as an unscaled native
      // movement before the accumulated fraction is applied on the next event.
      event.preventDefault();
      if (pixels !== 0) {
        window.scrollTo({
          top: Math.max(0, Math.min(max, current + pixels)),
          behavior: "instant",
        });
      }
    };

    window.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("blur", reset);
    desktop.addEventListener("change", reset);

    return () => {
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("blur", reset);
      desktop.removeEventListener("change", reset);
    };
  }, []);
}
