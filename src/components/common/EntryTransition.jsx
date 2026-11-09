import React, { lazy, Suspense, useEffect, useState } from "react";
import useMediaQuery from "../../hooks/useMediaQuery";

const LiquidShader = lazy(() => import("../ui/liquid-shader"));

export default function EntryTransition() {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.scrollTo(0, 0);
    }

    if (!visible || reduced) return;

    // Lock page scroll for the duration of the opening animation to ensure an unbroken 3.5s cinematic experience
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const dismiss = () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      setVisible(false);
    };

    // Full 3.5-second cinematic experience: 2.5s active display + 1.0s smooth dissolve
    const timer = window.setTimeout(dismiss, 3600);

    return () => {
      clearTimeout(timer);
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
    };
  }, [visible, reduced]);

  if (!visible || reduced) return null;

  return (
    <div className="entry-transition" aria-hidden="true">
      <Suspense fallback={null}>
        <LiquidShader monochrome disableCenterDimming timeScale={0.75} />
      </Suspense>
      <div className="entry-branding">
        <span className="entry-eyebrow">
          SARTHAK SALVI <i className="entry-dot" /> 2026
        </span>
        <span className="entry-monogram">s · s</span>
        <p className="entry-tagline">A mind for building. An eye for the story.</p>
      </div>
    </div>
  );
}
