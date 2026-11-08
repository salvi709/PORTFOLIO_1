import React, { useRef, useState } from "react";
import SectionHeader from "../common/SectionHeader";
import useSectionReveal from "../../hooks/useSectionReveal";
import TumbleDeckShowcase, { sampleCards } from "../ui/tumble-deck-showcase";
import { Code2, Palette, Video, Sparkles, ArrowUpRight, MousePointerClick, Layers } from "lucide-react";

const services = [
  {
    num: "01",
    name: "Websites & Web Experiences",
    desc: "Landing pages, personal portfolios, business websites and interactive web applications.",
    tags: ["React", "Creative Dev", "Full-Stack", "Performance"],
    icon: Code2,
    highlight: "Bespoke digital architecture built for maximum visual impact, sub-second load times, and fluid interactions.",
  },
  {
    num: "02",
    name: "UI/UX & Interface Design",
    desc: "Website interfaces, dashboards, wireframes and interactive prototypes.",
    tags: ["Figma", "Design Systems", "Prototyping", "Micro-interactions"],
    icon: Palette,
    highlight: "Pixel-perfect visual hierarchy, dark-mode design systems, and user-centric wireframes that convert.",
  },
  {
    num: "03",
    name: "Video & Visual Storytelling",
    desc: "Cinematic editing, promotional videos, short-form content and motion graphics.",
    tags: ["DaVinci Resolve", "Motion Graphics", "Color Grading", "Audio Design"],
    icon: Video,
    highlight: "Narrative pacing, dynamic motion design, and high-production visual editing that commands audience attention.",
  },
  {
    num: "04",
    name: "AI & Data-driven Experiences",
    desc: "AI-powered prototypes, intelligent applications and data visualization dashboards.",
    tags: ["Python", "Generative AI", "LLM Workflows", "Data Visualization"],
    icon: Sparkles,
    highlight: "Autonomous agents, predictive analytics dashboards, and custom AI tools engineered for real-world utility.",
  },
];

// Rich tumble cards paired with service domains
const showcaseCards = sampleCards.map((card, idx) => {
  const serviceIndex = idx % services.length;
  const s = services[serviceIndex];
  return {
    src: card.src,
    alt: `${s.num} — ${s.name} (${card.alt || "Showcase preview"})`,
  };
});

export default function ServicesSection() {
  const section = useRef(null);
  useSectionReveal(section, ".service-card");
  const [hoveredIndex, setHoveredIndex] = useState(0);

  return (
    <section ref={section} id="services" className="portfolio-section services-section">
      <div className="services-container">
        {/* Section Header with exact prompt requirements */}
        <SectionHeader
          number="05"
          category="WHAT I CAN BUILD FOR YOU / SERVICES"
          title="FOUR THINGS"
          accentWord="I do well."
          animate
        />

        {/* Editorial Subtitle */}
        <div className="services-intro">
          <p className="services-intro__text">
            Focused on delivering high-fidelity digital craft across four core disciplines — from full-stack
            web systems and tailored user interfaces to cinematic motion and intelligent AI-driven applications.
          </p>
          <div className="services-intro__badge">
            <span className="services-intro__dot" aria-hidden="true" />
            <span>Available for Select Client Commissions & Collaborations</span>
          </div>
        </div>

        {/* 3D Tumble Deck Showcase Area */}
        <div className="services-showcase-wrapper">
          <div className="services-showcase-header">
            <div className="services-showcase-meta">
              <span className="services-showcase-label">
                <Layers className="services-showcase-icon" size={14} />
                <span>Interactive 3D Deck Showcase</span>
              </span>
              <span className="services-showcase-caption">
                Card aspect 2.06 · Physics-driven tumble loop
              </span>
            </div>

            <div className="services-showcase-hint">
              <MousePointerClick size={13} className="services-hint-icon" />
              <span>Scroll, drag, or click cards to flip</span>
            </div>
          </div>

          <div className="services-showcase-stage">
            <TumbleDeckShowcase
              cards={showcaseCards}
              height="clamp(380px, 52vh, 560px)"
              aspect={2.06}
              scrollPerCard={220}
              depth={5}
              background="var(--ink, #030303)"
              className="services-tumble-deck"
              ariaLabel="Interactive 3D showcase of websites, designs, motion graphics, and AI prototypes"
            />
          </div>
        </div>

        {/* Four Services Grid */}
        <div className="services-grid" role="list">
          {services.map((s, i) => {
            const Icon = s.icon;
            const isHovered = hoveredIndex === i;

            return (
              <div
                key={s.num}
                className={`service-card ${isHovered ? "service-card--active" : ""}`}
                role="listitem"
                onMouseEnter={() => setHoveredIndex(i)}
                onFocus={() => setHoveredIndex(i)}
                tabIndex={0}
              >
                <div className="service-card__top">
                  <div className="service-card__badge">
                    <span className="service-card__num">{s.num}</span>
                    <span className="service-card__dash">—</span>
                    <Icon className="service-card__icon" size={16} />
                  </div>
                  <span className="service-card__arrow" aria-hidden="true">
                    <ArrowUpRight size={18} />
                  </span>
                </div>

                <div className="service-card__main">
                  <h3 className="service-card__title">{s.name}</h3>
                  <p className="service-card__desc">{s.desc}</p>
                </div>

                <div className="service-card__highlight">
                  <p>{s.highlight}</p>
                </div>

                <div className="service-card__tags" aria-hidden="true">
                  {s.tags.map((t) => (
                    <span key={t} className="service-card__tag">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="service-card__glow" aria-hidden="true" />
              </div>
            );
          })}
        </div>

        {/* Section Bottom Guarantee Banner */}
        <div className="services-footer-banner">
          <div className="services-footer-banner__content">
            <span className="services-banner-lead">Have a concept ready to bring to life?</span>
            <p className="services-banner-sub">
              Whether you need an end-to-end web build, a high-converting interface, or an AI prototype, let&apos;s build something extraordinary.
            </p>
          </div>
          <a href="#contact" className="services-banner-btn">
            <span>Initiate Project Inquiry</span>
            <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}
