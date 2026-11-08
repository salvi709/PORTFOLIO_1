import { useEffect } from "react";

// Translation stays separate from the entrance timeline's transform.
export default function useMagnetic(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const media = matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let frame = 0;
    let x = 0, y = 0;
    const reset = () => { cancelAnimationFrame(frame); frame = 0; el.style.translate = "0px 0px"; };
    const move = e => {
      if (!media.matches) return;
      const rect = el.getBoundingClientRect();
      x = Math.max(-5, Math.min(5, (e.clientX - rect.left - rect.width / 2) * .07));
      y = Math.max(-4, Math.min(4, (e.clientY - rect.top - rect.height / 2) * .12));
      if (!frame) frame = requestAnimationFrame(() => { frame = 0; el.style.translate = `${x}px ${y}px`; });
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", reset);
    el.addEventListener("blur", reset);
    media.addEventListener("change", reset);
    return () => { reset(); el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", reset); el.removeEventListener("blur", reset); media.removeEventListener("change", reset); };
  }, [ref]);
}
