import React, { useRef } from "react";
import TextWriter from "../common/TextWriter";

import useMagnetic from "../../hooks/useMagnetic";
export default function SceneHero() {
  const link = useRef(null);
  useMagnetic(link);
  return (
    <section className="scene scene-hero" aria-label="Introduction">
      <div className="hero-copy">
        <p className="eyebrow hero-meta">
          <span>A PERSONAL WORLD // SARTHAK SALVI</span>
        </p>
        <h1 aria-label="Sarthak Salvi">
          {["SARTHAK", "SALVI"].map((word) => (
            <span className="title-mask" key={word}>
              <span className="title-line" aria-hidden="true">
                {word}
              </span>
            </span>
          ))}
        </h1>
        <div className="hero-support">
        <p className="hero-tagline">
          <span>A mind for building.</span>
          <br />
          <TextWriter
            text="An eye for the story."
            speed={35}
            delay={3150}
            tag="em"
            className="font-accent text-lavender-soft"
          />
        </p>
        <p className="hero-disciplines">
          DEVELOPMENT &amp; AI <span>/</span> DESIGN &amp; MOTION
        </p>
        <a ref={link} className="text-link hero-link magnetic" href="#work">
          Explore my work <span>↗</span>
        </a>
        </div>
      </div>
      <div className="hero-bottom">
        <span>
          <i className="scroll-marker" aria-hidden="true" /> SCROLL TO EXPLORE
        </span>
        <span>INDEPENDENT MIND. CONNECTED DISCIPLINES.</span>
        <span>01 — 04</span>
      </div>
    </section>
  );
}

