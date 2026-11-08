import React, { useEffect, useRef, useState, useMemo } from "react";
import { LiquidNavbar } from "@/components/ui/liquid-glass-navbar";
import { Home, Briefcase, User, Sparkles, Mail } from "lucide-react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Calculations matching ScrollStory timeline
const HERO_OFFSET = 9.0;
const GALLERY_START = 7.9;
const GALLERY_COUNT = 9; // galleryOrder length
const GALLERY_DURATION = GALLERY_COUNT * 1.15;
const STORY_DURATION = HERO_OFFSET + GALLERY_START + GALLERY_DURATION; // ~27.25

export default function Navbar() {
  const [activeId, setActiveId] = useState("hero");
  const [tone, setTone] = useState("dark");
  const [accentMix, setAccentMix] = useState(0); // 0 at Home (monochrome), 1 in subsequent sections (cobalt blue)
  const progress = useRef(null);
  const navLockRef = useRef(false);
  const navTimeoutRef = useRef(null);

  // Helper to accurately calculate the scroll position where the Selected Work gallery begins
  const getWorkTargetY = () => {
    const workEl = document.getElementById("work");
    if (workEl) {
      return workEl.getBoundingClientRect().top + window.scrollY - 70;
    }
    return 0;
  };

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progress.current) {
        progress.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      }

      // Check theme from documentElement data-theme
      const currentTheme = document.documentElement.dataset.theme;
      setTone(currentTheme === "light" ? "light" : "dark");

      // Smooth monochrome to cobalt transition:
      // At scrollY = 0 (Home): accentMix = 0 (pure monochrome)
      // As user scrolls away into subsequent sections: smoothly scales to 1.0 (cobalt blue)
      const workTargetY = getWorkTargetY();
      const transitionDistance = workTargetY > 0 ? Math.min(workTargetY * 0.75, 1200) : Math.max(300, window.innerHeight * 0.5);
      const mix = Math.min(1, Math.max(0, y / transitionDistance));
      setAccentMix(mix);

      // If user recently clicked a nav item, let smooth scroll complete before overriding
      if (navLockRef.current) return;

      // Bottom of page -> Contact
      if (y + window.innerHeight >= document.documentElement.scrollHeight - 60) {
        setActiveId("contact");
        return;
      }

      // Top of page -> Home
      if (y < 80) {
        setActiveId("hero");
        return;
      }

      // Active section detection in downward and upward scroll directions
      const threshold = window.innerHeight * 0.38;
      const contactEl = document.getElementById("contact");
      const skillsEl = document.getElementById("skills");
      const aboutEl = document.getElementById("about");
      const workEl = document.getElementById("work");

      let current = "hero";

      if (contactEl && contactEl.getBoundingClientRect().top <= threshold) {
        current = "contact";
      } else if (skillsEl && skillsEl.getBoundingClientRect().top <= threshold) {
        current = "skills";
      } else if (aboutEl && aboutEl.getBoundingClientRect().top <= threshold) {
        current = "about";
      } else if (workEl && workEl.getBoundingClientRect().top <= threshold) {
        current = "work";
      }

      setActiveId(current);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    const observer = new MutationObserver(() => {
      const currentTheme = document.documentElement.dataset.theme;
      setTone(currentTheme === "light" ? "light" : "dark");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      observer.disconnect();
      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
    };
  }, []);

  const links = useMemo(
    () => [
      { id: "hero", label: "Home", icon: <Home size={15} strokeWidth={1.8} />, fx: "glow" },
      { id: "work", label: "Work", icon: <Briefcase size={15} strokeWidth={1.8} />, fx: "pop" },
      { id: "about", label: "About", icon: <User size={15} strokeWidth={1.8} />, fx: "wave" },
      { id: "skills", label: "Skills", icon: <Sparkles size={15} strokeWidth={1.8} />, fx: "glow" },
      {
        id: "contact",
        label: "Contact",
        icon: <Mail size={15} strokeWidth={1.8} />,
        suffix: <span className="nimbus-suffix" aria-hidden="true">↗</span>,
        fx: "plane",
      },
    ],
    []
  );

  const activeIndex = Math.max(
    0,
    links.findIndex((l) => l.id === activeId)
  );

  const handleNavigate = (id, e) => {
    if (e) e.preventDefault();
    setActiveId(id);

    navLockRef.current = true;
    if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
    navTimeoutRef.current = setTimeout(() => {
      navLockRef.current = false;
    }, 900);

    if (id === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      history.pushState(null, "", "#hero");
      return;
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

  const navItems = links.map((link) => ({
    label: link.label,
    icon: link.icon,
    suffix: link.suffix,
    fx: link.fx,
    href: `#${link.id}`,
    onClick: (e) => handleNavigate(link.id, e),
  }));

  return (
    <header className="portfolio-floating-header" role="banner">
      <div className="page-progress" ref={progress} aria-hidden="true" />
      <LiquidNavbar
        items={navItems}
        active={activeIndex}
        onChange={(idx) => {
          const target = links[idx];
          if (target) handleNavigate(target.id);
        }}
        tone={tone}
        accentProgress={accentMix}
        sound={false}
      />
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
      `}</style>
    </header>
  );
}
