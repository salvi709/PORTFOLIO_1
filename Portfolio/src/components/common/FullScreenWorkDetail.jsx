import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ProjectVisual from "./ProjectVisual";
import { projectMedia } from "../../data/media";
import { developmentProjects, videoProjects, galleryOrder } from "../../data/portfolioData";
import { generateCardPoster } from "../../data/wheelItems";

export default function FullScreenWorkDetail({ item, onClose, onSelectNext }) {
  const modalRef = useRef(null);
  const [mediaFailed, setMediaFailed] = useState(false);
  const p = item.data;
  const isDev = item.type === "dev";
  const asset = projectMedia[p.id];

  // Find index in overall gallery for Next / Previous cycling
  const currentIndex = galleryOrder.indexOf(p.id);
  const totalCount = galleryOrder.length;

  const navigateProject = (direction) => {
    const nextIdx = (currentIndex + direction + totalCount) % totalCount;
    const nextId = galleryOrder[nextIdx];
    const dev = developmentProjects.find((x) => x.id === nextId);
    const vid = videoProjects.find((x) => x.id === nextId);
    if (onSelectNext) {
      onSelectNext({
        type: dev ? "dev" : "video",
        data: dev || vid,
      });
    }
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") navigateProject(1);
      if (e.key === "ArrowLeft") navigateProject(-1);
    };

    window.addEventListener("keydown", handleKeyDown);
    if (modalRef.current) modalRef.current.scrollTop = 0;

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [p.id, onClose]);

  const accentColor = isDev ? "#8E7CFF" : "#FF725E";
  const posterSrc = asset?.image || generateCardPoster(p.id, p.title, p.category, accentColor);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="fullscreen-project-title"
      className="fixed inset-0 z-[99999] flex flex-col bg-charcoal-950/95 backdrop-blur-2xl text-offwhite overflow-hidden animate-fadeIn"
    >
      {/* Top Sticky HUD Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-charcoal-950/80 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-tech tracking-wider text-lavender-soft uppercase">
            <span
              className="inline-block size-2 rounded-full animate-pulse"
              style={{ backgroundColor: accentColor }}
            />
            {p.category}
          </span>
          <span className="text-xs font-tech text-offwhite-dim hidden sm:inline-block">
            {String(currentIndex + 1).padStart(2, "0")} / {String(totalCount).padStart(2, "0")}
          </span>
        </div>

        {/* Navigation & Close */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1 text-xs font-tech">
            <button
              onClick={() => navigateProject(-1)}
              className="px-2.5 py-1 rounded-full text-offwhite-dim hover:text-offwhite hover:bg-white/10 transition-colors"
              title="Previous project (←)"
            >
              ← Prev
            </button>
            <button
              onClick={() => navigateProject(1)}
              className="px-2.5 py-1 rounded-full text-offwhite-dim hover:text-offwhite hover:bg-white/10 transition-colors"
              title="Next project (→)"
            >
              Next →
            </button>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-2 rounded-full bg-lavender-electric/15 hover:bg-lavender-electric text-lavender-soft hover:text-charcoal-950 border border-lavender-electric/30 px-4 py-1.5 text-xs font-tech font-bold uppercase tracking-wider transition-all duration-300"
            aria-label="Close project details"
          >
            <span>Close</span>
            <span className="text-sm">✕</span>
          </button>
        </div>
      </header>

      {/* Scrollable Content Body */}
      <div
        ref={modalRef}
        className="flex-1 overflow-y-auto px-6 py-8 md:px-16 md:py-12 max-w-7xl mx-auto w-full space-y-12"
      >
        {/* Project Title & Hero Header */}
        <div className="space-y-4">
          <p className="font-tech text-xs tracking-widest text-coral uppercase">
            {isDev ? "TECHNICAL CASE STUDY" : "MOTION &amp; CINEMATIC STUDY"} // {p.year || "2026"}
          </p>
          <h1
            id="fullscreen-project-title"
            className="font-display font-black text-4xl sm:text-6xl md:text-7xl uppercase tracking-tight text-offwhite"
          >
            {p.title}
          </h1>
          <p className="font-accent text-2xl sm:text-3xl text-lavender-soft tracking-tight">
            {p.subtitle}
          </p>
        </div>

        {/* Media Player / Interactive Visual Stage */}
        <div className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden border border-white/15 bg-charcoal-900 shadow-2xl">
          {asset?.video && !mediaFailed ? (
            <video
              src={asset.video}
              poster={posterSrc}
              controls
              autoPlay
              muted
              playsInline
              className="size-full object-cover"
              onError={() => setMediaFailed(true)}
            />
          ) : asset?.image && !mediaFailed ? (
            <img
              src={asset.image}
              alt={p.title}
              className="size-full object-cover"
              onError={() => setMediaFailed(true)}
            />
          ) : (
            <div className="size-full relative flex items-center justify-center">
              <img
                src={posterSrc}
                alt={p.title}
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
                <span className="px-3 py-1 rounded bg-black/80 backdrop-blur-md border border-white/20 text-xs font-tech text-lavender-soft">
                  {asset?.image || asset?.video ? "MEDIA LOADED" : "CONCEPT PREVIEW / ARTWORK"}
                </span>
                <span className="text-xs font-tech text-offwhite-dim">
                  SARTHAK SALVI // {p.year || "2026"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Links Bar */}
        {(p.links?.github || p.links?.demo) && (
          <div className="flex flex-wrap items-center gap-4 pt-2">
            {p.links?.demo && (
              <a
                href={p.links.demo}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl bg-lavender-electric text-charcoal-950 px-6 py-3 font-tech text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-lavender-electric/20"
              >
                <span>Live Interactive Demo</span>
                <span>↗</span>
              </a>
            )}
            {p.links?.github && (
              <a
                href={p.links.github}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 text-offwhite border border-white/15 px-6 py-3 font-tech text-sm font-bold transition-all"
              >
                <span>View GitHub Repository</span>
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>
            )}
          </div>
        )}

        {/* In-Depth Case Study & Technical Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-4 border-t border-white/10">
          {/* Main Case Study Columns (2 cols) */}
          <div className="lg:col-span-2 space-y-10">
            {/* Overview */}
            <div className="space-y-4">
              <h3 className="font-display font-bold text-2xl uppercase tracking-wider text-offwhite flex items-center gap-3">
                <span className="size-2 bg-lavender-electric rounded-full" />
                The Overview &amp; Vision
              </h3>
              <p className="font-sans text-offwhite-dim text-base sm:text-lg leading-relaxed">
                {p.overview || p.description}
              </p>
            </div>

            {/* Highlights */}
            {p.highlights && (
              <div className="space-y-4">
                <h3 className="font-display font-bold text-2xl uppercase tracking-wider text-offwhite flex items-center gap-3">
                  <span className="size-2 bg-coral rounded-full" />
                  Key Highlights &amp; Capabilities
                </h3>
                <ul className="space-y-3">
                  {p.highlights.map((highlight, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10 text-offwhite-dim leading-relaxed"
                    >
                      <span className="font-tech text-lavender-electric text-xs mt-1">
                        [{String(i + 1).padStart(2, "0")}]
                      </span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Architecture / Pipeline */}
            {p.architecture && (
              <div className="space-y-4">
                <h3 className="font-display font-bold text-2xl uppercase tracking-wider text-offwhite flex items-center gap-3">
                  <span className="size-2 bg-lavender-soft rounded-full" />
                  {isDev ? "System Architecture & Engineering" : "Creative Direction & Post-Production"}
                </h3>
                <div className="p-5 rounded-xl bg-charcoal-900 border border-white/10 text-offwhite-dim leading-relaxed font-sans">
                  {p.architecture}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Metadata (1 col) */}
          <div className="space-y-8 bg-white/[0.02] border border-white/10 p-6 rounded-2xl h-fit">
            <div>
              <span className="block font-tech text-xs text-offwhite-dim uppercase tracking-widest mb-1">
                Role / Discipline
              </span>
              <p className="font-sans font-semibold text-offwhite text-base">
                {p.role || (isDev ? "Developer" : "Video Editor")}
              </p>
            </div>

            <div>
              <span className="block font-tech text-xs text-offwhite-dim uppercase tracking-widest mb-1">
                Project Status
              </span>
              <p className="font-sans font-semibold text-offwhite text-base">
                {p.status || "Active Production"}
              </p>
            </div>

            <div>
              <span className="block font-tech text-xs text-offwhite-dim uppercase tracking-widest mb-1">
                Timeline / Year
              </span>
              <p className="font-tech text-lavender-soft text-sm">
                {p.year || "2025–2026"}
              </p>
            </div>

            <div>
              <span className="block font-tech text-xs text-offwhite-dim uppercase tracking-widest mb-2">
                Tech Stack &amp; Tools
              </span>
              <div className="flex flex-wrap gap-2">
                {p.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-tech text-offwhite tracking-wide"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <span className="block font-tech text-xs text-offwhite-dim uppercase tracking-widest mb-3">
                Quick Project Switcher
              </span>
              <div className="grid grid-cols-2 gap-2">
                {galleryOrder.map((id, idx) => {
                  const itemDev = developmentProjects.find((x) => x.id === id);
                  const itemVid = videoProjects.find((x) => x.id === id);
                  const curr = itemDev || itemVid;
                  const isCurrent = curr.id === p.id;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        if (onSelectNext) {
                          onSelectNext({
                            type: itemDev ? "dev" : "video",
                            data: curr,
                          });
                        }
                      }}
                      className={`text-left p-2 rounded-lg text-xs font-tech border transition-all ${
                        isCurrent
                          ? "bg-lavender-electric/20 border-lavender-electric text-offwhite font-bold"
                          : "bg-white/5 border-white/10 text-offwhite-dim hover:text-offwhite hover:bg-white/10"
                      }`}
                    >
                      <span className="block text-[10px] text-coral opacity-80">{String(idx + 1).padStart(2, "0")}</span>
                      <span className="truncate block">{curr.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Back CTA */}
        <div className="pt-8 border-t border-white/10 flex items-center justify-between">
          <p className="font-accent text-xl text-offwhite-dim">
            Sarthak Salvi <em>// Code × Design × Motion</em>
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-offwhite font-tech text-xs uppercase tracking-wider transition-all"
          >
            ← Back to Selected Work
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
