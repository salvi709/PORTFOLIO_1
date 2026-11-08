import React from "react";

export default function MarqueeMerge() {
  return (
    <section className="scene scene-merge" aria-label="Build meets create">
      <p className="eyebrow">03 / THE INTERSECTION</p>
      <h2 className="sr-only">BUILD × CREATE</h2>
      <div className="marquee-strip merge-build" aria-hidden="true"><div className="marquee-track build-track">{Array.from({ length: 12 }, (_, i) => <span key={i}>BUILD <i>•</i> </span>)}</div></div>
      <div className="marquee-strip merge-create" aria-hidden="true"><div className="marquee-track create-track">{Array.from({ length: 12 }, (_, i) => <span key={i}>CREATE <i>•</i> </span>)}</div></div>
      <span className="merge-cross" aria-hidden="true">×</span>
      <p className="merge-line">
        <em>That's where I like to work.</em>
        <span className="merge-microcopy">Two personalities. One browser tab.</span>
      </p>
    </section>
  );
}
