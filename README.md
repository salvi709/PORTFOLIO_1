# Sarthak Salvi — BUILD × CREATE

The existing React / Vite / Tailwind / GSAP portfolio, with a warm off-white photographic opening, a scroll-driven transition to near-black, and restrained acid-yellow accents. Instrument Serif and Manrope are served locally with their OFL licenses.

## Run

- `npm install`
- `npm run dev` — http://127.0.0.1:3000
- `npm run build`
- `npm run preview`
- `npx tsc --noEmit` — checks the TypeScript UI components

The existing `src/components/ui` directory, `@` alias, Tailwind configuration and `components.json` support shadcn-style TypeScript components without changing the React architecture.

## Experience

- The supplied liquid shader runs as a brief monochrome entry layer. It is lazy-loaded, does not lock scrolling, dismisses on scroll, and disposes its renderer on exit. Reduced motion skips it.
- The portrait preserves its 9:16 aspect ratio. It stays paused; page scroll sets `currentTime` continuously and reversibly. One seek runs at a time, always catching up to the latest requested position.
- From 700px wide, the portrait precedes the existing Build → browser-to-film → Create → convergence → WorksWheel timeline. It reaches its final frame before the background fades through gray into near-black.
- Phones use a simpler portrait composition and pinned scrub, followed by the existing readable story sections and document-scroll wheel. Reduced motion presents a static portrait, unpinned story and seven accessible project entries.
- Two diagonal marquees cross at the convergence and move in opposite directions with scroll. The original wheel projection and project-selection behavior remain; front cards use larger size inputs.
- Native dialogs retain Escape, focus restoration, previous/next controls, arrow-key navigation and background scroll locking. Contact retains email, clipboard copying and social links.
- The interactive grid, cursor feedback, section reveals and personal content remain. Hero pointer parallax is limited to fine-pointer desktop devices.

## Source and assets

- `src/data/portfolioData.js`: existing copy, skills, ordering, email and social URLs.
- `src/data/media.js`: portrait and project media paths. Missing project media retains conceptual artwork.
- `src/components/scroll-story/EditorialHero.jsx`: new portrait composition.
- `src/components/scroll-story/ScrollStory.jsx`: existing choreography with the portrait chapter prepended.
- `src/hooks/useScrubVideo.js`: paused video seeking and cleanup.
- `src/components/scroll-story/MarqueeMerge.jsx`: crossing strips.
- `src/components/ui/liquid-shader.tsx`: supplied shader adapted for the entry; a standalone demo is alongside it.
- `src/components/ui/works-wheel.tsx`: original ring-to-drum geometry with enlarged card dimensions.
- `src/styles/editorial.css`: new identity, loaded after the existing base and polish layers.

The supplied eight-second portrait is encoded at 24 fps with keyframes every six frames: 540 × 960 desktop (~1.03 MB), 360 × 640 mobile (~0.46 MB), no audio, fast-start MP4. The original remains in `public/media/portrait-original.mp4`. The About portrait is extracted from the final pose. `review/editorial/prepare-video.py` documents encoding.

Old hero, atmosphere and robot source files remain available but are not active.

## Review

The source, assets, configuration and hash manifest before this identity pass are in `checkpoints/before-editorial-20261007/`.

`review/editorial/` contains before/after screenshots and local Playwright checks. `check.cjs` captures desktop, tablet, mobile and reduced-motion layouts. `interactions.cjs` checks seeking, stopped playback, reversal, all seven dialogs, keyboard navigation, focus restoration and breakpoint teardown. These scripts use this machine's bundled Playwright and Edge; no testing dependency was added to the app. Their local preview URL is currently port 3001.

Earlier review artifacts and checkpoints remain for comparison.

## Cinematic motion refinement — 8 October 2026

The existing identity and downstream sections are unchanged. `src/components/scroll-story/heroMotion.js` coordinates the same hero chapter on desktop and mobile:

1. Face framing scales continuously from 2.2× to 1× while the video stays on its first frame.
2. The full portrait then scrubs through its eight-second source.
3. The portrait dissolves on its matching light canvas.
4. Three sequential editorial quotes accompany the slower white → gray → charcoal → black transition into Build.

The supplied video has an opaque background. Keeping the subject visible against arbitrary dark backgrounds would require a proper alpha matte; the implementation deliberately completes its dissolve before darkening begins. No chroma/luma key, body masking, or animated filters are used. Close-up detail is limited by the original 720 × 1280 source.

The opening keeps the same liquid shader and now lasts 3.3 seconds (about 1.5 seconds longer), with proportionally slower shader time and exit. Scrolling still dismisses it immediately.

Active scrub assets use H.264, 24 fps, every frame a keyframe, no B frames or audio, and fast-start metadata: `portrait-scrub-intra.mp4` at 720 × 1280 (~4.45 MB), and `portrait-mobile-intra.mp4` at 540 × 960 (~2.55 MB). The larger download is a deliberate tradeoff for sharp close-ups and independent reverse seeks. `review/cinematic/encode.py` reproduces them. Old encodes and the original are retained.

The seek scheduler waits for first-frame readiness, deduplicates requests within each actual 24 fps video frame, processes one decoder seek at a time, and uses frame-presentation callbacks where supported. It has no scroll catch-up easing. Frame rounding reflects the source's actual temporal resolution, not scene-based snapping. The existing single wheel listener and 0.60 sensitivity remain; a fractional-delta leak is fixed. The grid's incorrect Y midpoint also now uses Y coordinates, restoring the existing mesh instead of stray curves.

`checkpoints/before-cinematic-20261008/` preserves the pre-change source/assets. `review/cinematic/verify.cjs`, `final-check.cjs`, and their results cover zoom/playback ordering, forward and reverse scrubbing, stopped playback, quote states, responsive layouts, reduced motion, resize cleanup and project navigation. `preserved.json` confirms unchanged downstream component files and Build/Create/marquee/gallery choreography. Browser checks use the local preview on port 3001.
