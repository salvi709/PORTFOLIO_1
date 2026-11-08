import React, { useState } from "react";

export default function CuriousNote() {
  const [revealed, setRevealed] = useState(false);
  return <button type="button" className="curious-note" aria-label={revealed ? "The tabs have formed a committee. Hide side note." : "Just one more tab. Reveal a side note."} aria-pressed={revealed} data-revealed={revealed} onClick={() => setRevealed(!revealed)}>
    <span className="note-front">Just one more tab. <i aria-hidden="true">↗</i></span>
    <span className="note-back">The tabs have formed a committee.</span>
  </button>;
}
