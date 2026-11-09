import React from "react";
import ProjectVisual from "../common/ProjectVisual";

import { videoProjects } from "../../data/portfolioData";

export default function SceneCreate() {
  return (
    <section
      id="create"
      className="scene scene-create"
      aria-label="Design and visual storytelling"
    >
      <div className="story-copy">
        <p className="eyebrow">
          02 / FEELING INTO EVERY FRAME
        </p>
        <h2>
          I CREATE<span>.</span>
        </h2>
        <span className="microcopy-tag">One more cut. Famous last words.</span>
        <em className="story-accent">
          A rhythm. A feeling. A story.
        </em>
        <p>
          A cut in the right place. An interface that feels natural. I use
          design and motion to give an idea its own voice.
        </p>
        <div className="discipline-line">
          EDITING / MOTION / UI &amp; UX / STORYTELLING
        </div>
      </div>
      <div className="mobile-story-art">
        <ProjectVisual project={videoProjects[0]} decorative />
      </div>
    </section>
  );
}
