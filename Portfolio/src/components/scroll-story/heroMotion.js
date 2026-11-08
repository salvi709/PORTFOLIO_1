// Shared desktop/mobile chapter clock. Build/Create retain their own timeline.
export const ZOOM_END = 1.5;
export const VIDEO_END = 5.1;
export const TRANSITION_START = 5.85;
export const HERO_END = 9.8;
export const HERO_OFFSET = HERO_END - .8;

export const videoProgress = time => Math.max(0, Math.min(1, (time - ZOOM_END) / (VIDEO_END - ZOOM_END)));

export function addHeroMotion(timeline, scope, backdrop) {
  const q = selector => scope.querySelectorAll(selector);
  timeline
    .fromTo(q('.hero-portrait-video'), { scale: 2.2, transformOrigin: '52% 29%' }, { scale: 1, duration: ZOOM_END, ease: 'none' }, 0)
    .fromTo(q('.hero-fragment,.creative-development'), { autoAlpha: 0, scale: .94 }, { autoAlpha: 1, scale: 1, stagger: .065, duration: .6, ease: 'power1.out' }, .5)
    .to(q('.hero-fragment'), { x: i => [-30, 25, 28, -18, -24][i], y: i => [-38, -20, 16, 28, 22][i], rotation: i => [-3, 4, -2, 3, 2][i], duration: 3.4, ease: 'sine.inOut' }, ZOOM_END)
    .to(q('.fragment-product,.fragment-data'), { scale: 1.07, duration: 1.8, ease: 'none' }, 2.6)
    .to(q('.hero-fragment,.creative-development'), { autoAlpha: 0, duration: .6, stagger: .025 }, 4.55)
    .to(q('.hero-copy,.hero-bottom'), { autoAlpha: 0, y: -16, duration: .65 }, 4.65)
    // The source is opaque. Dissolve on its matching paper before changing theme.
    .to(q('.portrait-composition'), { autoAlpha: 0, duration: TRANSITION_START - VIDEO_END, ease: 'sine.inOut' }, VIDEO_END)
    .to(backdrop, { backgroundColor: '#d8d7d3', duration: .85, ease: 'none' }, TRANSITION_START)
    .to(backdrop, { backgroundColor: '#777773', duration: .95, ease: 'none' }, 6.7)
    .to(backdrop, { backgroundColor: '#30302f', duration: 1.05, ease: 'none' }, 7.65)
    .to(backdrop, { backgroundColor: '#080808', duration: 1.1, ease: 'none' }, 8.7);

  // Each line has a readable hold; the middle-gray crossover happens between lines.
  [[5.9, .74], [7.62, .44], [8.62, .58]].forEach(([start, hold], index) => {
    const quote = q(`.transition-quote:nth-child(${index + 1})`);
    timeline.fromTo(quote, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: .22, ease: 'sine.out' }, start)
      .to(quote, { autoAlpha: 0, y: -14, duration: .22, ease: 'sine.in' }, start + .22 + hold);
  });
  if (!scope.matches('.scene-hero')) timeline.to(q('.scene-hero'), { autoAlpha: 0, duration: .12 }, HERO_END - .12);
  return timeline;
}
