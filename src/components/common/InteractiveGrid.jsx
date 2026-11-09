import React, { useEffect, useRef } from "react";

/**
 * Editorial Kinetic Background Grid
 * - Visible from page top through the "Also Human" section (#about)
 * - Gradually dissolves after "Also Human" with a smooth ease-out vertical opacity gradient
 * - Gentle, diffused Cobalt Blue (#315BDB) cursor interaction across neighboring grid lines
 * - Continuous radial falloff with no sharp boundaries, no hot clusters, no individual highlighted boxes
 * - Naturally fades out when cursor moves away or rests
 * - Restrained ~5-6px bell-curve warp with smooth recoil
 * - Subtle, static landmark dots on module intersections
 * - Non-blocking pointer-events: none, placed behind content
 * - Full support for window resize, scroll, light/dark theme, and prefers-reduced-motion
 */
export default function InteractiveGrid() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const media = matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
    );

    const CELL_SIZE = 48;
    const INFLUENCE_RADIUS = 150; // Refined interaction radius
    const MAX_WARP = 6; // Restrained, gentle displacement
    const LERP_SPEED = 0.08;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;

    const mouse = { x: -9999, y: -9999 };
    const targetMouse = { x: -9999, y: -9999 };
    let cursorAlpha = 0;
    let targetCursorAlpha = 0;
    let lastMoveTime = 0;

    const ripples = [];
    let isMoving = false;
    let activeHold = 0;

    const getFadeBounds = () => {
      const aboutEl = document.getElementById("about");
      if (!aboutEl) return { start: height + 200, end: height + 600, visible: true };
      const rect = aboutEl.getBoundingClientRect();
      // Start dissolving around the end of the "Also Human" section (-40px)
      // and fade out smoothly over 480px into the following section
      const start = rect.bottom - 40;
      const fadeLength = 480;
      const end = start + fadeLength;
      const visible = end > 0;
      return { start, end, visible };
    };

    const setSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      draw(performance.now());
    };

    const draw = (now) => {
      const fade = getFadeBounds();

      // If the fade has completely scrolled past the top of the viewport,
      // the grid is 100% invisible.
      if (!fade.visible) {
        canvas.style.visibility = "hidden";
        return;
      }
      canvas.style.visibility = "visible";

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const isLight = document.documentElement.getAttribute("data-theme") === "light";

      // Neutral base grid lines
      const lineBase = isLight
        ? "rgba(18, 18, 18, 0.07)"
        : "rgba(240, 240, 235, 0.08)";

      // Update ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        const age = (now - r.born) / 1000;
        r.radius = Math.max(0, age * 300);
        r.opacity = Math.max(0, 1 - age * 1.5);
        if (r.opacity <= 0) ripples.splice(i, 1);
      }

      const cols = Math.max(2, Math.ceil(width / CELL_SIZE)) + 1;
      const rows = Math.max(2, Math.ceil(height / CELL_SIZE)) + 1;
      const cellW = width / (cols - 1);
      const cellH = height / (rows - 1);

      const pts = [];

      // Compute grid points with gentle displacement
      for (let r = 0; r < rows; r++) {
        pts[r] = [];
        for (let c = 0; c < cols; c++) {
          const gx = c * cellW;
          const gy = r * cellH;

          // Boundary pin
          const edgeMargin = 1.6;
          const colPin = Math.min(c / edgeMargin, (cols - 1 - c) / edgeMargin, 1);
          const rowPin = Math.min(r / edgeMargin, (rows - 1 - r) / edgeMargin, 1);
          const pinFactor = colPin * colPin * rowPin * rowPin;

          const dx = gx - mouse.x;
          const dy = gy - mouse.y;
          const dist = Math.hypot(dx, dy);

          let rx = 0;
          let ry = 0;
          for (const rip of ripples) {
            const rdx = gx - rip.x;
            const rdy = gy - rip.y;
            const rdist = Math.hypot(rdx, rdy);
            const waveWidth = 40;
            const diff = rdist - rip.radius;
            if (Math.abs(diff) < waveWidth) {
              const strength = (1 - Math.abs(diff) / waveWidth) * rip.opacity * 6 * pinFactor;
              const angle = Math.atan2(rdy, rdx);
              const sign = diff < 0 ? -1 : 1;
              rx += Math.cos(angle) * strength * sign * -1;
              ry += Math.sin(angle) * strength * sign * -1;
            }
          }

          if (media.matches && dist < INFLUENCE_RADIUS && dist > 0 && pinFactor > 0) {
            const t = dist / INFLUENCE_RADIUS;
            // Smooth bell curve with soft onset
            const eased = (1 - t) * (1 - t) * Math.min(1, dist / 35);
            const warpAmt = eased * MAX_WARP * pinFactor;
            const angle = Math.atan2(dy, dx);
            pts[r][c] = {
              x: gx - Math.cos(angle) * warpAmt + rx,
              y: gy - Math.sin(angle) * warpAmt + ry,
            };
          } else {
            pts[r][c] = { x: gx + rx, y: gy + ry };
          }
        }
      }

      // 1. Render complete base grid in neutral tone
      ctx.lineWidth = 0.75;
      ctx.strokeStyle = lineBase;
      ctx.beginPath();
      for (let r = 0; r < rows; r++) {
        ctx.moveTo(pts[r][0].x, pts[r][0].y);
        for (let c = 1; c < cols; c++) {
          ctx.lineTo(pts[r][c].x, pts[r][c].y);
        }
      }
      for (let c = 0; c < cols; c++) {
        ctx.moveTo(pts[0][c].x, pts[0][c].y);
        for (let r = 1; r < rows; r++) {
          ctx.lineTo(pts[r][c].x, pts[r][c].y);
        }
      }
      ctx.stroke();

      // 2. Render gentle, diffused Cobalt Blue accent with continuous radial falloff
      if (media.matches && cursorAlpha > 0.008 && mouse.x > -500 && mouse.y > -500) {
        const minCol = Math.max(0, Math.floor((mouse.x - INFLUENCE_RADIUS) / cellW));
        const maxCol = Math.min(cols - 1, Math.ceil((mouse.x + INFLUENCE_RADIUS) / cellW));
        const minRow = Math.max(0, Math.floor((mouse.y - INFLUENCE_RADIUS) / cellH));
        const maxRow = Math.min(rows - 1, Math.ceil((mouse.y + INFLUENCE_RADIUS) / cellH));

        ctx.beginPath();
        for (let r = minRow; r <= maxRow; r++) {
          for (let c = minCol; c < maxCol; c++) {
            ctx.moveTo(pts[r][c].x, pts[r][c].y);
            ctx.lineTo(pts[r][c + 1].x, pts[r][c + 1].y);
          }
        }
        for (let c = minCol; c <= maxCol; c++) {
          for (let r = minRow; r < maxRow; r++) {
            ctx.moveTo(pts[r][c].x, pts[r][c].y);
            ctx.lineTo(pts[r + 1][c].x, pts[r + 1][c].y);
          }
        }

        const grad = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          INFLUENCE_RADIUS
        );

        // Cobalt Blue: #315BDB (49, 91, 219)
        // Soft maximum intensity (~0.28-0.32) distributed evenly across surrounding lines
        const maxIntensity = isLight ? 0.28 : 0.32;
        const a0 = maxIntensity * cursorAlpha;

        grad.addColorStop(0, `rgba(49, 91, 219, ${a0.toFixed(3)})`);
        grad.addColorStop(0.25, `rgba(49, 91, 219, ${(a0 * 0.80).toFixed(3)})`);
        grad.addColorStop(0.50, `rgba(49, 91, 219, ${(a0 * 0.48).toFixed(3)})`);
        grad.addColorStop(0.75, `rgba(49, 91, 219, ${(a0 * 0.20).toFixed(3)})`);
        grad.addColorStop(0.92, `rgba(49, 91, 219, ${(a0 * 0.05).toFixed(3)})`);
        grad.addColorStop(1, "rgba(49, 91, 219, 0)");

        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.85;
        ctx.stroke();
      }

      // 3. Render subtle landmark module dots
      const dotColor = isLight ? "rgba(49, 91, 219, 0.15)" : "rgba(49, 91, 219, 0.22)";
      ctx.fillStyle = dotColor;
      ctx.beginPath();
      for (let r = 0; r < rows; r += 4) {
        for (let c = 0; c < cols; c += 4) {
          const p = pts[r][c];
          ctx.moveTo(p.x + 1.0, p.y);
          ctx.arc(p.x, p.y, 1.0, 0, Math.PI * 2);
        }
      }
      ctx.fill();

      // 4. Render ripple rings if any
      for (const rip of ripples) {
        if (rip.radius > 0) {
          ctx.beginPath();
          ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(49, 91, 219, ${(rip.opacity * 0.15).toFixed(3)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // 5. Vertical opacity mask: smooth ease-out dissolve starting near "Also Human" end
      if (fade.start < height) {
        ctx.save();
        ctx.globalCompositeOperation = "destination-in";
        const maskGrad = ctx.createLinearGradient(0, 0, 0, height);
        const s0 = Math.max(0, Math.min(1, fade.start / height));
        const s1 = Math.max(0, Math.min(1, fade.end / height));

        if (s0 > 0) maskGrad.addColorStop(0, "rgba(0,0,0,1)");
        maskGrad.addColorStop(s0, "rgba(0,0,0,1)");

        // Smooth cubic ease-out curve
        const m1 = s0 + (s1 - s0) * 0.28;
        const m2 = s0 + (s1 - s0) * 0.65;
        maskGrad.addColorStop(m1, "rgba(0,0,0,0.80)");
        maskGrad.addColorStop(m2, "rgba(0,0,0,0.25)");
        maskGrad.addColorStop(s1, "rgba(0,0,0,0)");
        if (s1 < 1) maskGrad.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = maskGrad;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }
    };

    const animate = (now) => {
      if (!media.matches) {
        draw(now);
        isMoving = false;
        raf = 0;
        return;
      }

      const dx = targetMouse.x - mouse.x;
      const dy = targetMouse.y - mouse.y;
      mouse.x += dx * LERP_SPEED;
      mouse.y += dy * LERP_SPEED;

      // Soft decay if idle for >1.4s
      if (now - lastMoveTime > 1400 && targetCursorAlpha > 0) {
        targetCursorAlpha = 0;
      }
      cursorAlpha += (targetCursorAlpha - cursorAlpha) * 0.06;
      if (cursorAlpha < 0.002) cursorAlpha = 0;

      draw(now);

      const hasActiveRipples = ripples.length > 0;
      const isMovingMouse = Math.abs(dx) > 0.15 || Math.abs(dy) > 0.15;
      const isFading = cursorAlpha > 0.005;

      if (isMovingMouse || hasActiveRipples || isFading || activeHold > 0) {
        if (!isMovingMouse && !hasActiveRipples && !isFading) activeHold--;
        else activeHold = 20;
        raf = requestAnimationFrame(animate);
      } else {
        isMoving = false;
        raf = 0;
      }
    };

    const schedule = () => {
      if (!isMoving) {
        isMoving = true;
        raf = requestAnimationFrame(animate);
      }
    };

    const onPointerMove = (e) => {
      if (!media.matches) return;
      targetMouse.x = e.clientX;
      targetMouse.y = e.clientY;
      targetCursorAlpha = 1;
      lastMoveTime = performance.now();
      schedule();
    };

    const onPointerLeave = () => {
      targetCursorAlpha = 0;
      targetMouse.x = -9999;
      targetMouse.y = -9999;
      schedule();
    };

    const onClick = (e) => {
      if (!media.matches) return;
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        opacity: 0.8,
        born: performance.now(),
      });
      schedule();
    };

    const onScroll = () => {
      schedule();
    };

    setSize();
    window.addEventListener("resize", setSize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("click", onClick, { passive: true });

    const themeObserver = new MutationObserver(() => {
      draw(performance.now());
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", setSize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("click", onClick);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="interactive-mesh"
      aria-hidden="true"
    />
  );
}
