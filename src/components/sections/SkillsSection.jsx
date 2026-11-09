import React, { useRef } from "react";
import { skillCategories } from "../../data/portfolioData";
import SectionHeader from "../common/SectionHeader";
import useSectionReveal from "../../hooks/useSectionReveal";
export default function SkillsSection() {
  const section = useRef(null);
  useSectionReveal(section, ".skill-row");
  return (
    <section ref={section} id="skills" className="portfolio-section skills-section">
      <SectionHeader
        number="08"
        category="MY TOOLKIT / TOOLS & SKILLS"
        title="SIDEKICKS."
        accentWord="Things I click until something happens."
      />
      <div className="skill-rows">
        {skillCategories.map((category, i) => (
          <div className="skill-row" key={category.id}>
            <span className="skill-number">0{i + 1}</span>
            <h3>{category.name}</h3>
            <ul>
              {category.skills.map((skill) => (
                <li key={skill.name}>{skill.name}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
