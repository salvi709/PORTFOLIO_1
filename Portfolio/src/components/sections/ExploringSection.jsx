import React from "react";
import { currentlyExploring } from "../../data/portfolioData";
import CuriousNote from "../common/CuriousNote";
export default function ExploringSection() {
  return (
    <section className="portfolio-section exploring-section">
      <div>
        <p className="eyebrow">CURRENTLY EXPLORING</p>
        <h2>
          Down a few
          <br />
          <em>rabbit holes.</em>
        </h2>
        <p className="explore-rabbit-sub">Yahan se topic kaise badal gaya?</p>
        <CuriousNote />
      </div>
      <div className="explore-topics">
        {currentlyExploring.map((title, i) => (
          <span key={title}>
            <sup>0{i + 1}</sup>
            {title}
            <b>↗</b>
          </span>
        ))}
      </div>
    </section>
  );
}
