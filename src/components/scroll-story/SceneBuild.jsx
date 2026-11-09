import React from "react";
import ProjectVisual from "../common/ProjectVisual";

import { developmentProjects } from "../../data/portfolioData";

export default function SceneBuild() {
  return (
    <section id="build" className="scene scene-build" aria-label="Development and AI">
      <div className="story-copy">
        <p className="eyebrow">
          01 / LOGIC INTO SOMETHING REAL
        </p>
        <h2>
          I BUILD<span>.</span>
        </h2>
        <span className="microcopy-tag">It worked on localhost. That's a start.</span>
        <em className="story-accent">
          Ideas, made useful.
        </em>
        <p>
          From a blank editor to something you can use. I build products,
          explore data, and make room for a little intelligence.
        </p>
        <div className="discipline-line">
          DEVELOPMENT / AI / DATA / PRODUCTS
        </div>
      </div>
      <div className="mobile-story-art">
        <ProjectVisual project={developmentProjects[0]} decorative />
      </div>
      <div className="code-fragment" aria-hidden="true">
        <span>idea.js</span>
        <code>
          const idea = curiosity;
          <br />
          const product = build(idea);
          <br />
          <b>return somethingUseful;</b>
        </code>
      </div>
    </section>
  );
}
