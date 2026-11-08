import React, { useRef, useMemo } from "react";
import SectionHeader from "../common/SectionHeader";
import useSectionReveal from "../../hooks/useSectionReveal";
import { skillCategories, personalInfo } from "../../data/portfolioData";

/* ------------------------------------------------------------------ */
/*  Seeded pseudo-random — same value every render (no hydration flash) */
/* ------------------------------------------------------------------ */
function seededRng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

/* Generate a 7-row × 52-col contribution grid of levels 0–4 */
function buildGrid(seed = 42) {
  const rng = seededRng(seed);
  const ROWS = 7;
  const COLS = 52;
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => {
      const r = rng();
      if (r < 0.38) return 0; // empty
      if (r < 0.60) return 1;
      if (r < 0.78) return 2;
      if (r < 0.91) return 3;
      return 4;
    })
  );
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* Gather all skills into two marquee rows */
function buildMarqueeRows(categories) {
  const all = categories.flatMap((c) => c.skills.map((s) => s.name));
  const mid = Math.ceil(all.length / 2);
  return [all.slice(0, mid), all.slice(mid)];
}

/* ------------------------------------------------------------------ */
export default function GitHubSection() {
  const section = useRef(null);
  useSectionReveal(section, ".gh-header-block,.gh-grid-wrap,.gh-stats,.gh-marquee-wrap,.gh-cta");

  const grid = useMemo(() => buildGrid(42), []);
  const [row1, row2] = useMemo(() => buildMarqueeRows(skillCategories), []);

  return (
    <section
      ref={section}
      id="github"
      className="portfolio-section github-section"
      data-story-extra
    >
      <div className="gh-header-block">
        <SectionHeader
          number="09"
          category="GITHUB ACTIVITY / BEHIND THE COMMITS"
          title="A LOT HAPPENS"
          accentWord="behind the commits."
          animate
        />
      </div>

      {/* ---- Contribution calendar ---- */}
      <div className="gh-grid-wrap">
        <div className="gh-grid" aria-label="Demonstrative contribution calendar" role="img">
          <div className="gh-day-labels" aria-hidden="true">
            {DAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <div className="gh-cells">
            {grid.map((row, ri) => (
              <div key={ri} className="gh-row">
                {row.map((level, ci) => (
                  <div
                    key={ci}
                    className={`gh-cell gh-cell--l${level}`}
                    aria-hidden="true"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <p className="gh-grid-note">
          Demonstrative timeline — illustrative only.
        </p>
      </div>

      {/* ---- Stats strip ---- */}
      <div className="gh-stats">
        <div className="gh-stat">
          <span className="gh-stat-value">2,400+</span>
          <span className="gh-stat-label">Contributions</span>
        </div>
        <div className="gh-stat-divider" aria-hidden="true" />
        <div className="gh-stat">
          <span className="gh-stat-value">12+</span>
          <span className="gh-stat-label">Public Repos</span>
        </div>
        <div className="gh-stat-divider" aria-hidden="true" />
        <div className="gh-stat">
          <span className="gh-stat-value">5</span>
          <span className="gh-stat-label">Skill Areas</span>
        </div>
        <div className="gh-stat-divider" aria-hidden="true" />
        <div className="gh-stat">
          <span className="gh-stat-value">∞</span>
          <span className="gh-stat-label">Tabs open</span>
        </div>
      </div>

      {/* ---- Marquee — tech stack ---- */}
      <div className="gh-marquee-wrap" aria-hidden="true">
        <div className="gh-marquee gh-marquee--fwd">
          <div className="gh-marquee-track">
            {[...row1, ...row1].map((skill, i) => (
              <span key={i} className="gh-skill-chip">
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div className="gh-marquee gh-marquee--rev">
          <div className="gh-marquee-track">
            {[...row2, ...row2].map((skill, i) => (
              <span key={i} className="gh-skill-chip">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ---- CTA ---- */}
      <div className="gh-cta">
        <p className="gh-cta-note">
          Metrics shown are illustrative.{" "}
          <a
            href={personalInfo.socials.github}
            target="_blank"
            rel="noreferrer"
            className="gh-cta-link"
          >
            View real activity on GitHub ↗
          </a>
        </p>
      </div>
    </section>
  );
}

