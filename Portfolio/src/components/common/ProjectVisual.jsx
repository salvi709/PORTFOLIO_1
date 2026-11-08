import React, { useState } from "react";
import { projectMedia } from "../../data/media";
export default function ProjectVisual({ project, decorative = false }) {
  const asset = projectMedia[project.id];
  const [failed, setFailed] = useState(false);
  if (asset?.image && !failed)
    return (
      <img
        className="project-image"
        src={asset.image}
        alt={decorative ? "" : project.title + " preview"}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  if (project.id === "splitzy")
    return (
      <div className="project-art splitzy-art" aria-hidden="true">
        <span className="art-caption">
          LESS MATH.
          <br />
          MORE MEMORIES.
        </span>
        <div className="phone">
          <div className="phone-notch" />
          <div className="phone-top">
            splitzy<span>↗</span>
          </div>
          <small>THE WEEKEND PLAN</small>
          <h4>
            Good times.
            <br />
            All settled.
          </h4>
          <div className="balance">
            <small>GROUP TOTAL</small>
            <strong>
              ₹ 4,850<span>.00</span>
            </strong>
            <div className="avatars">
              <i>S</i>
              <i>A</i>
              <i>R</i>
              <i>+1</i>
            </div>
          </div>
          <div className="expense">
            <span>Dinner with friends</span>
            <b>₹2,400</b>
          </div>
          <div className="expense">
            <span>The ride home</span>
            <b>₹1,250</b>
          </div>
          <div className="expense">
            <span>Coffee & groceries</span>
            <b>₹1,200</b>
          </div>
          <div className="settle">
            Settle up <span>↗</span>
          </div>
        </div>
        <span className="art-foot">A LITTLE LESS COMPLICATED.</span>
      </div>
    );
  if (project.id === "bis-sahayak")
    return (
      <div className="project-art bis-art" aria-hidden="true">
        <div className="assistant-window">
          <div className="window-heading">
            BIS <b>Sahayak</b>
            <span>01 / CONCEPT</span>
          </div>
          <h4>
            A clearer path
            <br />
            through standards.
          </h4>
          <div className="query-line">
            Find the standard. Understand the next step. <span>↗</span>
          </div>
          <div className="answer-lines">
            <i />
            <i />
            <i />
          </div>
          <small>SEARCH → CONTEXT → CLARITY</small>
        </div>
      </div>
    );
  if (project.id === "trade-quest")
    return (
      <div className="project-art trade-art" aria-hidden="true">
        <div className="trading-window">
          <div className="window-heading">
            TRADE QUEST<span>PAPER TRADING / CONCEPT</span>
          </div>
          <small>LEARN BY DOING</small>
          <h4>
            Your next move
            <br />
            starts here.
          </h4>
          <svg viewBox="0 0 600 150">
            <path
              d="M0 130 L35 110 L65 120 L95 85 L135 100 L175 70 L205 85 L240 45 L285 75 L320 60 L350 90 L400 40 L430 50 L465 20 L510 40 L550 10 L600 5"
              fill="none"
              stroke="#adadad"
              strokeWidth="3"
            />
            <path
              d="M0 149H600 M0 100H600 M0 50H600"
              stroke="#adadad"
              strokeOpacity=".1"
            />
          </svg>
          <small>EXPLORE · PRACTICE · UNDERSTAND</small>
        </div>
      </div>
    );
  const type = project.previewType;
  return (
    <div className={"project-art film-art " + type} aria-hidden="true">
      <div className="film-lines" />
      <span className="film-index">{project.number} / A STUDY IN MOTION</span>
      <div className="film-title">
        {type === "urban-pulse" ? (
          <>
            after
            <br />
            <em>hours.</em>
          </>
        ) : type === "short-form" ? (
          <>
            MAKE
            <br />
            <em>it move.</em>
          </>
        ) : type === "motion-experiment" ? (
          <em>Synapse</em>
        ) : (
          <>
            The
            <br />
            <em>in-between.</em>
          </>
        )}
      </div>
      <span className="film-bottom">
        VISUAL STUDY<span>24 / FPS</span>
      </span>
    </div>
  );
}
