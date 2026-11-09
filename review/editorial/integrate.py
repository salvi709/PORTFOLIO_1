from pathlib import Path
p=Path('src/components/scroll-story/ScrollStory.jsx')
s=p.read_text()
s=s.replace('import SceneHero from "./SceneHero";', 'import SceneHero from "./EditorialHero";').replace('import SceneMerge from "./SceneMerge";', 'import SceneMerge from "./MarqueeMerge";').replace('import AtmosphericBackground from "../common/AtmosphericBackground";','')
s=s.replace('const DURATION = GALLERY_START + GALLERY_DURATION;', 'const HERO_OFFSET = 3.4;\nconst DURATION = HERO_OFFSET + GALLERY_START + GALLERY_DURATION;')
s=s.replace('introDone = useRef(false)', 'videoUpdate = useRef(null)')
s=s.replace('(GALLERY_START + progress * GALLERY_DURATION) / DURATION', '(HERO_OFFSET + GALLERY_START + progress * GALLERY_DURATION) / DURATION')
start=s.index('    let intro, active')
end=s.index('      const gallery =',start)
s=s[:start]+'''    let active = true, refreshFrame = 0;
    const theme = light => { document.documentElement.dataset.theme = light ? "light" : "dark"; };
    const context = gsap.context(() => {
      if (!cinematic) {
        const hero = rootNode.querySelector(".editorial-hero");
        const clock = { value: 0 };
        if (!reduced) {
          gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: () => `+=${innerHeight * 1.5}`, pin: true, scrub: true, invalidateOnRefresh: true,
            onUpdate: self => { videoUpdate.current?.(Math.min(1, self.progress / .82)); theme(self.progress < .9); },
          } })
            .to(clock, { value: 1, duration: 1, ease: "none" }, 0)
            .to(".hero-fragment", { y: -55, autoAlpha: 0, stagger: .025, duration: .35 }, .4)
            .to(".hero-copy,.portrait-composition,.hero-bottom,.creative-development", { autoAlpha: 0, duration: .14 }, .84)
            .to(hero, { backgroundColor: "#080808", duration: .16, ease: "none" }, .84);
          gsap.fromTo(".build-track", { xPercent: -15 }, { xPercent: 0, ease: "none", scrollTrigger: { trigger: ".scene-merge", start: "top bottom", end: "bottom top", scrub: true } });
          gsap.to(".create-track", { xPercent: -15, ease: "none", scrollTrigger: { trigger: ".scene-merge", start: "top bottom", end: "bottom top", scrub: true } });
        }
        ScrollTrigger.create({ trigger: hero, start: "top top", end: "bottom top", onToggle: self => theme(self.isActive), onRefresh: self => theme(self.isActive || scrollY < 2) });
        return;
      }
''' +s[end:]
s=s.replace('const time = master.current?.time() || 0;', 'const elapsed = master.current?.time() || 0;\n        const time = elapsed - HERO_OFFSET;\n        videoUpdate.current?.(Math.min(1, elapsed / 3.6));\n        theme(elapsed < 3.85);')
s=s.replace('start: "top top", scrub: 0.6', 'start: "top top", scrub: true')
s=s.replace('Math.max(innerHeight * 2, reading - innerHeight)', 'Math.max(innerHeight * 2, reading - innerHeight) + innerHeight * 1.5')
s=s.replace('          onUpdate: finishIntro,\n','')
s=s.replace('      master.current = timeline;\n      timeline.addLabel', '''      master.current = timeline;
      const story = gsap.timeline({ defaults: { ease: "none" } });
      timeline
        .to(".hero-fragment", { y: (i) => [-65, 40, -35, 65, 30][i], x: (i) => [-35, 35, 45, 30, -25][i], rotation: (i) => [-3, 3, 2, -2, 2][i], duration: 2.8 }, 0)
        .to(".fragment-product,.fragment-data", { scale: 1.1, duration: 1.2 }, 1.2)
        .to(".hero-copy", { y: -35, autoAlpha: 0, duration: .65 }, 2.85)
        .to(".hero-fragment,.creative-development,.hero-bottom", { autoAlpha: 0, duration: .55 }, 3)
        .to(".portrait-composition", { autoAlpha: 0, y: -15, duration: .45 }, 3.6)
        .to(stageNode, { backgroundColor: "#080808", duration: .8, ease: "none" }, 3.6)
        .to(".scene-hero", { autoAlpha: 0, duration: .2 }, 4.05);
      story.addLabel''')
start=s.index('      timeline\n        // The name')
end=s.index('        .fromTo(".scene-build"',start)
s=s[:start]+'      story\n'+s[end:]
s=s.replace('.from(".merge-build", { x: -100, y: -24, letterSpacing: ".05em", clipPath: "inset(0 0 100% 0)", duration: .9 }, 5.3)', '.from(".merge-build", { x: -100, opacity: 0, duration: .65 }, 5.3)\n        .fromTo(".build-track", { xPercent: -15 }, { xPercent: 0, duration: 2 }, 5.3)')
s=s.replace('.from(".merge-create", { x: 100, y: 24, letterSpacing: ".055em", clipPath: "inset(100% 0 0 0)", duration: .9 }, 5.3)', '.from(".merge-create", { x: 100, opacity: 0, duration: .65 }, 5.3)\n        .to(".create-track", { xPercent: -15, duration: 2 }, 5.3)')
s=s.replace('        .to(".story-progress", { scaleX: 1, ease: "none", duration: DURATION }, 0);', ';\n      timeline.add(story, HERO_OFFSET);\n      timeline.to(".story-progress", { scaleX: 1, ease: "none", duration: DURATION }, 0);')
s=s.replace('    window.addEventListener("scroll", finishIntro, { passive: true });','')
s=s.replace('      window.removeEventListener("scroll", finishIntro); ', '      ')
s=s.replace('    rootNode.addEventListener("load", refresh, true);','    rootNode.addEventListener("load", refresh, true);\n    rootNode.addEventListener("loadedmetadata", refresh, true);')
s=s.replace('      context.revert(); master.current = null;', '      rootNode.removeEventListener("loadedmetadata", refresh, true);\n      context.revert(); master.current = null; delete document.documentElement.dataset.theme;')
s=s.replace('        <AtmosphericBackground />\n        <SceneHero />','        <SceneHero videoController={videoUpdate} />')
p.write_text(s)

# Retain the original wheel projection; enlarge only its card-size inputs.
p=Path('src/components/ui/works-wheel.tsx');s=p.read_text().replace('const CARD_H = 0.38','const CARD_H = 0.46').replace('const CARD_MAX_W = 0.35','const CARD_MAX_W = 0.43');p.write_text(s)
p=Path('src/main.jsx');s=p.read_text().replace('import "./styles/polish.css";', 'import "./styles/polish.css";\nimport "./styles/editorial.css";');p.write_text(s)

# Existing generated illustrations and legacy utility names share the new tokens.
mapping={'#030305':'#080808','#07070A':'#0C0C0C','#0C0C11':'#121212','#121219':'#1A1A1A','#171722':'#202020','#1E1E2B':'#292929','#FAF9FC':'#F7F7F3','#C4C0CA':'#A5A5A0','#85808D':'#81817B','#4D4856':'#555550','#735CFF':'#DFFF00','#8B78FF':'#E8FF5D','#B8AEFF':'#E8EDC5','#4D38D6':'#A6BA25','#2A1F78':'#373C20','#FF7466':'#DFFF00','#FF543D':'#E8FF5D','115, 92, 255':'223, 255, 0'}
for name in ['tailwind.config.js','src/data/wheelItems.js','src/components/common/ProjectPreviewModal.jsx','src/index.css']:
 p=Path(name)
 if not p.exists(): continue
 s=p.read_text()
 for a,b in mapping.items(): s=s.replace(a,b).replace(a.lower(),b)
 if name=='tailwind.config.js': s=s.replace('"Fuzamic", "Modero", "sans-serif"','"Instrument Serif", "Georgia", "serif"').replace('"Modero", ', '').replace('["sans-serif"]','["Manrope", "sans-serif"]')
 p.write_text(s)
p=Path('src/components/common/InteractiveGrid.jsx');s=p.read_text().replace('175,165,215','175,175,165').replace('185,175,235','185,185,175').replace('175, 165, 215','175, 175, 165').replace('185, 175, 235','185, 185, 175');p.write_text(s)
