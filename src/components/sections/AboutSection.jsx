import React, { useRef, useState } from "react";
import { media } from "../../data/media";
import SectionHeader from "../common/SectionHeader";
import useSectionReveal from "../../hooks/useSectionReveal";
export default function AboutSection() {
  const section = useRef(null);
  useSectionReveal(section, ".portrait,.about-copy > p,.philosophy");
  const [failed, setFailed] = useState(false);
  return (
    <section ref={section} id="about" className="portfolio-section about-section">
      <SectionHeader
        number="07"
        category="BEHIND THE SCENE / THE PERSON IN THE PROCESS"
        title="ALSO"
        accentWord="human."
      />
      <div className="about-layout">
        <figure className="portrait">
          <div className="portrait-mat">
            {media.portrait.src && !failed ? (
              <img
                src={media.portrait.src}
                alt={media.portrait.alt}
                loading="lazy"
                onError={() => setFailed(true)}
              />
            ) : (
              <>
                <span className="portrait-initials">ss.</span>
                <span className="portrait-placeholder">PORTRAIT TO COME</span>
              </>
            )}
          </div>
          <figcaption>
            SARTHAK SALVI <span>INDIA / IST</span>
            <span className="about-exe-status"><i className="exe-dot" />Human.exe is responding. Mostly.</span>
          </figcaption>
        </figure>
        <div className="about-copy">
          <p className="about-intro">
            Somewhere between
            <br />a <em>semicolon</em> and a <em>scene cut.</em>
          </p>
          <p>
            I'm Sarthak, an AI & Data Science engineering student who enjoys
            building digital products and experimenting across development,
            design, and visual storytelling.
          </p>
          <p>
            I like taking an idea from that first “what if” to something people
            can actually see, use, or experience. Sometimes that means writing
            code. Sometimes it means finding the right frame.
          </p>
          <div className="philosophy">
            <p>
              Development lets me <b>build the idea.</b>
            </p>
            <p>
              Design gives it <b>identity.</b>
            </p>
            <p>
              Editing lets me <b>tell its story.</b>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

