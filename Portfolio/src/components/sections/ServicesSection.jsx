import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionHeader from "../common/SectionHeader";
import { Code2, Palette, Video, Sparkles, ArrowUpRight, ArrowDown } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export const services = [
  {
    num: "01",
    shortTitle: "Websites",
    categoryLabel: "01 / WEB ARCHITECTURE",
    name: "Websites & Web Experiences",
    desc: "Landing pages, personal portfolios, business websites and interactive web applications.",
    icon: Code2,
    tags: ["Landing Pages", "Personal Portfolios", "Business Websites", "Interactive Web Apps"],
    highlight: "Bespoke digital architecture built for maximum visual impact, sub-second load times, and fluid interactions.",
  },
  {
    num: "02",
    shortTitle: "UI/UX",
    categoryLabel: "02 / INTERFACE DESIGN",
    name: "UI/UX & Interface Design",
    desc: "Website interfaces, dashboards, wireframes and interactive prototypes.",
    icon: Palette,
    tags: ["Website Interfaces", "Dashboards", "Wireframes", "Interactive Prototypes"],
    highlight: "Pixel-perfect visual hierarchy, dark-mode design systems, and user-centric wireframes that convert.",
  },
  {
    num: "03",
    shortTitle: "Video",
    categoryLabel: "03 / MOTION & PACING",
    name: "Video & Visual Storytelling",
    desc: "Cinematic editing, promotional videos, short-form content and motion graphics.",
    icon: Video,
    tags: ["Cinematic Editing", "Promotional Videos", "Short-Form Content", "Motion Graphics"],
    highlight: "Narrative pacing, dynamic motion design, and high-production visual editing that commands audience attention.",
  },
  {
    num: "04",
    shortTitle: "AI & Data",
    categoryLabel: "04 / INTELLIGENT SYSTEMS",
    name: "AI & Data-driven Experiences",
    desc: "AI-powered prototypes, intelligent applications and data visualization dashboards.",
    icon: Sparkles,
    tags: ["AI Prototypes", "Intelligent Applications", "Data Dashboards", "Autonomous Agents"],
    highlight: "Autonomous agents, predictive analytics dashboards, and custom AI tools engineered for real-world utility.",
  },
];

// #region 3D Tumble Physics (from 21st.dev template adapted for finite 4 cards)
export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

export function fallAngle(t) {
  const u = clamp01(t);
  const land = 0.78;
  if (u <= land) {
    const k = u / land;
    return -90 * k * k * k;
  }
  const k = (u - land) / (1 - land);
  return -90 + 6 * Math.sin(Math.PI * k) * (1 - k);
}

export function deckAdvance(pos) {
  const i = Math.floor(pos);
  const f = pos - i;
  const k = clamp01((f - 0.28) / 0.6);
  return i + k * k * (3 - 2 * k);
}

export function cardPose(k, pos, depth = 4) {
  const t = pos - k;
  const lift = (k - Math.floor(pos) + 3) * 0.6;
  if (t >= 1) {
    // Card has fallen flat forward onto floor
    const floorProgress = t - 1;
    return {
      angle: -90,
      z: 0,
      lift,
      opacity: floorProgress < 1.2 ? Math.max(0, 1 - floorProgress * 0.7) : 0,
      flat: true,
    };
  }
  if (t > 0) {
    // Card is currently tumbling forward on its bottom hinge
    return {
      angle: fallAngle(t),
      z: 0,
      lift,
      opacity: 1,
      flat: false,
    };
  }
  // Card is upright standing in the deck (pos <= k)
  const rel = k - deckAdvance(pos);
  const opacity = clamp01(depth + 1 - rel);
  return {
    angle: 0,
    z: -Math.max(rel, 0),
    lift: 0,
    opacity,
    flat: false,
  };
}
// #endregion

export default function ServicesSection() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const sceneRef = useRef(null);
  const cardRefs = useRef([]);
  const [activeCard, setActiveCard] = useState(0);
  const stateRef = useRef({ pos: 0 });
  const geoRef = useRef({ h: 360, gap: 90 });

  const paint = useCallback((pos) => {
    stateRef.current.pos = pos;
    const { gap } = geoRef.current;
    cardRefs.current.forEach((el, k) => {
      if (!el) return;
      const p = cardPose(k, pos, 4);
      el.style.transform = `translate3d(0, ${-p.lift}px, ${p.z * gap}px) rotateX(${p.angle}deg)`;
      el.style.opacity = String(p.opacity);
      el.style.visibility = p.opacity > 0.01 ? "visible" : "hidden";
      const shade = p.flat ? 0.18 : (-p.angle / 90) * 0.18;
      el.style.setProperty("--td-shade", String(shade));
    });
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const scene = sceneRef.current;
    if (!section || !stage || !scene) return;

    // Responsive geometric fitting
    const fit = () => {
      const W0 = stage.clientWidth;
      const H0 = stage.clientHeight;
      const wFrac = W0 < 480 ? 0.92 : W0 < 768 ? 0.86 : W0 < 1024 ? 0.75 : 0.62;
      const aspect = W0 < 600 ? 1.55 : 1.88;
      const h = Math.max(220, Math.min((W0 * wFrac) / aspect, H0 * 0.44, 430));
      const w = h * aspect;
      const top = Math.max(130, H0 / 2 - 0.5 * h);
      geoRef.current = { h, gap: 0.28 * h };
      scene.style.perspective = `${6 * h}px`;
      scene.style.perspectiveOrigin = `50% ${top - 1.5 * h}px`;
      stage.style.setProperty("--td-w", `${w}px`);
      stage.style.setProperty("--td-h", `${h}px`);
      stage.style.setProperty("--td-top", `${top}px`);
      paint(stateRef.current.pos);
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(stage);

    const posObj = { pos: 0 };
    const ctx = gsap.context(() => {
      // Finite scroll scrub pinned strictly for the 4 service cards
      const tl = gsap.timeline({
        scrollTrigger: {
          id: "services-scroll-deck",
          trigger: section,
          pin: stage,
          start: "top top",
          end: () => `+=${Math.max(window.innerHeight * 2.3, 1600)}`,
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const currentCard = Math.min(3, Math.max(0, Math.round(self.progress * 3.0)));
            setActiveCard(currentCard);
          },
        },
      });

      tl.to(posObj, {
        pos: 3.0,
        ease: "none",
        duration: 3.0,
        onUpdate: () => {
          paint(posObj.pos);
        },
      });
    }, section);

    return () => {
      ro.disconnect();
      ctx.revert();
    };
  }, [paint]);

  // Smooth scroll to card when clicking navigation pills or card affordance
  const scrollToCard = (index) => {
    const st = ScrollTrigger.getById("services-scroll-deck");
    if (!st) return;
    const targetProgress = Math.min(1, Math.max(0, index / 3.0));
    const targetY = st.start + (st.end - st.start) * targetProgress;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} id="services" className="services-section">
      <div ref={stageRef} className="services-stage">
        {/* Section Header with exact prompt requirements */}
        <div className="services-header-wrap">
          <SectionHeader
            number="05"
            category="WHAT I CAN BUILD FOR YOU / SERVICES"
            title="FOUR THINGS"
            accentWord="I do well."
            animate={false}
          />

          {/* Interactive Card Stage Indicator Pills */}
          <div className="services-nav-pills" role="tablist" aria-label="Services categories">
            {services.map((s, idx) => (
              <button
                key={s.num}
                type="button"
                role="tab"
                aria-selected={activeCard === idx}
                className={`services-pill ${activeCard === idx ? "services-pill--active" : ""}`}
                onClick={() => scrollToCard(idx)}
              >
                <span className="services-pill__num">{s.num}</span>
                <span className="services-pill__label">{s.shortTitle}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3D Tumble Deck Scene Container */}
        <div ref={sceneRef} className="services-scene-container" aria-label="Interactive 3D services card stack">
          {services.map((s, idx) => {
            const Icon = s.icon;
            const isActive = activeCard === idx;

            return (
              <div
                key={s.num}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                className={`service-tumble-card ${isActive ? "service-tumble-card--active" : ""}`}
                role="group"
                aria-label={`Card ${s.num}: ${s.name}`}
                onClick={() => {
                  if (activeCard < 3) {
                    scrollToCard(activeCard + 1);
                  }
                }}
              >
                {/* 3D Lighting falloff overlay */}
                <div className="service-tumble-card__lighting" aria-hidden="true" />

                {/* Top Header metadata */}
                <div className="service-tumble-card__top">
                  <div className="service-tumble-card__badge">
                    <span className="service-tumble-card__dot" aria-hidden="true" />
                    <span className="service-tumble-card__card-label">CARD {s.num}</span>
                    <span className="service-tumble-card__sep" aria-hidden="true">/</span>
                    <span className="service-tumble-card__total">04</span>
                  </div>

                  <div className="service-tumble-card__icon-bubble">
                    <Icon size={18} className="service-tumble-card__icon" />
                    <ArrowUpRight size={15} className="service-tumble-card__arrow" aria-hidden="true" />
                  </div>
                </div>

                {/* Main Card Content */}
                <div className="service-tumble-card__main">
                  <span className="service-tumble-card__eyebrow">{s.categoryLabel}</span>
                  <h3 className="service-tumble-card__title">{s.name}</h3>
                  <p className="service-tumble-card__desc">{s.desc}</p>
                </div>

                {/* Feature capability pills */}
                <div className="service-tumble-card__tags" aria-hidden="true">
                  {s.tags.map((t) => (
                    <span key={t} className="service-tumble-card__tag">
                      {t}
                    </span>
                  ))}
                </div>

                {/* Footer Highlight */}
                <div className="service-tumble-card__footer">
                  <span className="service-tumble-card__highlight">{s.highlight}</span>
                  <div className="service-tumble-card__status">
                    <span className="service-status-dot" aria-hidden="true" />
                    <span>Available</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Section Guidance & Next Section Indicator */}
        <div className="services-footer-hint">
          <div className="services-footer-hint__left">
            <span className="services-hint-dot" aria-hidden="true" />
            <span className="services-hint-text">
              {activeCard === 3
                ? "04 of 04 · Ready to explore work"
                : `Card 0${activeCard + 1} of 04 · Scroll down to cycle services`}
            </span>
          </div>

          <div className="services-footer-hint__progress" aria-hidden="true">
            <div
              className="services-hint-progress-bar"
              style={{ width: `${((activeCard + 1) / 4) * 100}%` }}
            />
          </div>

          <a href="#work" className="services-next-link">
            <span>Selected Work / Off the Page</span>
            <ArrowDown size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
