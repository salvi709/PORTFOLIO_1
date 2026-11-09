import React, { useEffect, useLayoutEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { developmentProjects, videoProjects, galleryOrder } from "../../data/portfolioData";
import { projectMedia } from "../../data/media";
import { generateCardPoster } from "../../data/wheelItems";
import { useCursor } from "../../context/CursorContext";
import useMediaQuery from "../../hooks/useMediaQuery";
import useSectionReveal from "../../hooks/useSectionReveal";
import SectionHeader from "../common/SectionHeader";
import WorkDialog from "../common/WorkDialog";
import WorksWheel from "@/components/ui/works-wheel";

gsap.registerPlugin(ScrollTrigger);
const cinematicQuery = "(min-width: 1025px) and (prefers-reduced-motion: no-preference)";

export default function SelectedWork({ embedded = false, controller, progressSource: externalProgress, onNavigate }) {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const localController = useRef(null);
  const wheelUpdate = controller || localController;
  const localProgress = useRef(0);
  const progressSource = externalProgress || localProgress;
  const trigger = useRef(null);
  const [selected, setSelected] = useState(null);
  const cinematic = useMediaQuery(cinematicQuery);
  useSectionReveal(sectionRef, ".work-cover", cinematic);
  const { setCursor, resetCursor } = useCursor();
  const items = useMemo(() => galleryOrder.map(id => {
    const dev = developmentProjects.find(p => p.id === id);
    const data = dev || videoProjects.find(p => p.id === id);
    const type = dev ? "dev" : "video";
    const fallback = generateCardPoster(id, data.title, data.category);
    return {
      id, data, type, title: data.title, category: data.category, fallback,
      image: projectMedia[id]?.image || fallback,
      onClick: () => { resetCursor(); setSelected({ type, data }); },
    };
  }), [resetCursor]);

  useLayoutEffect(() => {
    if (!cinematic || embedded) return;
    const context = gsap.context(() => {
      trigger.current = ScrollTrigger.create({
        id: "portfolio-gallery", trigger: sectionRef.current, pin: stageRef.current,
        start: "top top", end: () => `+=${items.length * Math.max(260, window.innerHeight * .50)}`,
        invalidateOnRefresh: true,
        onUpdate: self => { progressSource.current = self.progress; wheelUpdate.current?.(self.progress); },
        onRefresh: self => { progressSource.current = self.progress; wheelUpdate.current?.(self.progress); },
      });
    }, sectionRef);
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => { cancelAnimationFrame(frame); context.revert(); trigger.current = null; };
  }, [cinematic, embedded, items.length, wheelUpdate, progressSource]);

  useEffect(() => {
    const showEdits = () => {
      if (embedded && onNavigate) { onNavigate(items.findIndex(item => item.type === "video")); return; }
      if (trigger.current) {
        const firstVideo = items.findIndex(item => item.type === "video");
        trigger.current.scroll(trigger.current.start + (trigger.current.end - trigger.current.start) * (firstVideo + 1) / (items.length + .3));
      } else document.getElementById("edits")?.scrollIntoView({ block: "start" });
    };
    window.addEventListener("show-edits", showEdits);
    return () => window.removeEventListener("show-edits", showEdits);
  }, [items, embedded, onNavigate]);

  return (
    <section id="work" ref={sectionRef} data-embedded={embedded} className={`selected-work ${cinematic ? "wheel-mode" : "list-mode"} ${embedded ? "embedded-work" : ""}`}>
      <div ref={stageRef} className="work-stage">
        <div className="work-heading">
          <SectionHeader animate={!cinematic} number="01" category="SELECTED PROJECTS & EXPERIMENTS" title="OFF THE PAGE." accentWord="Ideas are much easier to explain once they exist." />
          <span className="work-count">BUILD × CREATE <i /> 07 SELECTED PIECES <span className="work-evidence-badge">Evidence that I actually finish things.</span></span>
        </div>
        {cinematic ? (
          <div className="wheel-viewport">
            <WorksWheel items={items} controller={wheelUpdate} progressSource={progressSource} label="SELECTED WORK" action="Details ↗"
              onCardPointerEnter={item => setCursor(item.type === "dev" ? "view" : "play", item.type === "dev" ? "VIEW" : "PLAY")}
              onCardPointerLeave={resetCursor} />
          </div>
        ) : (
          <div className="work-list">
            {items.map((item, i) => (
              <button key={item.id} id={i === 1 ? "edits" : undefined} className="work-list-card" onClick={item.onClick}>
                <div className="work-cover"><img src={item.image} alt="" loading="lazy" width="720" height="500" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = item.fallback; }} /><span>Explore project ↗</span></div>
                <div className="work-caption"><span className="work-index">0{i + 1}</span><div><p>{item.category}</p><h3>{item.title}</h3></div><span aria-hidden="true">↗</span></div>
              </button>
            ))}
          </div>
        )}
        <div className="work-footnote"><span>01 / BUILD × CREATE</span><span>{cinematic ? "Scroll to browse · Select a project to explore" : "Seven projects. Two sides of the same mind."}</span><span>2026</span></div>
      </div>
      {selected && <WorkDialog item={selected} onClose={() => setSelected(null)} onSelectNext={setSelected} />}
    </section>
  );
}
