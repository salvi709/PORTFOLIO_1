import React, { useEffect, useRef, useState } from "react";
import useMediaQuery from "../../hooks/useMediaQuery";

// Reserve the whole phrase; assistive technology reads it once, without partial updates.
export default function TextWriter({ text, speed = 35, delay = 250, className = "", tag: Tag = "span", cursor = true, onComplete }) {
  const ref = useRef(null);
  const complete = useRef(onComplete);
  complete.current = onComplete;
  const [length, setLength] = useState(0);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  useEffect(() => {
    if (reduced) return;
    let timer;
    let index = 0;
    setLength(0);
    const tick = () => {
      setLength(++index);
      if (index < text.length) timer = setTimeout(tick, speed);
      else complete.current?.();
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      timer = setTimeout(tick, delay);
      observer.disconnect();
    });
    const finish = () => { if (scrollY > 1) { clearTimeout(timer); index = text.length; setLength(text.length); observer.disconnect(); } };
    observer.observe(ref.current);
    window.addEventListener("scroll", finish, { passive: true });
    finish();
    return () => { clearTimeout(timer); observer.disconnect(); window.removeEventListener("scroll", finish); };
  }, [text, speed, delay, reduced]);
  return (
    <Tag ref={ref} className={`text-writer ${className}`}>
      <span className="writer-reserve">{text}</span>
      <span className="writer-ink" aria-hidden="true">
        {reduced ? text : text.slice(0, length)}
        {cursor && !reduced && length < text.length && <i className="writer-caret" />}
      </span>
    </Tag>
  );
}
