import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
export default function useSectionReveal(ref, selector, refreshKey = null) {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      ref.current.querySelectorAll(selector).forEach((el, i) => gsap.from(el, {
        y: 24, opacity: 0, duration: .8, delay: Math.min(i * .025, .1), ease: "power3.out",
        ...(el.classList.contains("work-cover") ? { clipPath: "inset(0 0 18% 0)" } : {}),
        scrollTrigger: { trigger: el, start: "top 94%", once: true },
      }));
    });
    return () => mm.revert();
  }, [ref, selector, refreshKey]);
}
