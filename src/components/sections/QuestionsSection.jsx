import React, { useRef, useState } from "react";
import useContentRefresh from "../../hooks/useContentRefresh";
import SectionHeader from "../common/SectionHeader";

const questions = [
  ["What exactly do you do?", "I build websites and digital products, explore AI and data, design interfaces, and edit videos. Different tools; the same habit of asking ‘what if?’"],
  ["Can you build a website for me?", "Yes. I can help with design and development. Tell me what it needs to do, who it’s for, and what you have in mind. We’ll work out the scope before giving the pixels instructions."],
  ["Do you edit videos too?", "Yes. I work on edits, visual storytelling, and creative content. The timeline is a different kind of canvas. Same attention to the details."],
  ["Can you handle design and development?", "Yes. I enjoy connecting how something looks with how it actually works. A good-looking button should also take you somewhere."],
  ["What gets your attention?", "Creative websites, useful digital products, AI-powered ideas, interesting interfaces, and experiments with a good question behind them. ‘This might be a strange idea’ is a perfectly good opening sentence."],
  ["Open to freelance work or collaborations?", "I’m open to discussing suitable projects and collaborations. Send a little context and your timing, and we can see whether it’s a good fit."],
  ["How do we start a conversation?", <>Use the <a href="#contact">contact form below</a>, email me directly, or reach out through my listed social links. A rough idea is enough. It doesn’t need a slide deck.</>],
];

export default function QuestionsSection() {
  const [open, setOpen] = useState(null);
  const [visited, setVisited] = useState(() => new Set());
  const root = useRef(null);
  useContentRefresh(root);
  return <section id="questions" ref={root} className="portfolio-section questions-section" data-story-extra>
    <SectionHeader number="11" category="7 QUESTIONS // BEFORE YOU ASK" title="YOU HAVE QUESTIONS." accentWord="I have questionable answers." />
    <p className="questions-intro">Seven answers. Suspiciously few tangents.</p>
    <div className="question-list">
      {questions.map(([question, answer], i) => <div className="question-item" key={question} data-open={open === i}>
        <h3><button id={`question-${i}`} type="button" aria-expanded={open === i} aria-controls={`answer-${i}`} onClick={() => {
          setOpen(open === i ? null : i);
          setVisited(previous => new Set([...previous, i]));
        }}><span className="question-index">0{i + 1}</span><span>{question}</span><span className="question-sign" aria-hidden="true" /></button></h3>
        <div id={`answer-${i}`} role="region" aria-labelledby={`question-${i}`} className="question-answer" aria-hidden={open !== i} inert={open !== i ? "" : undefined}>
          <div><p>{answer}</p></div>
        </div>
      </div>)}
    </div>
    <p className="questions-postscript" aria-live="polite">{visited.size === 7 ? "You read all seven. We can skip the small talk." : "Still have a question? There’s room for number eight below."}</p>
  </section>;
}
