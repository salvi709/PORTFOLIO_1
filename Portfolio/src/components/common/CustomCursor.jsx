import React, { useEffect, useRef } from "react";
import { useCursor } from "../../context/CursorContext";
import useMediaQuery from "../../hooks/useMediaQuery";
export default function CustomCursor() {
  const ref = useRef(null),
    { cursorType, cursorText } = useCursor();
  const enabled = useMediaQuery(
    "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
  );
  useEffect(() => {
    if (!enabled) return;
    let frame = 0,
      x = 0,
      y = 0;
    const move = (e) => {
      x = e.clientX;
      y = e.clientY;
      if (ref.current) ref.current.dataset.link = String(Boolean(e.target.closest("a,button")));
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          if (ref.current) {
            ref.current.style.transform =
              "translate3d(" + x + "px," + y + "px,0)";
            ref.current.style.opacity = "1";
          }
        });
    };
    const leave = () => {
      if (ref.current) ref.current.style.opacity = "0";
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, [enabled]);
  return enabled ? (
    <div
      ref={ref}
      className={"custom-cursor cursor-" + cursorType}
      aria-hidden="true"
    >
      <span>
        {cursorType === "view" || cursorType === "play"
          ? cursorText || cursorType.toUpperCase()
          : ""}
      </span>
    </div>
  ) : null;
}

