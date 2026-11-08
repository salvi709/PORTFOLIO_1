# Wheel response and grid correction

## What the audit established

The existing app used native document scrolling with `scrub: true`. No Lenis, locomotive-scroll, custom wheel multiplier, wheel listener, normalizeScroll, scrollerProxy or interpolated scroll loop was present. Navigation scroll calls run on clicks; gallery animation frames draw card transforms without moving the document. CSS scroll behavior is `auto`.

Before changes, browser-generated wheel deltas of 12, 24, 60 and 120 pixels produced exactly 12, 24, 60 and 120 pixels of document movement, in both directions. There was no measured application-level amplification. Windows reported three lines per wheel notch. This does not establish what a particular physical device or driver sends to the browser; physical wheel sensitivity was not measured remotely.

The previous 1.25 pin-distance multiplier changed page length rather than input sensitivity. The previous grid edit also reduced the additional cursor stroke from .15 to .025, despite increasing the resting stroke.

## Correction

- Removed the 1.25 distance multiplier. At the tested desktop size the pin returns from 2618px to 2094px.
- Added a scoped desktop wheel-input hook with a .65 multiplier. It writes directly to the document scroll position: no interpolation, momentum, scroll target, animation redesign or added lag. Fractional input is retained and cleared on reversal.
- Keyboard, scrollbar and touch inputs remain native. Zoom/modifier/horizontal gestures, nested scroll areas, editable controls, open dialogs and document boundaries are excluded.
- Increased resting grid alpha from .085 to .13 and the additional cursor stroke from .025 to .09. Line width, spacing, deformation force, radius, spring parameters, canvas layering and return behavior are unchanged. No theme/layout changes.

## Verification

Browser wheel input was tested with Playwright `mouse.wheel`, not just programmatic scrollTo or dragging the scrollbar. The events are browser-generated trusted events; they are not a hands-on physical mouse test.

| Wheel delta | Before displacement | After displacement |
| --- | --- | --- |
| 12px, repeated | 12px each | 7–8px each |
| 60px | 60px | 39px |
| 120px | 120px | 78px |
| -120px | -120px | -78px |

Repeated forward/reverse inputs return to the starting position and show no drift after input stops. Input safeguards, modal scrolling, mobile and reduced-motion checks pass. The production build and existing choreography/grid/responsive regression checks pass with no runtime errors. Before/after grid screenshots were visually inspected.

Evidence: `before.json`, `after.json`, `guard-checks.json`, `regression-results.json`, `scope-check.json`, and PNGs in this directory.

Backup: `checkpoints/before-wheel-correction-20261006/`.
