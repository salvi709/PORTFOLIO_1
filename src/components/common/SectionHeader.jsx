import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export default function SectionHeader({ number, category, title, accentWord, animate = true }) {
  const ref = useRef(null);
  const shortAccent = accentWord && accentWord.length < 15;
  useLayoutEffect(() => {
    if (!animate) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const words = ref.current.querySelectorAll(".heading-word > span");
      const timeline = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: "top 91%", once: true } });
      timeline.from(words, { yPercent: 105, rotate: number === "02" ? 2 : 0, duration: .85, stagger: .075, ease: "power3.out" });
      const subtitle = ref.current.querySelector(".section-subtitle");
      if (subtitle) timeline.from(subtitle, { opacity: 0, y: 10, duration: .6, ease: "power2.out" }, .35);
    });
    return () => mm.revert();
  }, [number, animate]);
  return (
    <div ref={ref} className="section-heading">
      <p className="eyebrow"><span>{number} /</span> {category}</p>
      <h2 aria-label={`${title}${shortAccent ? ` ${accentWord}` : ""}`}>
        {title.split(" ").map((word, i) => <React.Fragment key={i}>{i > 0 && " "}<span className="heading-word" aria-hidden="true"><span>{word}</span></span></React.Fragment>)}
        {shortAccent && <> <em className="heading-word" aria-hidden="true"><span>{accentWord}</span></em></>}
      </h2>
      {accentWord && !shortAccent && <p className="section-subtitle">{accentWord}</p>}
    </div>
  );
}
