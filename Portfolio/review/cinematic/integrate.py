from pathlib import Path
p=Path('src/components/scroll-story/ScrollStory.jsx')
s=p.read_text()
s=s.replace('import SceneHero from "./EditorialHero";', 'import SceneHero from "./EditorialHero";\nimport { addHeroMotion, videoProgress, HERO_END, HERO_OFFSET } from "./heroMotion";')
s=s.replace('const HERO_OFFSET = 3.4;\n','')
a=s.index('        const clock = { value: 0 };');b=s.index('          gsap.fromTo(".build-track"',a)
s=s[:a]+'''        if (!reduced) {
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
          addHeroMotion(heroTimeline, hero, hero);
''' +s[b:]
s=s.replace('videoUpdate.current?.(Math.min(1, elapsed / 3.6));\n        theme(elapsed < 3.85);', 'videoUpdate.current?.(videoProgress(elapsed));\n        rootNode.querySelector(".editorial-hero").dataset.floating = String(elapsed > .8 && elapsed < 4.9);\n        theme(elapsed < 7.55);')
s=s.replace('Math.max(innerHeight * 2, reading - innerHeight) + innerHeight * 1.5', '(Math.max(innerHeight * 2, reading - innerHeight) + innerHeight * 1.5) * DURATION / 15.36')
a=s.index('      timeline\n        .to(".hero-fragment"');b=s.index('      story.addLabel',a)
s=s[:a]+'      addHeroMotion(timeline, rootNode, stageNode);\n'+s[b:]
s=s.replace('          // The pin is sized against the real reading portion of the page. Its\n          // single stage + scroll distance occupies roughly half the journey.', '          // Preserve the existing pixels per story unit. Only the new zoom and\n          // quote chapters add distance; Build/Create/gallery pacing is unchanged.')
p.write_text(s)
p=Path('src/components/common/EntryTransition.jsx');s=p.read_text().replace('1850','3350');p.write_text(s)
p=Path('src/styles/editorial.css');s=p.read_text().replace('animation:entry-out .45s ease 1.35s both','animation:entry-out .8s ease 2.5s both');p.write_text(s)
