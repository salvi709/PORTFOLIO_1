import { useLayoutEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Dynamic reading content moves the footer and reveal triggers, not story timing.
export default function useContentRefresh(ref) {
  useLayoutEffect(() => {
    let timer;
    const observer = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => ScrollTrigger.refresh(), 120);
    });
    observer.observe(ref.current);
    return () => { observer.disconnect(); clearTimeout(timer); };
  }, [ref]);
}
