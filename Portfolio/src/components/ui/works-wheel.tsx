"use client";

// A portfolio index built as a wheel you turn.
// Adapted for Sarthak Salvi's portfolio driven by MAIN WEBSITE SCROLL.
//
// At rest the work sits in a ring around a title, each card tangent to the
// circle. The first notch of scroll blows the ring open into a vertical drum:
// the card at the front lies flat and full size, the ones above and below
// rotate away into hard perspective and run off the top and bottom of the
// frame. Keep scrolling and the drum carries the next piece round to the front.
//
// Driven by main page ScrollTrigger / document scroll (NO nested scrolling).
import * as React from "react";
import { cn } from "@/lib/utils";

export interface WorksWheelItem {
  /** Project name. Shown beside the front card and in the index. */
  title: string;
  /** Cover art. Any src an <img> takes. */
  image: string;
  /** Where the card links to. Omit for a wheel that only browses. */
  href?: string;
  /** Category badge or subtitle */
  category?: string;
  /** Project type: dev or video */
  type?: "dev" | "video";
  /** Optional click handler for project modal dialog preview */
  onClick?: () => void;
}

export interface WorksWheelProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "children"
> {
  items: WorksWheelItem[];
  /** Sits in the middle of the ring. @default "SELECTED WORK" */
  label?: string;
  /** Label on the card's hover affordance. @default "View" */
  action?: string;
  /** External progress (0 to 1) from main page ScrollTrigger */
  progress?: number;
  /** Imperative scroll input: animation does not rerender the gallery. */
  controller?: React.MutableRefObject<((value: number) => void) | null>;
  progressSource?: React.MutableRefObject<number>;
  /** Callback when active project changes */
  onActiveChange?: (index: number) => void;
  /** Cursor enter/leave hooks */
  onCardPointerEnter?: (item: WorksWheelItem) => void;
  onCardPointerLeave?: () => void;
}

/* Geometry tuned for Sarthak Salvi's cinematic showcase */
const CARD_H = 0.76; // front card height, of the stage
const CARD_MAX_W = 0.65; // ... but never wider than this much of the stage
const CARD_RATIO = 1.45; // card width / height
const STEP = 38; // degrees between cards on the drum
const DRUM = 1.88; // drum radius, in card heights
const LENS = 2.4; // perspective distance
const RING_R = 1.25; // ring radius
const BOW = 1.75; // arc radius
const TITLE = 0.124; // ring label and front-card title
const INDEX = 0.038; // index font size
const CULL = 1.6; // Items either side of front worth drawing



const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Stage = { w: number; h: number };

const rad = (deg: number) => (deg * Math.PI) / 180;

const bowAt = (drumDeg: number, bow: number) =>
  -bow * (1 - Math.cos(rad(drumDeg)));

function place(
  ringDeg: number,
  drumDeg: number,
  ringR: number,
  drumR: number,
  bow: number,
  m: number,
) {
  return (
    `translateX(${m * bowAt(drumDeg, bow)}px)` +
    ` rotateZ(${(1 - m) * ringDeg}deg) translateY(${-(1 - m) * ringR}px)` +
    ` rotateX(${m * drumDeg}deg) translateZ(${m * drumR}px)`
  );
}

export function WorksWheel({
  items,
  label = "SELECTED WORK",
  action = "Explore",
  progress = 0,
  controller,
  progressSource,
  onActiveChange,
  onCardPointerEnter,
  onCardPointerLeave,
  className,
  ...props
}: WorksWheelProps) {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const wheelRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLElement | null)[]>([]);
  const labelRef = React.useRef<HTMLDivElement>(null);
  const titleRef = React.useRef<HTMLDivElement>(null);

  const turn = React.useRef(0);
  const target = React.useRef(0);
  const wake = React.useRef(() => {});
  const activeRef = React.useRef(0);
  const activeCallback = React.useRef(onActiveChange);
  activeCallback.current = onActiveChange;
  const [active, setActive] = React.useState(0);
  const [stage, setStage] = React.useState<Stage>({ w: 0, h: 0 });

  const count = items.length;
  const last = Math.max(count - 1, 0);

  // Read reduced motion preference
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => setReduced(query.matches);
    read();
    query.addEventListener("change", read);
    return () => query.removeEventListener("change", read);
  }, []);

  // Update target turn directly from main page document scroll progress
  React.useEffect(() => {
    // progress ranges 0 to 1 across the pinned scroll sequence.
    // 0 = ring formation
    // 0.15 = drum opening with item 0
    // 1.0 = last item
    const targetTurn = progress * (count + 0.3);
    target.current = clamp(targetTurn, 0, count);
    wake.current();
  }, [progress, count]);

  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const read = () => setStage({ w: el.clientWidth, h: el.clientHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const metrics = React.useMemo(() => {
    const { w, h } = stage;
    const compact = window.innerWidth < 700;
    const cardW = compact
      ? Math.min(w * 0.90, h * 0.58 * CARD_RATIO)
      : Math.min(w * 0.62, h * 0.82 * CARD_RATIO);
    const cardH = cardW / CARD_RATIO;
    const drumR = cardH * DRUM;
    const ringR = Math.min(cardH * RING_R, h * .44, w * .40);
    const ringScale = count
      ? clamp((((2 * Math.PI * ringR) / count) * 0.82) / (cardW || 1), 0.16, 1)
      : 1;
    return {
      cardW,
      cardH,
      ringR,
      ringScale,
      drumR,
      bow: cardH * BOW,
      depth: cardH * LENS,
      title: cardH * TITLE,
      index: cardH * INDEX,
    };
  }, [stage, count]);

  // One draw per scroll update; no autonomous inertia after a direction change.
  React.useEffect(() => {
    if (!stage.h) return;
    let frame = 0;
    let visible = true;

    const schedule = () => { if (!frame && visible && !document.hidden) frame = requestAnimationFrame(draw); };
    const { ringR, ringScale, drumR, bow } = metrics;
    // Restore progress after measurement, resizing or browser scroll restoration.
    if (progressSource) target.current = clamp(progressSource.current * (count + .3), 0, count);

    const draw = () => {
      frame = 0;
      turn.current = target.current;

      const t = turn.current;
      const m = clamp(t, 0, 1);
      const pos = Math.max(0, t - 1);

      if (wheelRef.current) {
        wheelRef.current.style.transform = `translateZ(${-m * drumR}px)`;
      }

      for (let i = 0; i < count; i++) {
        const d = i - pos;
        const drumDeg = d * STEP;
        const card = cardRefs.current[i];
        if (card) {
          card.style.transform = place(
            d * (360 / count),
            drumDeg,
            ringR,
            drumR,
            bow,
            m,
          );
          card.style.opacity = m > 0.5 && Math.abs(d) > CULL ? "0" : "1";
          card.style.pointerEvents = m > .5 && Math.abs(d) > CULL ? "none" : "auto";
          card.tabIndex = i === clamp(Math.round(pos), 0, last) ? 0 : -1;
          card.style.zIndex = String(Math.round(100 - Math.abs(d) * 2));
        }
        const face = card?.firstElementChild as HTMLElement | null;
        const cardTargetScale = Math.abs(d) < 0.35 ? 1.05 : 0.96;
        if (face) face.style.transform = `scale(${lerp(ringScale, cardTargetScale, m)})`;
      }

      if (labelRef.current) labelRef.current.style.opacity = String(1 - m);
      if (titleRef.current) titleRef.current.style.opacity = String(m);

      const near = clamp(Math.round(pos), 0, last);
      if (activeRef.current !== near) {
        activeRef.current = near;
        setActive(near);
        activeCallback.current?.(near);
      }

    };

    wake.current = schedule;
    if (controller) controller.current = value => {
      target.current = clamp(value * (count + .3), 0, count);
      schedule();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) { schedule(); }
      else { cancelAnimationFrame(frame); frame = 0; }
    });
    observer.observe(stageRef.current!);
    const visibility = () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
      else { schedule(); }
    };
    document.addEventListener("visibilitychange", visibility);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      wake.current = () => {};
      if (controller) controller.current = null;
    };
  }, [metrics, stage.h, count, last, reduced, controller, progressSource]);

  const activeItem = items[active];

  return (
    <div
      ref={stageRef}
      role="region"
      aria-label={label}
      data-ring-radius={metrics.ringR}
      data-ring-width={metrics.cardW * metrics.ringScale}
      data-ring-height={metrics.cardH * metrics.ringScale}
      className={cn(
        "works-wheel relative size-full overflow-hidden select-none bg-transparent text-offwhite",
        className,
      )}
      style={{ perspective: `${metrics.depth}px` }}
      {...props}
    >
      {/* 3D Wheel Stage */}
      <div
        ref={wheelRef}
        className="absolute top-1/2 left-1/2 [transform-style:preserve-3d] pointer-events-auto"
      >
        {items.map((item, i) => {
          const Tag = item.href ? "a" : "button";
          const isCurrentActive = i === active;
          return (
            <React.Fragment key={item.title + i}>
              <Tag
                id={`works-wheel-${i}`}
                type={item.href ? undefined : "button"}
                aria-label={`Explore ${item.title}`}
                tabIndex={isCurrentActive ? 0 : -1}
                href={item.href}
                onClick={(e) => {
                  if (item.onClick) {
                    e.preventDefault();
                    item.onClick();
                  }
                }}
                onPointerEnter={() => {
                  if (onCardPointerEnter) onCardPointerEnter(item);
                }}
                onPointerLeave={() => {
                  if (onCardPointerLeave) onCardPointerLeave();
                }}
                ref={(node: HTMLElement | null) => {
                  cardRefs.current[i] = node;
                }}
                className="group absolute [backface-visibility:hidden] cursor-pointer"
                style={{
                  width: metrics.cardW,
                  height: metrics.cardH,
                  marginLeft: -metrics.cardW / 2,
                  marginTop: -metrics.cardH / 2,
                }}
              >
                <span className="bg-charcoal-900 border border-white/10 group-hover:border-lavender-electric/60 shadow-black/80 relative block size-full overflow-hidden rounded-lg shadow-[0_20px_50px_-20px_var(--tw-shadow-color)] transition-colors duration-300">
                  <img
                    src={item.image}
                    alt=""
                    onError={e => { const img = e.currentTarget; const fallback = (item as WorksWheelItem & { fallback?: string }).fallback; if (fallback && img.src !== fallback) img.src = fallback; }}
                    draggable={false}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />

                  {/* Category Pill Tag */}
                  {item.category && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/75 backdrop-blur-md border border-white/15 text-[10px] font-tech text-lavender-soft tracking-wider uppercase">
                      {item.category}
                    </span>
                  )}

                  {/* Hover Action Badge */}
                  <span className="bg-charcoal-950/90 text-offwhite border border-white/20 pointer-events-none absolute right-3 bottom-3 flex translate-y-1 items-center gap-1.5 rounded-full px-3 py-1 text-[0.72rem] font-tech font-bold opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-hover:border-lavender-electric/50">
                    <svg
                      viewBox="0 0 12 12"
                      className="size-2.5 text-lavender-electric"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 9 9 3M4 3h5v5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {action}
                  </span>
                </span>
              </Tag>
            </React.Fragment>
          );
        })}
      </div>

      {/* Ring Title (Center) */}
      <div
        ref={labelRef}
        className="pointer-events-none absolute inset-0 grid place-items-center tracking-tight font-display font-normal text-offwhite uppercase text-center px-4"
        style={{ fontSize: Math.max(20, metrics.title) }}
      >
        <div>
          <span className="block text-offwhite drop-shadow-md">{label}</span>
          <span className="block font-accent text-lavender-soft lowercase text-[0.42em] tracking-normal font-normal mt-1">
            scroll to explore my work
          </span>
        </div>
      </div>

      {/* Front-Card Dynamic Title Area (Left) */}
      <div
        ref={titleRef}
        className="wheel-active-title pointer-events-none absolute top-1/2 left-[3%] -translate-y-1/2 tracking-tight opacity-0 max-w-[32%] z-10"
      >
        <div className="space-y-1">
          <span className="font-tech text-xs text-lavender-soft tracking-widest uppercase block">
            {activeItem?.category || "SELECTED WORK"}
          </span>
          <h3
            className="font-display font-normal text-offwhite uppercase leading-none drop-shadow"
            style={{ fontSize: Math.max(34, Math.min(64, stage.w * .04)) }}
          >
            {activeItem?.title}
          </h3>
          <p className="font-accent text-sm sm:text-base text-lavender-soft opacity-80 pt-1">
            Explore the project ↗
          </p>
        </div>
      </div>

      {/* Project Index (Right) */}
      <ol
        className="wheel-project-index text-offwhite-dim absolute top-[10%] right-[4%] text-right leading-[1.8] font-tech text-xs z-20 hidden md:block"
        style={{ fontSize: Math.max(11, metrics.index) }}
      >
        {items.map((item, i) => (
          <li key={item.title + i}>
            <button
              type="button"
              aria-label={`Explore ${item.title}`}
              onClick={() => {
                if (item.onClick) item.onClick();
              }}
              className={cn(
                "wheel-index-button hover:text-offwhite cursor-pointer transition-all px-2 py-0.5 rounded text-left block w-full",
                i === active && "text-lavender-electric font-bold",
              )}
            >
              <span className="opacity-40 mr-1.5 text-[10px]">{String(i + 1).padStart(2, "0")}</span>
              <span>{item.title}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default WorksWheel;
