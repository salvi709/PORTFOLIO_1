import React, { useEffect, useRef, useState } from "react";
import { media } from "../../data/media";
import useMediaQuery from "../../hooks/useMediaQuery";
export default function AtmosphericBackground() {
  const video = useRef(null);
  const [playing, setPlaying] = useState(false);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  useEffect(() => {
    const el = video.current;
    if (!el || reduced) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !document.hidden)
        el.play().catch(() => setPlaying(false));
      else el.pause();
    });
    observer.observe(el);
    const visibility = () => {
      if (document.hidden) el.pause();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      el.pause();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [reduced]);
  return (
    <div className="atmosphere" aria-hidden="true">
      <svg
        className="moon-world"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="moonTone">
            <stop stopColor="#e5e1ed" />
            <stop offset=".65" stopColor="#c8c5d0" />
            <stop offset="1" stopColor="#88818f" />
          </radialGradient>
          <filter id="lunarSurface">
            <feTurbulence
              type="fractalNoise"
              baseFrequency=".035"
              numOctaves="4"
              seed="12"
            />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" mode="multiply" />
          </filter>
          <clipPath id="moonClip">
            <circle cx="1080" cy="340" r="172" />
          </clipPath>
          <filter id="cloudSoft">
            <feTurbulence baseFrequency=".007 .018" numOctaves="3" seed="8" />
            <feDisplacementMap in="SourceGraphic" scale="100" />
            <feGaussianBlur stdDeviation="15" />
          </filter>
          <linearGradient id="cloudTone" x2="0" y2="1">
            <stop stopColor="#14141A" />
            <stop offset="1" stopColor="#07070A" />
          </linearGradient>
        </defs>
        <g className="moon">
          <circle cx="1080" cy="340" r="173" fill="url(#moonTone)" />
          <g clipPath="url(#moonClip)" opacity=".38">
            <circle
              cx="1080"
              cy="340"
              r="172"
              fill="#d2d0d7"
              filter="url(#lunarSurface)"
            />
          </g>
        </g>
        <g
          className="cloud cloud-back"
          fill="url(#cloudTone)"
          filter="url(#cloudSoft)"
          opacity=".82"
        >
          <ellipse cx="900" cy="200" rx="430" ry="62" />
          <ellipse cx="1350" cy="415" rx="370" ry="64" />
        </g>
        <g
          className="cloud cloud-front"
          fill="#0B0B10"
          filter="url(#cloudSoft)"
          opacity=".88"
        >
          <ellipse cx="1050" cy="405" rx="290" ry="19" />
          <ellipse cx="1250" cy="275" rx="280" ry="14" />
          <ellipse cx="770" cy="560" rx="720" ry="90" />
        </g>
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            className={`bat bat-${i}`}
            d="M0 0 Q-14 -18 -28 -9 Q-15 -9 -12 1 Q-7 -4 0 4 Q7 -4 12 1 Q15 -9 28 -9 Q14 -18 0 0"
            fill="#050508"
            transform={`translate(${1000 + i * 105} ${265 + i * 58}) scale(${0.65 + i * 0.17})`}
          />
        ))}
      </svg>
      {media.opening.poster && (
        <img className="opening-poster" src={media.opening.poster} alt="" />
      )}
      {media.opening.src && !reduced && (
        <video
          ref={video}
          className={`opening-video ${playing ? "is-playing" : ""}`}
          src={media.opening.src}
          poster={media.opening.poster || undefined}
          autoPlay
          muted
          playsInline
          preload="metadata"
          onPlaying={() => setPlaying(true)}
          onError={() => setPlaying(false)}
        />
      )}
      <div className="atmosphere-shade" />
    </div>
  );
}
