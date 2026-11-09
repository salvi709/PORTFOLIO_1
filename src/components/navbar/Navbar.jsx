import React, { useEffect, useRef, useState, useMemo } from "react";
import { LiquidNavbar } from "@/components/ui/liquid-glass-navbar";
import {
  Home,
  Hammer,
  Scissors,
  Layers,
  Sparkles,
  Briefcase,
  User,
  Wrench,
  GitBranch,
  Search,
  HelpCircle,
  Mail,
  ChevronDown,
} from "lucide-react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// ─── ScrollStory timeline constants (must match ScrollStory.jsx) ─────────────
const HERO_OFFSET = 9.0;
const GALLERY_START = 7.9;
const GALLERY_COUNT = 9;
const GALLERY_DURATION = GALLERY_COUNT * 1.15;
const STORY_DURATION = HERO_OFFSET + GALLERY_START + GALLERY_DURATION; // ~27.25

// Phase label → timeline position
const PHASE_TIMES = { build: 1.25, create: 3.6, merge: 5.3 };

// IDs that live inside the "More" dropdown
const MORE_GROUP_IDS = ["about", "skills", "github", "exploring", "questions", "contact"];

// ─── Primary nav items (shown in the pill) ───────────────────────────────────
const PRIMARY_LINKS = [
  { id: "hero",     label: "Home",          icon: <Home     size={15} strokeWidth={1.8} />, fx: "glow" },
  { id: "build",    label: "I BUILD",       icon: <Hammer   size={15} strokeWidth={1.8} />, fx: "pop"  },
  { id: "create",   label: "I CREATE",      icon: <Scissors size={15} strokeWidth={1.8} />, fx: "wave" },
  { id: "merge",    label: "Build × Create",icon: <Layers   size={15} strokeWidth={1.8} />, fx: "glow" },
  { id: "services", label: "Services",      icon: <Sparkles size={15} strokeWidth={1.8} />, fx: "glow" },
  { id: "work",     label: "Work",          icon: <Briefcase size={15} strokeWidth={1.8} />, fx: "pop" },
];

// ─── More dropdown items ─────────────────────────────────────────────────────
const MORE_LINKS = [
  { id: "about",     label: "Behind the Scene", icon: User        },
  { id: "skills",    label: "Toolkit",           icon: Wrench      },
  { id: "github",    label: "GitHub",            icon: GitBranch      },
  { id: "exploring", label: "Rabbit Holes",      icon: Search      },
  { id: "questions", label: "Q&A",               icon: HelpCircle  },
  { id: "contact",   label: "Contact",           icon: Mail, suffix: "↗" },
];

// ─── Helper: get scroll-Y for the Selected Work gallery ──────────────────────
function getWorkTargetY() {
  const trigger = ScrollTrigger.getById("portfolio-story");
  if (trigger) {
    const frac = (HERO_OFFSET + GALLERY_START) / STORY_DURATION;
    return trigger.start + (trigger.end - trigger.start) * frac + 20;
  }
  const el = document.getElementById("work");
  return el ? el.getBoundingClientRect().top + window.scrollY - 70 : 0;
}

// ─── Helper: get scroll-Y for a ScrollStory phase ────────────────────────────
function getPhaseTargetY(phase) {
  const trigger = ScrollTrigger.getById("portfolio-story");
  if (!trigger) return 0;
  const t = PHASE_TIMES[phase] ?? 0;
  const frac = t / STORY_DURATION;
  return trigger.start + (trigger.end - trigger.start) * frac;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function Navbar() {
  const [activeId,  setActiveId]  = useState("hero");
  const [accentMix, setAccentMix] = useState(0);
  const [tone,      setTone]      = useState("dark");
  const [moreOpen,  setMoreOpen]  = useState(false);

  const progressRef    = useRef(null);
  const moreRef        = useRef(null);
  const navLockRef     = useRef(false);
  const navTimeoutRef  = useRef(null);
  const frameRef       = useRef(0);

  // ── Scroll & active-state detection ─────────────────────────────────────
  useEffect(() => {
    const update = () => {
      frameRef.current = 0;
      const y   = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;

      // Progress bar
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      }

      // Theme tone
      const th = document.documentElement.dataset.theme;
      setTone(th === "light" ? "light" : "dark");

      // Monochrome→cobalt transition
      const workTargetY = getWorkTargetY();
      const dist = workTargetY > 0 ? Math.min(workTargetY * 0.75, 1200) : Math.max(300, window.innerHeight * 0.5);
      setAccentMix(Math.min(1, Math.max(0, y / dist)));

      if (navLockRef.current) return;

      // Bottom of page → Contact
      if (y + window.innerHeight >= document.documentElement.scrollHeight - 60) {
        setActiveId("contact");
        return;
      }
      // Top of page → Home
      if (y < 80) {
        setActiveId("hero");
        return;
      }

      const threshold = window.innerHeight * 0.38;
      const getTop = (id) => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect().top : Infinity;
      };

      // Check static section IDs from bottom to top
      let current = "hero";

      if (getTop("contact")   <= threshold) { current = "contact";   }
      else if (getTop("questions")  <= threshold) { current = "questions";  }
      else if (getTop("exploring")  <= threshold) { current = "exploring";  }
      else if (getTop("github")     <= threshold) { current = "github";     }
      else if (getTop("skills")     <= threshold) { current = "skills";     }
      else if (getTop("about")      <= threshold) { current = "about";      }
      else {
        const wY = getWorkTargetY();
        const stage = document.querySelector(".story-stage");
        const phase = stage?.dataset?.phase;

        // Check services before work — services section appears after ScrollStory pin
        if (getTop("services") <= threshold) {
          current = "services";
        } else if ((wY > 0 && y >= wY - 200) || phase === "gallery") {
          current = "work";
        } else if (phase === "merge") {
          current = "merge";
        } else if (phase === "create") {
          current = "create";
        } else if (phase === "build") {
          current = "build";
        } else {
          current = "hero";
        }
      }

      setActiveId(current);
    };

    const onScroll = () => {
      if (!frameRef.current) frameRef.current = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    const themeObserver = new MutationObserver(() => {
      const th = document.documentElement.dataset.theme;
      setTone(th === "light" ? "light" : "dark");
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      themeObserver.disconnect();
      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
    };
  }, []);

  // ── Close More dropdown on outside click / Escape ────────────────────────
  useEffect(() => {
    if (!moreOpen) return;
    const onMouseDown = (e) => {
      if (!moreRef.current?.contains(e.target)) setMoreOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setMoreOpen(false); };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown",   onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown",   onKey);
    };
  }, [moreOpen]);

  // ── Navigation handler ───────────────────────────────────────────────────
  const handleNavigate = (id, e) => {
    if (e) e.preventDefault();
    setActiveId(id);

    navLockRef.current = true;
    if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
    navTimeoutRef.current = setTimeout(() => { navLockRef.current = false; }, 900);

    if (id === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      history.pushState(null, "", "#hero");
      return;
    }

    // ScrollStory phases
    if (id === "build" || id === "create" || id === "merge") {
      const targetY = getPhaseTargetY(id);
      if (targetY > 0) {
        window.scrollTo({ top: targetY, behavior: "smooth" });
        history.pushState(null, "", `#${id}`);
        return;
      }
    }

    if (id === "work") {
      const targetY = getWorkTargetY();
      if (targetY > 0) {
        window.scrollTo({ top: targetY, behavior: "smooth" });
        history.pushState(null, "", "#work");
        return;
      }
    }

    const target = document.getElementById(id);
    if (target) {
      const topOffset = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
      history.pushState(null, "", `#${id}`);
    }
  };

  // ── Build navItems for LiquidNavbar ─────────────────────────────────────
  const navItems = useMemo(() =>
    PRIMARY_LINKS.map((link) => ({
      label:  link.label,
      icon:   link.icon,
      suffix: link.suffix,
      fx:     link.fx,
      href:   `#${link.id}`,
      onClick: (e) => handleNavigate(link.id, e),
    })),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  []);

  // Active index for LiquidNavbar (−1 → no bubble on primary items when in More group)
  const activeIndex = MORE_GROUP_IDS.includes(activeId)
    ? -1
    : Math.max(0, PRIMARY_LINKS.findIndex((l) => l.id === activeId));

  const isMoreActive = MORE_GROUP_IDS.includes(activeId);

  // ── Wrapper style carries --accent-mix for both pill and More button ─────
  const wrapperStyle = { "--accent-mix": accentMix };

  return (
    <header className="portfolio-floating-header" role="banner">
      <div className="page-progress" ref={progressRef} aria-hidden="true" />

      <div className="nav-pill-row" style={wrapperStyle}>
        {/* ── Main LiquidNavbar pill ── */}
        <LiquidNavbar
          items={navItems}
          active={activeIndex}
          onChange={(idx) => {
            const target = PRIMARY_LINKS[idx];
            if (target) handleNavigate(target.id);
          }}
          tone={tone}
          accentProgress={accentMix}
          sound={false}
        />

        {/* ── More button + dropdown ── */}
        <div className="nav-more-wrapper" ref={moreRef}>
          <button
            className={`nav-more-btn${isMoreActive ? " nav-more-btn--active" : ""}`}
            onClick={() => setMoreOpen((o) => !o)}
            aria-expanded={moreOpen}
            aria-haspopup="true"
            type="button"
          >
            More
            <ChevronDown
              size={12}
              strokeWidth={2}
              className={`nav-more-chevron${moreOpen ? " nav-more-chevron--open" : ""}`}
            />
          </button>

          {moreOpen && (
            <div className="nav-more-dropdown" role="menu">
              {MORE_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.id}
                    className={`nav-dropdown-item${activeId === link.id ? " nav-dropdown-item--active" : ""}`}
                    onClick={() => { handleNavigate(link.id); setMoreOpen(false); }}
                    role="menuitem"
                    type="button"
                  >
                    <Icon size={14} strokeWidth={1.8} />
                    <span>{link.label}</span>
                    {link.suffix && <span className="nav-dropdown-suffix">{link.suffix}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .portfolio-floating-header {
          position: fixed;
          top: 16px;
          left: 0;
          right: 0;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 100;
          pointer-events: none;
          padding: 0 12px;
        }
        .portfolio-floating-header > * {
          pointer-events: auto;
        }
        .portfolio-floating-header .page-progress {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--violet, #315BDB);
          transform: scaleX(0);
          transform-origin: left;
          pointer-events: none;
          z-index: 1000;
        }

        /* ── Pill + More row ── */
        .nav-pill-row {
          display: flex;
          align-items: center;
          gap: 6px;
          max-width: 100%;
        }

        /* ── More button ── */
        .nav-more-wrapper {
          position: relative;
          flex-shrink: 0;
        }
        .nav-more-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 39px;
          padding: 0 13px;
          border-radius: 999px;
          font-family: var(--font-body, ui-sans-serif, -apple-system, "SF Pro Text", "Segoe UI", system-ui, sans-serif);
          font-size: 12.5px;
          font-weight: 500;
          color: rgba(241,247,255,.7);
          background: rgba(14,16,24,.68);
          border: 1px solid rgba(255,255,255,.1);
          -webkit-backdrop-filter: blur(14px);
          backdrop-filter: blur(14px);
          cursor: pointer;
          transition: color .25s ease, background .25s ease, border-color .25s ease;
          white-space: nowrap;
          box-shadow: 0 18px 40px -10px rgba(0,0,0,.65), 0 4px 14px rgba(0,0,0,.45);
          -webkit-font-smoothing: antialiased;
        }
        .nav-more-btn:hover {
          color: #F1F7FF;
          background: rgba(14,16,24,.82);
        }
        .nav-more-btn--active {
          color: #F1F7FF;
          font-weight: 600;
          background: color-mix(in srgb, rgba(49,91,219,0.2) calc(var(--accent-mix,1)*100%), rgba(255,255,255,0.1));
          border-color: color-mix(in srgb, rgba(72,113,247,0.95) calc(var(--accent-mix,1)*100%), rgba(245,247,255,0.9));
        }

        /* ── More chevron ── */
        .nav-more-chevron {
          transition: transform .2s ease;
          display: inline-block;
          flex-shrink: 0;
        }
        .nav-more-chevron--open {
          transform: rotate(180deg);
        }

        /* ── Dropdown panel ── */
        .nav-more-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 195px;
          background: rgba(14,16,24,.92);
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 14px;
          -webkit-backdrop-filter: blur(20px);
          backdrop-filter: blur(20px);
          padding: 6px;
          box-shadow: 0 20px 50px -10px rgba(0,0,0,.8), 0 4px 16px rgba(0,0,0,.5);
          z-index: 200;
          animation: moreDropIn .18s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes moreDropIn {
          from { opacity:0; transform: translateY(-6px) scale(0.97); }
          to   { opacity:1; transform: translateY(0)   scale(1);    }
        }

        /* ── Dropdown items ── */
        .nav-dropdown-item {
          display: flex;
          align-items: center;
          gap: 9px;
          width: 100%;
          padding: 9px 12px;
          border-radius: 9px;
          font-family: var(--font-body, ui-sans-serif, -apple-system, "SF Pro Text", "Segoe UI", system-ui, sans-serif);
          font-size: 12.5px;
          font-weight: 500;
          color: rgba(241,247,255,.72);
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: background .18s ease, color .18s ease;
          -webkit-font-smoothing: antialiased;
          white-space: nowrap;
        }
        .nav-dropdown-item:hover {
          background: rgba(255,255,255,.07);
          color: #F1F7FF;
        }
        .nav-dropdown-item--active {
          color: #F1F7FF;
          font-weight: 600;
          background: color-mix(in srgb, rgba(49,91,219,0.18) calc(var(--accent-mix,1)*100%), rgba(255,255,255,.05));
        }
        .nav-dropdown-suffix {
          margin-left: auto;
          font-size: 11px;
          opacity: .6;
        }

        /* ── Responsive tweaks ── */
        @media (max-width: 768px) {
          .nav-more-btn { height: 36px; padding: 0 11px; font-size: 12px; }
          .nav-pill-row { gap: 4px; }
        }
        @media (max-width: 540px) {
          .nav-more-btn { height: 34px; padding: 0 9px; font-size: 11.5px; }
          .nav-more-dropdown { right: auto; left: 0; }
        }
        @media (max-width: 390px) {
          .nav-more-btn { padding: 0 7px; font-size: 10.5px; }
        }
      `}</style>
    </header>
  );
}
