import React, { useEffect, useRef } from "react";
import useScrubVideo from "../../hooks/useScrubVideo";
import useMediaQuery from "../../hooks/useMediaQuery";
import { media } from "../../data/media";

export default function EditorialHero({ videoController }) {
  const video = useRef(null), section = useRef(null);
  const compact = useMediaQuery("(max-width: 699px)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const source = compact ? media.opening.mobileSrc : media.opening.src;
  useScrubVideo(video, videoController, source);
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const query = matchMedia("(min-width: 900px) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let frame = 0;
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    const fragments = el.querySelectorAll(".hero-fragment .fragment-surface");

    const update = () => {
      frame = 0;
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      el.style.setProperty("--pointer-x", `${currentX.toFixed(2)}px`);
      el.style.setProperty("--pointer-y", `${currentY.toFixed(2)}px`);

      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        frame = requestAnimationFrame(update);
      }
    };

    const move = (event) => {
      if (!query.matches) return;
      // Restrained 40-50% displacement: max ~14px
      targetX = (event.clientX / window.innerWidth - 0.5) * 14;
      targetY = (event.clientY / window.innerHeight - 0.5) * 11;

      // Subtle 3D tilt on individual boxes when hovering near them
      fragments.forEach((frag) => {
        const rect = frag.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distX = event.clientX - centerX;
        const distY = event.clientY - centerY;
        const dist = Math.hypot(distX, distY);

        if (dist < 260) {
          const power = 1 - dist / 260;
          const tiltX = (distY / 260) * -3.5 * power;
          const tiltY = (distX / 260) * 3.5 * power;
          frag.style.transform = `perspective(600px) rotateX(${tiltX.toFixed(1)}deg) rotateY(${tiltY.toFixed(1)}deg) translate(${currentX * 0.6}px, ${currentY * 0.6}px)`;
        } else {
          frag.style.transform = `translate(${currentX * 0.6}px, ${currentY * 0.6}px)`;
        }
      });

      if (!frame) frame = requestAnimationFrame(update);
    };

    const reset = () => {
      targetX = 0;
      targetY = 0;
      fragments.forEach((frag) => {
        frag.style.transform = "";
      });
      if (!frame) frame = requestAnimationFrame(update);
    };

    el.addEventListener("pointermove", move, { passive: true });
    el.addEventListener("pointerleave", reset);
    query.addEventListener("change", reset);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", reset);
      query.removeEventListener("change", reset);
    };
  }, []);
  return (
    <section ref={section} className="scene scene-hero editorial-hero" aria-label="Introduction — Sarthak Salvi">
      <div className="hero-copy">
        <p className="eyebrow hero-meta">INDEPENDENT MIND. CONNECTED DISCIPLINES.</p>
        <h1>Sarthak<br /><em>Salvi.</em></h1>
        <div className="hero-support">
          <p className="hero-tagline">A mind for building.<br /><em>An eye for the story.</em></p>
          <a className="text-link hero-link" href="#work">Selected work <span>↗</span></a>
        </div>
      </div>
      <div className="portrait-composition">
        <div className="hero-thought-chip" aria-hidden="true">
          <span className="thought-chip-dot" />
          <span>Dimaag mein 47 tabs khule hain.</span>
        </div>
        <div className="portrait-camera">
        <video ref={video} className="hero-portrait-video" src={source} poster={media.opening.poster}
          width="720" height="1280" preload={reduced ? "none" : "auto"} muted playsInline
          aria-label="Black-and-white portrait of Sarthak, animated by scrolling" disablePictureInPicture />
        </div>
        <span className="portrait-caption">A WORK IN PROGRESS, ALWAYS.</span>
      </div>
      <div className="hero-fragment fragment-code" aria-hidden="true">
        <div className="fragment-surface"><span className="fragment-label">01 / WEB DEVELOPMENT</span><code>const idea = curiosity;<br /><b>build</b>(somethingUseful);</code></div>
      </div>
      <div className="hero-fragment fragment-ui" aria-hidden="true">
        <div className="fragment-surface"><span className="fragment-label">02 / UI & UX</span><div className="wireframe"><i /><span /><b>↗</b></div><small>Clarity, by design.</small></div>
      </div>
      <div className="hero-fragment fragment-product" aria-hidden="true">
        <div className="fragment-surface"><div className="fragment-browser"><i /><i /><i /><span>splitzy.app</span></div><div className="fragment-product-body"><span className="fragment-label">SHARED EXPENSES</span><strong>Less math.<br /><em>More memories.</em></strong><div className="fragment-balance">Splitzy <span>↗</span></div></div></div>
      </div>
      <div className="hero-fragment fragment-data" aria-hidden="true">
        <div className="fragment-surface"><span className="fragment-label">03 / AI + DATA</span><span className="fragment-data-name">Trade Quest</span><svg viewBox="0 0 180 48"><path d="M1 43 25 30 49 37 75 17 100 25 132 6 154 12 179 1" /></svg></div>
      </div>
      <div className="hero-fragment fragment-timeline" aria-hidden="true">
        <div className="fragment-surface"><span className="fragment-label">04 / VIDEO EDITING</span><div className="mini-timeline"><i /><i /><i /><b /></div><small>Rhythm. Feeling. Story.</small></div>
      </div>
      <span className="creative-development">CREATIVE DEVELOPMENT <i>↗</i></span>
      <div className="hero-bottom"><span><i className="scroll-marker" /> SCROLL TO UNFOLD</span><span>MUMBAI, INDIA / AVAILABLE FOR IDEAS</span><span>01 — 09</span></div>
      <div className="hero-transition-quotes" aria-label="There's more to me than code. Some ideas are built. Others are brought to life.">
        <p className="transition-quote" aria-hidden="true">There's more to me<br /><em>than code.</em></p>
        <p className="transition-quote" aria-hidden="true">Some ideas<br /><em>are built.</em></p>
        <p className="transition-quote" aria-hidden="true">Others are<br /><em>brought to life.</em></p>
      </div>
    </section>
  );
}
