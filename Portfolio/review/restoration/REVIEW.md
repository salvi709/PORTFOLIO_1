# Targeted restoration review

The existing ScrollStory and WorksWheel implementation was retained and restored. Desktop/tablet now share one native document-scroll timeline from hero through Build, Create, convergence and the ring-to-drum gallery. Phones retain the narrative and original wheel with shorter document-scroll pinning; reduced motion remains readable and unpinned.

## Verification

- Production `npm run build` passes.
- Production Edge checks pass at 1440×900, 1366×620, 768×1024, 390×844 and 320×640, with no horizontal page overflow or runtime errors.
- Seven sampled scroll positions return identical transforms, masks and opacity after forward/reverse navigation and remain stable while idle.
- The cinematic portion measures approximately 50% of the desktop page before About. The shared frame reaches 16:9, allowing for pixel/border rounding.
- All seven project previews, Edits navigation, keyboard focus containment, Escape and focus restoration pass.
- Repeated breakpoint and reduced-motion changes leave no duplicate pins. Development StrictMode checks confirm one master timeline; refreshing inside the drum preserves the exact reverse handoff geometry.
- Canvas instrumentation confirms approximately 22.8px maximum local displacement, unchanged distant vertices, spring return to neutral and no idle redraws. Measured mesh callbacks: 0.5ms median and 0.9ms p95 in this local headless run. This does not measure full GPU/compositor cost or guarantee 60fps on every device.
- Whole-word reveal stages, Build, Create, convergence, ring/drum, About, Skills, Contact and responsive layouts were visually inspected. A tablet sizing error, hero animation collision and small-phone label overlap were corrected during review.

Detailed machine results: `results.json`, `lifecycle-results.json`, `content-preservation.json`. The PNGs in this directory include opening phases and final desktop/responsive views.

## Preservation and assets

About, Skills, Currently Exploring, Contact, Footer, portfolio data and media configuration match the pre-edit checkpoint byte-for-byte. The backup and SHA256 manifest are in `checkpoints/before-restoration-20261004-232056/`.

Real portrait, opening footage and project media remain unconfigured in the existing `src/data/media.js`. Existing concept covers and the marked portrait placeholder remain; no replacement media was invented.
