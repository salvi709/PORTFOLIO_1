import React, { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SceneHero from "./EditorialHero";
import { addHeroMotion, videoProgress, HERO_END, HERO_OFFSET } from "./heroMotion";
import SceneBuild from "./SceneBuild";
import SceneCreate from "./SceneCreate";
import SceneMerge from "./MarqueeMerge";

import ProjectVisual from "../common/ProjectVisual";
import WorkDialog from "../common/WorkDialog";
import useMediaQuery from "../../hooks/useMediaQuery";
import { developmentProjects, videoProjects } from "../../data/portfolioData";

gsap.registerPlugin(ScrollTrigger);
const SCRUB_QUERY = "(min-width: 700px) and (prefers-reduced-motion: no-preference)";
const STORY_END = 7.3;
const DURATION = HERO_OFFSET + STORY_END;

export default function ScrollStory() {
  const root = useRef(null), stage = useRef(null), master = useRef(null);
  const videoUpdate = useRef(null);
  const [selected, setSelected] = useState(null);
  const cinematic = useMediaQuery(SCRUB_QUERY);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  useLayoutEffect(() => {
    const rootNode = root.current, stageNode = stage.current;
    let active = true, refreshFrame = 0;
    const theme = light => { document.documentElement.dataset.theme = light ? "light" : "dark"; };
    const context = gsap.context(() => {
      if (!cinematic) {
        const hero = rootNode.querySelector(".editorial-hero");
        if (!reduced) {
          const clock = { value: 0 };
          const syncHero = () => {
            videoUpdate.current?.(videoProgress(clock.value));
            hero.dataset.floating = String(clock.value > .8 && clock.value < 4.9);
            theme(clock.value < 7.55);
          };
          const heroTimeline = gsap.timeline({ defaults: { ease: "none" }, onUpdate: syncHero, scrollTrigger: {
            id: "portrait-story", trigger: hero, start: "top top", end: () => `+=${innerHeight * 2.35}`, pin: true, scrub: true, invalidateOnRefresh: true, onRefresh: syncHero,
          } });
          heroTimeline.to(clock, { value: HERO_END, duration: HERO_END }, 0);
          const underlay = document.getElementById("bg-underlay") || hero;
          addHeroMotion(heroTimeline, hero, underlay);
          gsap.fromTo(".build-track", { xPercent: -15 }, { xPercent: 0, ease: "none", scrollTrigger: { trigger: ".scene-merge", start: "top bottom", end: "bottom top", scrub: true } });
          gsap.to(".create-track", { xPercent: -15, ease: "none", scrollTrigger: { trigger: ".scene-merge", start: "top bottom", end: "bottom top", scrub: true } });
        } else {
          const syncTheme = self => theme(scrollY < self.end);
          ScrollTrigger.create({ trigger: hero, start: "top top", end: () => hero.getBoundingClientRect().top + scrollY + hero.clientHeight, onUpdate: syncTheme, onRefresh: syncTheme });
        }
        return;
      }
      const scenes = [...stageNode.querySelectorAll(".scene")];
      const bridgeButtons = [...stageNode.querySelectorAll(".bridge-open")];
      let previousPhase = "", previousReady = null;
      const sync = () => {
        const elapsed = master.current?.time() || 0;
        const time = elapsed - HERO_OFFSET;
        videoUpdate.current?.(videoProgress(elapsed));
        rootNode.querySelector(".editorial-hero").dataset.floating = String(elapsed > .8 && elapsed < 4.9);
        theme(elapsed < 7.55);
        const phase = time < .95 ? "hero" : time < 2.85 ? "build" : time < 5.2 ? "create" : "merge";
        if (phase !== previousPhase) {
          previousPhase = phase; stageNode.dataset.phase = phase;
          const selectedIndex = ["hero", "build", "create", "merge"].indexOf(phase);
          scenes.forEach((el, i) => { el.inert = i !== selectedIndex; el.setAttribute("aria-hidden", String(i !== selectedIndex)); });
        }
        const ready = time >= 6.4 && time < 7.0;
        if (previousReady !== ready) {
          previousReady = ready;
          bridgeButtons.forEach(el => { el.tabIndex = ready ? 0 : -1; el.inert = !ready; el.setAttribute("aria-hidden", String(!ready)); });
        }
      };
      const timeline = gsap.timeline({
        defaults: { ease: "none" }, onUpdate: sync,
        scrollTrigger: {
          id: "portfolio-story", trigger: rootNode, pin: stageNode,
          start: "top top", scrub: true, invalidateOnRefresh: true,
          end: () => `+=${Math.max(innerHeight * 2.8, 1800)}`,
          onRefresh: () => { sync(); },
        },
      });
      master.current = timeline;
      const story = gsap.timeline({ defaults: { ease: "none" } });
      const underlay = document.getElementById("bg-underlay") || stageNode;
      addHeroMotion(timeline, rootNode, underlay);
      story.addLabel("hero", 0).addLabel("build", 1.25).addLabel("transform", 2.65).addLabel("create", 3.6).addLabel("converge", 5.3).addLabel("connect", 6.6);
      gsap.set(".scene-build,.scene-create,.scene-merge,.story-frame,.echo-frame,.edit-tracks,.film-layer", { autoAlpha: 0 });
      const portrait = () => innerWidth < 1000 && innerHeight > innerWidth * .85;
      story
        .fromTo(".scene-build", { clipPath: "inset(0 0 100% 0)" }, { autoAlpha: 1, clipPath: "inset(0 0 0% 0)", duration: .8 }, .8)
        .from(".scene-build h2", { x: -38, duration: .65 }, 1.1)
        .fromTo(".story-frame", { xPercent: 16, scale: .85, rotation: 3, clipPath: "inset(0 0 100% 0)" }, { xPercent: 0, scale: 1, rotation: -2, autoAlpha: 1, clipPath: "inset(0 0 0% 0)", duration: 1 }, 1.05)
        .from(".browser-chrome", { y: -28, duration: .5 }, 1.2)
        .from(".story-frame .phone", { y: 60, rotation: 9, opacity: 0, duration: .85 }, 1.45)
        .from(".story-frame .balance,.story-frame .expense", { y: 18, opacity: 0, stagger: .08, duration: .5 }, 1.65)
        .fromTo(".code-fragment", { y: 35, x: -25, autoAlpha: 0 }, { y: 0, x: 0, autoAlpha: 1, duration: .65 }, 1.05)
        .to(".code-fragment", { y: 65, x: 50, autoAlpha: 0, clipPath: "inset(0 0 100% 0)", duration: .6 }, 2.55)
        .to(".scene-build", { clipPath: "inset(0 100% 0 0)", autoAlpha: 0, duration: .7 }, 2.6)
        .to(".story-frame", { left: "7%", top: () => portrait() ? "43%" : "29%", width: () => portrait() ? "70%" : "48%", height: () => `${(stageNode.clientWidth * (portrait() ? .7 : .48) * 9 / 16)}px`, rotation: 0, duration: 1.1 }, 2.55)
        .to(".browser-chrome", { y: -28, autoAlpha: 0, duration: .5 }, 2.7)
        .to(".browser-layer", { autoAlpha: 0, scale: 1.08, clipPath: "inset(12% 0 12% 0)", duration: .65 }, 2.9)
        .fromTo(".film-layer", { clipPath: "inset(50% 0 50% 0)" }, { autoAlpha: 1, clipPath: "inset(0% 0 0% 0)", duration: .75 }, 2.95)
        .fromTo(".scene-create", { clipPath: "inset(0 0 0 100%)" }, { autoAlpha: 1, clipPath: "inset(0 0 0 0)", duration: .7 }, 3.2)
        .fromTo(".edit-tracks", { y: -18, clipPath: "inset(0 0 100% 0)" }, { y: 0, autoAlpha: 1, clipPath: "inset(0 0 0% 0)", duration: .65 }, 3.35)
        .from(".edit-tracks i", { scaleX: .25, transformOrigin: "left center", stagger: .12, duration: .6 }, 3.45)
        .fromTo(".playhead", { left: "8%" }, { left: "92%", ease: "none", duration: 1.6 }, 3.5)
        .to(".scene-create", { autoAlpha: 0, y: -24, duration: .6 }, 5.1)
        .to(".edit-tracks", { y: -10, scaleY: .3, autoAlpha: 0, duration: .6 }, 5.1)
        .to(".story-frame", { left: "54%", top: "51%", width: "34%", height: "29%", rotation: 4, duration: 1 }, 5.15)
        .fromTo(".echo-frame", { xPercent: -75, rotation: -7 }, { xPercent: 0, autoAlpha: 1, rotation: -4, duration: 1 }, 5.15)
        .to(".scene-merge", { autoAlpha: 1, duration: .35 }, 5.25)
        .to(".story-frame,.echo-frame", { opacity: .12, duration: .4 }, 5.4)
        .to(".story-frame,.echo-frame", { opacity: 1, duration: .5 }, 6.6)
        .from(".merge-build", { x: -100, opacity: 0, duration: .65 }, 5.3)
        .fromTo(".build-track", { xPercent: -15 }, { xPercent: 0, duration: 2 }, 5.3)
        .from(".merge-create", { x: 100, opacity: 0, duration: .65 }, 5.3)
        .to(".create-track", { xPercent: -15, duration: 2 }, 5.3)
        .from(".merge-cross", { scale: .65, opacity: 0, duration: .55 }, 5.8)
        .from(".merge-line", { clipPath: "inset(0 0 100% 0)", y: 8, duration: .5 }, 5.95)
        .to(".scene-merge", { y: -55, scale: .88, autoAlpha: 0, duration: .7 }, 6.6)
        .to(".story-frame,.echo-frame", { autoAlpha: 0, duration: .5 }, 6.6);
      timeline.add(story, HERO_OFFSET);
      timeline.to(".story-progress", { scaleX: 1, ease: "none", duration: DURATION }, 0);
      sync();
    }, root);
    const onWorkLink = e => {
      if (!cinematic || e.defaultPrevented || !e.target.closest('a[href="#work"]')) return;
      e.preventDefault();
      const workEl = document.getElementById("work");
      if (workEl) workEl.scrollIntoView({ behavior: "smooth" });
    };

    document.addEventListener("click", onWorkLink);
    const refresh = () => { if (active) { ScrollTrigger.refresh(); } };
    document.fonts.ready.then(() => { if (active) refreshFrame = requestAnimationFrame(refresh); });
    rootNode.addEventListener("load", refresh, true);
    rootNode.addEventListener("loadedmetadata", refresh, true);
    return () => {
      active = false; cancelAnimationFrame(refreshFrame);
      document.removeEventListener("click", onWorkLink); rootNode.removeEventListener("load", refresh, true);
      rootNode.removeEventListener("loadedmetadata", refresh, true);
      context.revert(); master.current = null; delete document.documentElement.dataset.theme;
      rootNode.querySelectorAll("[inert],[aria-hidden]").forEach(el => { if (el.classList.contains("scene") || el.classList.contains("selected-work")) { el.inert = false; el.removeAttribute("aria-hidden"); } });
    };
  }, [cinematic, reduced]);
  return (
    <>
    <div id="hero" ref={root} className={`scroll-story ${cinematic ? "cinematic" : ""}`}>
      <div className="story-stage" ref={stage}>
        <SceneHero videoController={videoUpdate} />
        <SceneBuild />
        <SceneCreate />
        <SceneMerge />

        <div className="story-frame">
          <button
            className="bridge-open"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() =>
              setSelected({ type: "video", data: videoProjects[0] })
            }
          >
            <span>
              Cinematic Edit <b>Explore ↗</b>
            </span>
          </button>
          <div className="browser-layer" aria-hidden="true">
            <div className="browser-chrome">
              <i />
              <i />
              <i />
              <span>splitzy / a small idea, made real</span>
            </div>
            <ProjectVisual project={developmentProjects[0]} decorative />
          </div>
          <div className="film-layer" aria-hidden="true">
            <ProjectVisual project={videoProjects[0]} decorative />
          </div>
        </div>

        <div className="edit-tracks" aria-hidden="true">
          <div className="ruler">
            00:00 <span>00:08</span>
            <span>00:16</span>
            <span>00:24</span>
          </div>
          <div>
            <b>V1</b>
            <i>01 — THE ARRIVAL</i>
            <i>02 — THE MOMENT</i>
          </div>
          <div>
            <b>V2</b>
            <i>TITLE / AFTER HOURS</i>
          </div>
          <div>
            <b>A1</b>
            <i className="audio-track">∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿</i>
          </div>
          <span className="playhead" />
        </div>

        <div className="echo-frame">
          <ProjectVisual project={developmentProjects[0]} decorative />
          <button
            className="bridge-open"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() =>
              setSelected({ type: "dev", data: developmentProjects[0] })
            }
          >
            <span>
              Splitzy <b>View project ↗</b>
            </span>
          </button>
        </div>

        <div className="story-progress" aria-hidden="true" />
      </div>

      {selected && (
        <WorkDialog
          item={selected}
          onClose={() => setSelected(null)}
          onSelectNext={setSelected}
        />
      )}
    </div>
    </>
  );
}

