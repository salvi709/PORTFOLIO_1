import React, { useEffect, useRef, useState, useMemo } from "react";
import { LiquidNavbar } from "@/components/ui/liquid-glass-navbar";
import {
  Home,
  Hammer,
  Scissors,
  Layers,
  Briefcase,
  Sparkles,
  User,
  Wrench,
  GitBranch,
  Search,
  HelpCircle,
  Mail,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useMediaQuery from "@/hooks/useMediaQuery";

// ─── ScrollStory timeline constants (must match ScrollStory.jsx) ─────────────
const HERO_OFFSET = 9.0;
const GALLERY_START = 7.9;
const GALLERY_COUNT = 7;
const GALLERY_DURATION = GALLERY_COUNT * 1.15; // 8.05
const STORY_DURATION = HERO_OFFSET + GALLERY_START + GALLERY_DURATION; // 24.95

// Phase label → timeline position relative to HERO_OFFSET
const PHASE_TIMES = { build: 1.25, create: 3.6, merge: 5.3 };

// IDs that live inside the "More" dropdown
const MORE_GROUP_IDS = ["about", "skills", "github", "exploring", "questions", "contact"];

// ─── Primary nav items (Work MUST appear before Services) ─────────────────────
const PRIMARY_LINKS = [
  { id: "hero",     label: "Home",          icon: <Home      size={15} strokeWidth={1.8} />, fx: "glow" },
  { id: "build",    label: "I BUILD",       icon: <Hammer    size={15} strokeWidth={1.8} />, fx: "pop"  },
  { id: "create",   label: "I CREATE",      icon: <Scissors  size={15} strokeWidth={1.8} />, fx: "wave" },
  { id: "merge",    label: "Build × Create",icon: <Layers    size={15} strokeWidth={1.8} />, fx: "glow" },
  { id: "work",     label: "Work",          icon: <Briefcase size={15} strokeWidth={1.8} />, fx: "pop"  },
  { id: "services", label: "Services",      icon: <Sparkles  size={15} strokeWidth={1.8} />, fx: "glow" },
];

// ─── More dropdown items ─────────────────────────────────────────────────────
const MORE_LINKS = [
  { id: "about",     label: "Behind the Scene", icon: User       },
  { id: "skills",    label: "Toolkit",          icon: Wrench     },
  { id: "github",    label: "GitHub",           icon: GitBranch  },
  { id: "exploring", label: "Rabbit Holes",     icon: Search     },
  { id: "questions", label: "Q&A",              icon: HelpCircle },
  { id: "contact",   label: "Contact",          icon: Mail, suffix: "↗" },
];

const ALL_NAV_LINKS = [...PRIMARY_LINKS, ...MORE_LINKS];

// ─── Component ───────────────────────────────────────────────────────────────
export default function Navbar() {
  const [activeId, setActiveId] = useState("hero");
  const [accentMix, setAccentMix] = useState(0);
  const [tone, setTone] = useState("dark");
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isMobile = useMediaQuery("(max-width: 820px)");

  const progressRef = useRef(null);
  const moreRef = useRef(null);
  const navLockRef = useRef(false);
  const navTimeoutRef = useRef(null);
  const frameRef = useRef(0);

  // ── Scroll & active-state detection ─────────────────────────────────────
  useEffect(() => {
    const update = () => {
      frameRef.current = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;

      // Progress bar
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      }

      // Theme tone
      const th = document.documentElement.dataset.theme;
      setTone(th === "light" ? "light" : "dark");

      // Monochrome→cobalt transition
      const storyTrigger = ScrollTrigger.getById("portfolio-story");
      const dist = storyTrigger ? Math.min((storyTrigger.end - storyTrigger.start) * 0.5, 1200) : Math.max(300, window.innerHeight * 0.5);
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

      let current = "hero";

      // Check standard document sections from bottom to top
      if (getTop("contact") <= threshold) {
        current = "contact";
      } else if (getTop("questions") <= threshold) {
        current = "questions";
      } else if (getTop("exploring") <= threshold) {
        current = "exploring";
      } else if (getTop("github") <= threshold) {
        current = "github";
      } else if (getTop("skills") <= threshold) {
        current = "skills";
      } else if (getTop("about") <= threshold) {
        current = "about";
      } else if (getTop("services") <= threshold) {
        current = "services";
      } else if (!storyTrigger) {
        // Mobile / non-cinematic document flow
        if (getTop("work") <= threshold) current = "work";
        else if (getTop("merge") <= threshold) current = "merge";
        else if (getTop("create") <= threshold) current = "create";
        else if (getTop("build") <= threshold) current = "build";
        else current = "hero";
      } else {
        // Desktop / cinematic ScrollStory timeline
        const elapsed = ((y - storyTrigger.start) / (storyTrigger.end - storyTrigger.start)) * STORY_DURATION;
        const time = elapsed - HERO_OFFSET;
        if (time >= GALLERY_START - 0.2) {
          current = "work";
        } else if (time >= 5.0) {
          current = "merge";
        } else if (time >= 2.85) {
          current = "create";
        } else if (time >= 0.95) {
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

  // ── Close dropdown & mobile menu on Escape ──────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMoreOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // ── Close More dropdown on outside click ─────────────────────────────────
  useEffect(() => {
    if (!moreOpen) return;
    const onMouseDown = (e) => {
      if (!moreRef.current?.contains(e.target)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [moreOpen]);

  // ── Lock body scroll when mobile menu is open ────────────────────────────
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // ── Navigation handler ───────────────────────────────────────────────────
  const handleNavigate = (id, e) => {
    if (e?.preventDefault) e.preventDefault();
    setActiveId(id);

    navLockRef.current = true;
    if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
    navTimeoutRef.current = setTimeout(() => {
      navLockRef.current = false;
    }, 1200);

    const navOffset = window.innerWidth <= 820 ? 65 : 75;

    if (id === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      history.pushState(null, "", "#hero");
      return;
    }

    const storyTrigger = ScrollTrigger.getById("portfolio-story");

    // ScrollStory phases when cinematic is active (desktop >= 1025px)
    if (storyTrigger) {
      if (id === "build" || id === "create" || id === "merge") {
        const timeOffset = PHASE_TIMES[id];
        if (timeOffset !== undefined) {
          const frac = (HERO_OFFSET + timeOffset) / STORY_DURATION;
          const targetY = storyTrigger.start + (storyTrigger.end - storyTrigger.start) * frac;
          window.scrollTo({ top: targetY, behavior: "smooth" });
          history.pushState(null, "", `#${id}`);
          return;
        }
      }

      if (id === "work") {
        const frac = (HERO_OFFSET + GALLERY_START) / STORY_DURATION;
        const targetY = storyTrigger.start + (storyTrigger.end - storyTrigger.start) * frac + 10;
        window.scrollTo({ top: targetY, behavior: "smooth" });
        history.pushState(null, "", "#work");
        return;
      }

      if (id === "services") {
        // Services section begins immediately when portfolio-story unpins
        const targetY = storyTrigger.end;
        window.scrollTo({ top: targetY, behavior: "smooth" });
        history.pushState(null, "", "#services");
        return;
      }
    }

    // Default DOM section lookup
    const target = document.getElementById(id);
    if (target) {
      const topOffset = Math.max(0, target.getBoundingClientRect().top + window.scrollY - navOffset);
      window.scrollTo({ top: topOffset, behavior: "smooth" });
      history.pushState(null, "", `#${id}`);
    }
  };

  // ── Build navItems for LiquidNavbar ─────────────────────────────────────
  const navItems = useMemo(
    () =>
      PRIMARY_LINKS.map((link) => ({
        label: link.label,
        icon: link.icon,
        suffix: link.suffix,
        fx: link.fx,
        href: `#${link.id}`,
        onClick: (e) => handleNavigate(link.id, e),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Active index for LiquidNavbar (−1 → no bubble on primary items when in More group)
  const activeIndex = MORE_GROUP_IDS.includes(activeId)
    ? -1
    : Math.max(0, PRIMARY_LINKS.findIndex((l) => l.id === activeId));

  const isMoreActive = MORE_GROUP_IDS.includes(activeId);
  const activeItemMeta = ALL_NAV_LINKS.find((l) => l.id === activeId) || PRIMARY_LINKS[0];

  const wrapperStyle = { "--accent-mix": accentMix };

  return (
    <header className="portfolio-floating-header" role="banner">
      <div className="page-progress" ref={progressRef} aria-hidden="true" />

      {/* ── Desktop & Large Tablet Navbar (> 820px) ── */}
      {!isMobile ? (
        <div className="nav-pill-row" style={wrapperStyle}>
          {/* Main LiquidNavbar pill */}
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

          {/* More button + dropdown */}
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
                      onClick={() => {
                        handleNavigate(link.id);
                        setMoreOpen(false);
                      }}
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
      ) : (
        /* ── Mobile & Tablet Navbar (<= 820px) ── */
        <div className="mobile-nav-bar" style={wrapperStyle}>
          <button
            type="button"
            className="mobile-nav-brand"
            onClick={(e) => handleNavigate("hero", e)}
            aria-label="Back to top"
          >
            <span className="mobile-monogram">s<span>·</span>s</span>
            <span className="mobile-brand-divider" aria-hidden="true">/</span>
            <span className="mobile-active-chip">
              {activeItemMeta.label}
            </span>
          </button>

          <div className="mobile-nav-actions">
            <button
              type="button"
              className={`mobile-quick-btn${activeId === "work" ? " mobile-quick-btn--active" : ""}`}
              onClick={(e) => handleNavigate("work", e)}
            >
              <Briefcase size={13} strokeWidth={1.8} />
              <span>Work</span>
            </button>

            <button
              type="button"
              className={`mobile-menu-btn${mobileMenuOpen ? " mobile-menu-btn--open" : ""}`}
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={17} strokeWidth={2} /> : <Menu size={17} strokeWidth={2} />}
              <span className="mobile-menu-label">{mobileMenuOpen ? "Close" : "Menu"}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Mobile Full Menu Overlay Drawer ── */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Menu"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileMenuOpen(false);
          }}
        >
          <div className="mobile-drawer-sheet" style={wrapperStyle}>
            <div className="mobile-drawer-header">
              <div className="mobile-drawer-title">
                <span className="mobile-monogram">s<span>·</span>s</span>
                <span>Sarthak Salvi · Portfolio</span>
              </div>
              <button
                type="button"
                className="mobile-drawer-close"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>

            <div className="mobile-drawer-content">
              {/* Primary Navigation Group */}
              <div className="mobile-drawer-group">
                <span className="mobile-drawer-group-label">STORY & ESSENTIALS</span>
                <div className="mobile-drawer-links">
                  {PRIMARY_LINKS.map((link) => {
                    const isActive = activeId === link.id;
                    return (
                      <button
                        key={link.id}
                        type="button"
                        className={`mobile-drawer-item${isActive ? " mobile-drawer-item--active" : ""}`}
                        onClick={(e) => {
                          handleNavigate(link.id, e);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <span className="mobile-drawer-item-icon">{link.icon}</span>
                        <span className="mobile-drawer-item-label">{link.label}</span>
                        {isActive && <span className="mobile-drawer-indicator" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Exploration & Contact Group */}
              <div className="mobile-drawer-group">
                <span className="mobile-drawer-group-label">MORE EXPLORATION</span>
                <div className="mobile-drawer-links">
                  {MORE_LINKS.map((link) => {
                    const Icon = link.icon;
                    const isActive = activeId === link.id;
                    return (
                      <button
                        key={link.id}
                        type="button"
                        className={`mobile-drawer-item${isActive ? " mobile-drawer-item--active" : ""}`}
                        onClick={(e) => {
                          handleNavigate(link.id, e);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <span className="mobile-drawer-item-icon">
                          <Icon size={16} strokeWidth={1.8} />
                        </span>
                        <span className="mobile-drawer-item-label">{link.label}</span>
                        {link.suffix && <span className="nav-dropdown-suffix">{link.suffix}</span>}
                        {isActive && <span className="mobile-drawer-indicator" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mobile-drawer-footer">
              <span>Mumbai, India · Available for ideas</span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .portfolio-floating-header {
          position: fixed;
          top: 12px;
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
          gap: 4px;
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
          height: 35px;
          padding: 0 11px;
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
          box-shadow: 0 14px 30px -8px rgba(0,0,0,.6), 0 3px 10px rgba(0,0,0,.35);
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

        /* ── Mobile bar (<= 820px) ── */
        .mobile-nav-bar {
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          height: 38px;
          padding: 2px 4px 2px 12px;
          border-radius: 999px;
          background: rgba(14,16,24,.82);
          border: 1px solid rgba(255,255,255,.12);
          -webkit-backdrop-filter: blur(16px);
          backdrop-filter: blur(16px);
          box-shadow: 0 16px 36px -8px rgba(0,0,0,.7), 0 3px 10px rgba(0,0,0,.4);
          max-width: calc(100vw - 24px);
        }

        .mobile-nav-brand {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: transparent;
          border: none;
          color: #FAF9FC;
          cursor: pointer;
          padding: 0;
          font-family: var(--font-body, "Manrope", sans-serif);
          text-align: left;
        }

        .mobile-monogram {
          font-size: 17px;
          font-weight: 700;
          letter-spacing: -0.04em;
          color: #F1F7FF;
        }
        .mobile-monogram span {
          color: var(--violet, #315BDB);
        }

        .mobile-brand-divider {
          opacity: 0.25;
          font-size: 12px;
        }

        .mobile-active-chip {
          font-size: 11.5px;
          font-weight: 600;
          color: rgba(241,247,255,.8);
          max-width: 130px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mobile-nav-actions {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .mobile-quick-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 30px;
          padding: 0 10px;
          border-radius: 999px;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.1);
          color: rgba(241,247,255,.85);
          font-family: var(--font-body, "Manrope", sans-serif);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .mobile-quick-btn:hover,
        .mobile-quick-btn--active {
          color: #FFFFFF;
          background: color-mix(in srgb, rgba(49,91,219,0.3) calc(var(--accent-mix,1)*100%), rgba(255,255,255,0.12));
          border-color: color-mix(in srgb, rgba(72,113,247,0.9) calc(var(--accent-mix,1)*100%), rgba(255,255,255,0.3));
        }

        .mobile-menu-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 30px;
          padding: 0 10px;
          border-radius: 999px;
          background: rgba(49, 91, 219, 0.18);
          border: 1px solid rgba(72, 113, 247, 0.5);
          color: #FFFFFF;
          font-family: var(--font-body, "Manrope", sans-serif);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .mobile-menu-btn--open {
          background: rgba(255,255,255,.12);
          border-color: rgba(255,255,255,.2);
        }
        .mobile-menu-label {
          font-size: 12px;
        }

        /* ── Mobile drawer overlay ── */
        .mobile-drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(6, 7, 11, 0.85);
          -webkit-backdrop-filter: blur(18px);
          backdrop-filter: blur(18px);
          z-index: 9999;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 16px 14px;
          overflow-y: auto;
          animation: drawerFadeIn .2s ease-out both;
        }

        @keyframes drawerFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .mobile-drawer-sheet {
          width: 100%;
          max-width: 440px;
          background: rgba(14, 16, 24, 0.96);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 20px;
          box-shadow: 0 24px 60px -10px rgba(0,0,0,.95), 0 6px 20px rgba(0,0,0,.5);
          padding: 18px;
          margin-top: 8px;
          margin-bottom: 24px;
          animation: sheetSlideIn .25s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes sheetSlideIn {
          from { opacity: 0; transform: translateY(-12px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .mobile-drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .mobile-drawer-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(241, 247, 255, 0.7);
        }

        .mobile-drawer-close {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #FAF9FC;
          cursor: pointer;
        }

        .mobile-drawer-content {
          display: flex;
          flex-direction: column;
          gap: 18px;
          padding: 16px 0 10px;
        }

        .mobile-drawer-group-label {
          display: block;
          font-family: var(--font-body, "Manrope", sans-serif);
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: rgba(241, 247, 255, 0.45);
          margin-bottom: 8px;
          padding-left: 6px;
        }

        .mobile-drawer-links {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .mobile-drawer-item {
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 44px;
          padding: 8px 12px;
          border-radius: 10px;
          background: transparent;
          border: 1px solid transparent;
          color: rgba(241, 247, 255, 0.8);
          font-family: var(--font-body, "Manrope", sans-serif);
          font-size: 14px;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
          transition: background 0.18s ease, color 0.18s ease;
          width: 100%;
        }

        .mobile-drawer-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #FAF9FC;
        }

        .mobile-drawer-item--active {
          color: #FAF9FC;
          font-weight: 600;
          background: color-mix(in srgb, rgba(49, 91, 219, 0.18) calc(var(--accent-mix, 1) * 100%), rgba(255, 255, 255, 0.06));
          border-color: color-mix(in srgb, rgba(72, 113, 247, 0.4) calc(var(--accent-mix, 1) * 100%), rgba(255, 255, 255, 0.1));
        }

        .mobile-drawer-item-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          color: var(--violet, #315BDB);
        }

        .mobile-drawer-item-label {
          flex: 1;
        }

        .mobile-drawer-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--violet, #315BDB);
          box-shadow: 0 0 8px var(--violet, #315BDB);
        }

        .mobile-drawer-footer {
          padding-top: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 11px;
          color: rgba(241, 247, 255, 0.45);
          text-align: center;
        }
      `}</style>
    </header>
  );
}
