import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { projectMedia } from "../../data/media";
import { developmentProjects, videoProjects, galleryOrder } from "../../data/portfolioData";
import { generateCardPoster } from "../../data/wheelItems";

export default function ProjectPreviewModal({ item, onClose, onSelectNext }) {
  const modalContainerRef = useRef(null);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const closeCallback = useRef(onClose);
  closeCallback.current = onClose;
  const closing = useRef(false);
  const close = () => {
    if (closing.current) return;
    closing.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) closeCallback.current();
    else gsap.to(modalContainerRef.current, { opacity: 0, y: 14, scale: .985, duration: .22, ease: "power2.in", onComplete: () => closeCallback.current() });
  };
  const [mediaFailed, setMediaFailed] = useState(false);
  const p = item.data;
  const isDev = item.type === "dev";
  const asset = projectMedia[p.id];

  // Find index in galleryOrder
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

  useLayoutEffect(() => {
    const opener = document.activeElement;
    const rect = opener?.getBoundingClientRect();
    const dialog = dialogRef.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    closeRef.current?.focus({ preventScroll: true });
    const context = gsap.context(() => {
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.from(modalContainerRef.current, {
          x: rect ? Math.max(-180, Math.min(180, rect.x + rect.width / 2 - innerWidth / 2)) : 0,
          y: rect ? Math.max(-100, Math.min(100, rect.y + rect.height / 2 - innerHeight / 2)) : 20,
          scale: .93, opacity: 0, duration: .5, ease: "power3.out", clearProps: "transform,opacity",
        });
      }
    }, dialog);
    return () => {
      context.revert();
      gsap.killTweensOf(modalContainerRef.current);
      dialog.close();
      document.body.style.overflow = overflow;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    setMediaFailed(false);
    modalContainerRef.current.scrollTop = 0;
    const context = gsap.context(() => {
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        gsap.from(".preview-details > *", { opacity: 0, y: 12, duration: .45, delay: .15, stagger: .07, ease: "power2.out" });
    }, dialogRef);
    return () => context.revert();
  }, [p.id]);

  const accentColor = "#315BDB";
  const fallbackPoster = generateCardPoster(p.id, p.title, p.category, accentColor);
  const posterSrc = mediaFailed ? fallbackPoster : asset?.image || fallbackPoster;

  const hasGithub = p.links?.github && p.links.github.trim() !== "" && p.links.github !== "#";
  const hasDemo = p.links?.demo && p.links.demo.trim() !== "" && p.links.demo !== "#";

  return createPortal(
    <dialog
      ref={dialogRef}
      onCancel={e => { e.preventDefault(); close(); }}
      onKeyDown={e => {
        if (e.key === "Tab") {
          const controls = [...dialogRef.current.querySelectorAll('button:not(:disabled),a[href],video[controls],input,select,textarea,[tabindex="0"]')].filter(el => el.getClientRects().length);
          const first = controls[0], last = controls[controls.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
          if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
        }
        if (e.target.closest("video,input,textarea,select")) return;
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); navigateProject(e.key === "ArrowRight" ? 1 : -1); }
      }}
      aria-labelledby="preview-modal-title"
      className="project-dialog"
      onClick={(e) => {
        // Click outside container to close
        if (e.target === e.currentTarget) {
          close();
        }
      }}
    >
      {/* Modal Container Box (70–90% viewport) */}
      <div
        ref={modalContainerRef}
        className="relative w-full max-w-5xl max-h-[88dvh] bg-charcoal-900/95 border border-white/15 rounded-lg shadow-2xl overflow-y-auto flex flex-col text-offwhite"
      >
        {/* Sticky Modal Top Bar */}
        <div className="preview-toolbar sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-charcoal-900/90 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
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

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="preview-navigation flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1 text-xs font-tech">
              <button
                type="button"
                onClick={() => navigateProject(-1)}
                className="px-2.5 py-0.5 rounded-full text-offwhite-dim hover:text-offwhite hover:bg-white/10 transition-colors"
                title="Previous project (←)"
              >
                ← Prev
              </button>
              <button
                type="button"
                onClick={() => navigateProject(1)}
                className="px-2.5 py-0.5 rounded-full text-offwhite-dim hover:text-offwhite hover:bg-white/10 transition-colors"
                title="Next project (→)"
              >
                Next →
              </button>
            </div>

            <button
              type="button"
              ref={closeRef}
              onClick={close}
              className="flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-lavender-electric text-offwhite hover:text-charcoal-950 border border-white/15 px-3.5 py-1.5 text-xs font-tech font-bold uppercase tracking-wider transition-all duration-200"
              aria-label="Close project preview"
            >
              <span>Close</span>
              <span className="text-base leading-none">×</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="preview-details p-5 sm:p-8 md:p-10 space-y-8">
          {/* Header Title Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-tech text-lavender-soft tracking-widest uppercase">
              <span>{isDev ? "DEVELOPMENT & AI PROJECT" : "MOTION & VIDEO PROJECT"}</span>
              <span>{p.year || "2026"}</span>
            </div>
            <h2
              id="preview-modal-title"
              className="font-display font-normal text-3xl sm:text-5xl uppercase tracking-tight text-offwhite"
            >
              {p.title}
            </h2>
            <p className="font-accent text-xl sm:text-2xl text-lavender-soft">
              {p.subtitle}
            </p>
          </div>

          {/* Large Project Visual Stage (16:9 / widescreen) */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/15 bg-charcoal-950 shadow-inner">
            {asset?.video && !mediaFailed ? (
              <video
                src={asset.video}
                poster={posterSrc}
                controls
                playsInline
                preload="metadata"
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
              <div className="size-full relative flex items-center justify-center bg-charcoal-950">
                <img
                  src={posterSrc}
                  alt={p.title}
                  className="size-full object-contain opacity-90"
                />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <span className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-white/15 text-[11px] font-tech text-lavender-soft">
                    {asset?.image || asset?.video ? "PROJECT VISUAL" : "CONCEPT PREVIEW"}
                  </span>
                  <span className="text-[11px] font-tech text-offwhite-dim">
                    SARTHAK SALVI // {p.year || "2026"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Links (Only rendered when non-empty links exist) */}
          {(hasDemo || hasGithub) && (
            <div className="flex flex-wrap items-center gap-3">
              {hasDemo && (
                <a
                  href={p.links.demo}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-lavender-electric text-charcoal-950 px-5 py-2.5 font-tech text-xs font-bold hover:brightness-110 transition-all shadow-md shadow-lavender-electric/20"
                >
                  <span>Live Interactive Demo</span>
                  <span>↗</span>
                </a>
              )}
              {hasGithub && (
                <a
                  href={p.links.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 text-offwhite border border-white/15 px-5 py-2.5 font-tech text-xs font-bold transition-all"
                >
                  <span>View GitHub Repository</span>
                  <svg className="size-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                </a>
              )}
            </div>
          )}

          {/* Overview & Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 border-t border-white/10">
            {/* Description & Highlights */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="font-body font-normal text-lg uppercase tracking-wider text-offwhite mb-2">
                  Overview
                </h3>
                <p className="font-sans text-offwhite-dim text-sm sm:text-base leading-relaxed">
                  {p.overview || p.description}
                </p>
              </div>

              {p.highlights && p.highlights.length > 0 && (
                <div>
                  <h3 className="font-body font-normal text-lg uppercase tracking-wider text-offwhite mb-3">
                    {isDev ? "Key Capabilities" : "Creative & Motion Highlights"}
                  </h3>
                  <ul className="space-y-2.5">
                    {p.highlights.map((highlight, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 p-3 rounded-lg bg-white/[0.03] border border-white/10 text-offwhite-dim text-xs sm:text-sm leading-relaxed"
                      >
                        <span className="font-tech text-lavender-electric text-xs mt-0.5">
                          ✦
                        </span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {p.architecture && (
                <div>
                  <h3 className="font-body font-normal text-lg uppercase tracking-wider text-offwhite mb-2">
                    {isDev ? "Architecture & Stack" : "Editing Workflow"}
                  </h3>
                  <p className="font-sans text-offwhite-dim text-xs sm:text-sm leading-relaxed p-3.5 rounded-lg bg-white/[0.02] border border-white/10">
                    {p.architecture}
                  </p>
                </div>
              )}
            </div>

            {/* Metadata Sidebar */}
            <div className="space-y-5 bg-white/[0.02] border border-white/10 p-5 rounded-xl h-fit text-xs font-tech">
              <div>
                <span className="text-offwhite-dim uppercase tracking-widest block mb-1">
                  Role
                </span>
                <span className="font-sans font-semibold text-offwhite text-sm">
                  {p.role || (isDev ? "Developer & Designer" : "Video Editor")}
                </span>
              </div>

              <div>
                <span className="text-offwhite-dim uppercase tracking-widest block mb-1">
                  Status
                </span>
                <span className="font-sans text-offwhite font-medium">
                  {p.status || "Active Project"}
                </span>
              </div>

              <div>
                <span className="text-offwhite-dim uppercase tracking-widest block mb-1">
                  Year
                </span>
                <span className="text-lavender-soft">
                  {p.year || "2026"}
                </span>
              </div>

              <div>
                <span className="text-offwhite-dim uppercase tracking-widest block mb-2">
                  Tools &amp; Technologies
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[11px] text-offwhite"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
