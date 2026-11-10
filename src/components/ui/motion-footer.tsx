"use client";

import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { personalInfo } from "../../data/portfolioData";
import useMagnetic from "../../hooks/useMagnetic";


gsap.registerPlugin(ScrollTrigger);

function MagneticLink({ children, className = "", ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const ref = useRef<HTMLAnchorElement>(null);
  useMagnetic(ref);
  return <a ref={ref} className={`footer-glass-pill magnetic ${className}`} {...props}>{children}</a>;
}

const disciplines = ["Code", "Design", "Motion", "Storytelling", "Always in progress"];

/** Portfolio adaptation of the supplied 21st.dev motion-footer reference. */
export function CinematicFooter() {
  const wrapper = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = wrapper.current!;
    const media = gsap.matchMedia();
    media.add("(min-width: 1025px) and (prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        gsap.fromTo(".footer-giant-text", { y: 65, scale: .9, opacity: 0 }, {
          y: 0, scale: 1, opacity: 1, ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom", scrub: true },
        });
        gsap.fromTo(".footer-reveal", { y: 26, opacity: 0 }, {
          y: 0, opacity: 1, stagger: .12, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", end: "top 20%", scrub: true },
        });
      }, el);
      return () => context.revert();
    });
    media.add("(max-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        gsap.fromTo(".footer-giant-text", { y: 30, opacity: 0 }, {
          y: 0, opacity: 0.35, ease: "none",
          scrollTrigger: { trigger: el, start: "top 95%", end: "top 60%", scrub: true },
        });
        gsap.fromTo(".footer-reveal", { y: 20, opacity: 0 }, {
          y: 0, opacity: 1, stagger: .08, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%", end: "top 50%", scrub: true },
        });
      }, el);
      return () => context.revert();
    });
    const observer = new IntersectionObserver(([entry]) => { el.dataset.visible = String(entry.isIntersecting); }, { threshold: 0 });
    observer.observe(el);
    const visibility = () => { el.dataset.sleeping = String(document.hidden); };
    document.addEventListener("visibilitychange", visibility);
    return () => { media.revert(); observer.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, []);

  return (
    <div className="motion-footer-shell" ref={wrapper} onFocusCapture={event => {
      // Keyboard users can reveal clipped links without navigating blind.
      if (event.target.matches(":focus-visible") && wrapper.current!.getBoundingClientRect().top > 1)
        wrapper.current!.scrollIntoView({ block: "end", behavior: "instant" });
    }}>
      <footer className="motion-footer" aria-label="Sarthak Salvi — footer">
        <div className="footer-aurora" aria-hidden="true" />
        <div className="footer-bg-grid" aria-hidden="true" />
        <div className="footer-giant-text" aria-hidden="true">
          s<span className="footer-name-art">&ldquo;ART&rdquo;</span>hak
        </div>

        <div className="footer-marquee" aria-hidden="true">
          <div className="footer-marquee-track">{[0, 1].map(copy => <div className="footer-marquee-group" key={copy}>
            {disciplines.map(word => <React.Fragment key={word}><span>{word}</span><i>✦</i></React.Fragment>)}
          </div>)}</div>
        </div>

        <div className="footer-center">
          <p className="eyebrow footer-reveal">THE NEXT GOOD IDEA STARTS WITH A CONVERSATION.</p>
          <h2 className="footer-text-glow footer-reveal">Let's build<br /><em>what's next.</em></h2>
          <div className="footer-links footer-reveal">
            <div className="footer-primary-links">
              <MagneticLink href={`mailto:${personalInfo.email}`}>Say hello <span aria-hidden="true">↗</span></MagneticLink>
              <MagneticLink href="#work">Explore the work <span aria-hidden="true">↗</span></MagneticLink>
            </div>
            <nav className="footer-secondary-links" aria-label="Footer links">
              <MagneticLink href={personalInfo.socials.github} target="_blank" rel="noreferrer">GitHub ↗</MagneticLink>
              <MagneticLink href={personalInfo.socials.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</MagneticLink>
              <MagneticLink href="#about">About me</MagneticLink>
            </nav>
          </div>
        </div>

        {/* Preserve the original credit-strip geometry: the story uses its height
            to calculate scroll distance. The curtain adds no story timing changes. */}
        <div className="site-footer motion-footer-credits">
          <a href="#hero" className="monogram" aria-label="Back to top">s<span>·</span>s</a>
          <p>© {new Date().getFullYear()} SARTHAK SALVI</p>
          <span>BUILT WITH INTENT. ALWAYS IN PROGRESS.</span>
          <a href="#hero">BACK TO TOP ↑</a>
        </div>
      </footer>
    </div>
  );
}

export default CinematicFooter;

