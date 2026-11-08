import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SceneHero from "./EditorialHero";
import { addHeroMotion, videoProgress, HERO_END, HERO_OFFSET } from "./heroMotion";
import SceneBuild from "./SceneBuild";
import SceneCreate from "./SceneCreate";
import SceneMerge from "./MarqueeMerge";

import ProjectVisual from "../common/ProjectVisual";
import WorkDialog from "../common/WorkDialog";
import SelectedWork from "../sections/SelectedWork";
import useMediaQuery from "../../hooks/useMediaQuery";
import { developmentProjects, videoProjects, galleryOrder } from "../../data/portfolioData";

gsap.registerPlugin(ScrollTrigger);
const SCRUB_QUERY = "(min-width: 700px) and (prefers-reduced-motion: no-preference)";
const GALLERY_START = 7.9;
const GALLERY_DURATION = galleryOrder.length * 1.15;
const DURATION = HERO_OFFSET + GALLERY_START + GALLERY_DURATION;

export default function ScrollStory() {
  const root = useRef(null), stage = useRef(null), master = useRef(null);
  const wheelUpdate = useRef(null), wheelProgress = useRef(0), videoUpdate = useRef(null);
  const [selected, setSelected] = useState(null);
  const cinematic = useMediaQuery(SCRUB_QUERY);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const navigateGallery = useCallback((index = -1) => {
    const timeline = master.current;
    if (!timeline?.scrollTrigger) return;
    const progress = index < 0 ? 0 : (index + 1) / (galleryOrder.length + .3);
    const trigger = timeline.scrollTrigger;
    trigger.scroll(trigger.start + (trigger.end - trigger.start) * (HERO_OFFSET + GALLERY_START + progress * GALLERY_DURATION) / DURATION);
    ScrollTrigger.update();
  }, []);

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
      const gallery = stageNode.querySelector(".selected-work");
      const scenes = [...stageNode.querySelectorAll(".scene")];
      const bridgeButtons = [...stageNode.querySelectorAll(".bridge-open")];
      const clock = { value: 0 };
      let previousPhase = "", previousReady = null;
      const sync = () => {
        const elapsed = master.current?.time() || 0;
        const time = elapsed - HERO_OFFSET;
        videoUpdate.current?.(videoProgress(elapsed));
        rootNode.querySelector(".editorial-hero").dataset.floating = String(elapsed > .8 && elapsed < 4.9);
        theme(elapsed < 7.55);
        wheelProgress.current = clock.value;
        wheelUpdate.current?.(clock.value);
        const phase = time < .95 ? "hero" : time < 2.85 ? "build" : time < 5.2 ? "create" : time < 7.05 ? "merge" : "gallery";
        if (phase !== previousPhase) {
          previousPhase = phase; stageNode.dataset.phase = phase;
          const selectedIndex = ["hero", "build", "create", "merge"].indexOf(phase);
          scenes.forEach((el, i) => { el.inert = i !== selectedIndex; el.setAttribute("aria-hidden", String(i !== selectedIndex)); });
          gallery.inert = phase !== "gallery";
          gallery.setAttribute("aria-hidden", String(phase !== "gallery"));
        }
        const ready = time >= 6.8 && time < 7.2;
        if (previousReady !== ready) {
          previousReady = ready; stageNode.classList.toggle("gallery-ready", ready);
          bridgeButtons.forEach(el => { el.tabIndex = ready ? 0 : -1; el.inert = !ready; el.setAttribute("aria-hidden", String(!ready)); });
        }
      };
      const timeline = gsap.timeline({
        defaults: { ease: "none" }, onUpdate: sync,
        scrollTrigger: {
          id: "portfolio-story", trigger: rootNode, pin: stageNode,
          start: "top top", scrub: true, invalidateOnRefresh: true,
          // Preserve the existing pixels per story unit. Only the new zoom and
          // quote chapters add distance; Build/Create/gallery pacing is unchanged.
          end: () => {
            // New reading content must not stretch the established cinematic timeline.
            const reading = [...document.querySelectorAll(".portfolio-section:not([data-story-extra]),.site-footer")].reduce((sum, el) => sum + el.offsetHeight - [...el.querySelectorAll("[data-story-extra]")].reduce((extra, node) => extra + node.offsetHeight, 0), 0);
            return `+=${(Math.max(innerHeight * 2, reading - innerHeight) + innerHeight * 1.5) * DURATION / 15.36}`;
          },
          onRefresh: () => { sync(); },
        },
      });
      master.current = timeline;
      const story = gsap.timeline({ defaults: { ease: "none" } });
      const underlay = document.getElementById("bg-underlay") || stageNode;
      addHeroMotion(timeline, rootNode, underlay);
      story.addLabel("hero", 0).addLabel("build", 1.25).addLabel("transform", 2.65).addLabel("create", 3.6).addLabel("converge", 5.3).addLabel("connect", 6.6).addLabel("gallery", GALLERY_START);
      gsap.set(".scene-build,.scene-create,.scene-merge,.story-frame,.echo-frame,.edit-tracks,.film-layer,.gallery-cue,.embedded-work", { autoAlpha: 0 });
      const portrait = () => innerWidth < 1000 && innerHeight > innerWidth * .85;
      const frameTarget = index => {
        const wheel = stageNode.querySelector(".works-wheel");
        const rect = wheel?.getBoundingClientRect(), origin = stageNode.getBoundingClientRect();
        // Derive the ring from its resting geometry, even if refresh occurs
        // while the live cards are halfway through the drum animation.
        const radius = Number(wheel?.dataset.ringRadius), width = Number(wheel?.dataset.ringWidth), height = Number(wheel?.dataset.ringHeight);
        const angle = index * Math.PI * 2 / galleryOrder.length;
        return rect && width ? { left: rect.left - origin.left + rect.width / 2 + Math.sin(angle) * radius - width / 2, top: rect.top - origin.top + rect.height / 2 - Math.cos(angle) * radius - height / 2, width, height } : { left: innerWidth * .4, top: innerHeight * .35, width: innerWidth * .18, height: innerHeight * .14 };
      };
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
        .to(".gallery-cue", { autoAlpha: 1, duration: .4 }, 6.7)
        .to(".gallery-cue", { autoAlpha: 0, y: -18, duration: .35 }, 7.12)
        .to(".echo-frame", { left: () => frameTarget(0).left, top: () => frameTarget(0).top, width: () => frameTarget(0).width, height: () => frameTarget(0).height, rotation: 0, duration: 1.05 }, 6.7)
        .to(".story-frame", { left: () => frameTarget(1).left, top: () => frameTarget(1).top, width: () => frameTarget(1).width, height: () => frameTarget(1).height, rotation: 360 / galleryOrder.length, duration: 1.05 }, 6.7)
        .to(".embedded-work", { autoAlpha: 1, duration: .65 }, 7.25)
        .to(".story-frame,.echo-frame", { autoAlpha: 0, duration: .25 }, 7.65)
        .fromTo(clock, { value: 0 }, { value: 1, ease: "none", duration: GALLERY_DURATION }, GALLERY_START)
;
      timeline.add(story, HERO_OFFSET);
      timeline.to(".story-progress", { scaleX: 1, ease: "none", duration: DURATION }, 0);
      sync();
    }, root);
    const onWorkLink = e => {
      if (!cinematic || e.defaultPrevented || !e.target.closest('a[href="#work"]')) return;
      e.preventDefault(); navigateGallery();
    };

    document.addEventListener("click", onWorkLink);
    const refresh = () => { if (active) { ScrollTrigger.refresh(); if (location.hash === "#work" && cinematic && scrollY < 2) navigateGallery(); } };
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
  }, [cinematic, reduced, navigateGallery]);
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

        <div className="gallery-cue">
          <p className="eyebrow">04 / THE IDEAS BECOME THE WORK</p>
          <p>
            SELECTED <em>WORK</em>
          </p>
          <a className="text-link" href="#work">
            Explore the collection <span>↓</span>
          </a>
        </div>

        <div className="story-progress" aria-hidden="true" />
        {cinematic && <SelectedWork embedded controller={wheelUpdate} progressSource={wheelProgress} onNavigate={navigateGallery} />}
      </div>

      {selected && (
        <WorkDialog
          item={selected}
          onClose={() => setSelected(null)}
          onSelectNext={setSelected}
        />
      )}
    </div>
    {!cinematic && <SelectedWork />}
    </>
  );
}

