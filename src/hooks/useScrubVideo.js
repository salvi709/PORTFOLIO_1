import { useLayoutEffect } from "react";

// One decoder seek at a time, always to the latest requested scroll position.
export default function useScrubVideo(ref, controller, source) {
  useLayoutEffect(() => {
    const video = ref.current;
    const fps = 24;
    let progress = 0, frame = 0, active = true, ready = false;
    let requestedFrame = -1, presented = true, presentation = 0, fallback = 0;
    const finishPresentation = () => {
      if (presentation) video.cancelVideoFrameCallback?.(presentation);
      presentation = 0; clearTimeout(fallback); presented = true; schedule();
    };
    const seek = () => {
      frame = 0;
      if (!active || !ready || video.seeking || !presented) return;
      const lastFrame = Math.max(0, Math.ceil(video.duration * fps) - 1);
      const targetFrame = Math.round(progress * lastFrame);
      if (targetFrame === requestedFrame) return;
      requestedFrame = targetFrame;
      const target = Math.min(video.duration - .001, targetFrame / fps);
      if (Math.abs(video.currentTime - target) < 1 / (fps * 2)) return;
      if (video.requestVideoFrameCallback) {
        presented = false;
        presentation = video.requestVideoFrameCallback(finishPresentation);
        // Some engines suppress callbacks for paused seeks; never deadlock.
        fallback = window.setTimeout(finishPresentation, 100);
      }
      video.currentTime = target;
    };
    const schedule = () => { if (!frame && active) frame = requestAnimationFrame(seek); };
    const update = value => { progress = Math.max(0, Math.min(1, value)); schedule(); };
    controller.current = update;
    video.pause();
    const onReady = () => {
      ready = video.readyState >= 2 && Number.isFinite(video.duration);
      video.dataset.scrubReady = String(ready);
      if (ready) schedule();
    };
    video.addEventListener("loadedmetadata", onReady);
    video.addEventListener("seeked", schedule);
    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplay", onReady);
    onReady();
    return () => {
      active = false; cancelAnimationFrame(frame); clearTimeout(fallback); video.pause();
      if (presentation) video.cancelVideoFrameCallback?.(presentation);
      video.removeEventListener("loadedmetadata", onReady);
      video.removeEventListener("seeked", schedule);
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplay", onReady);
      if (controller.current === update) controller.current = null;
    };
  }, [ref, controller, source]);
}
