"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// The globe's code loads only once its box is near the screen; until then the CSS sphere
// behind it stands in, in the same space, so nothing shifts when it arrives.
const DotGlobe = dynamic(() => import("./DotGlobe").then((module) => module.DotGlobe), {
  ssr: false,
});

// The globe is decoration, so it waits until the page has loaded and the main thread is idle:
// its animation loop must not compete with hydration or delay the first paint of real content.
function whenPageIsIdle(callback: () => void): () => void {
  let idleId = 0;
  let timeoutId = 0;
  const schedule = () => {
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(callback, { timeout: 2500 });
    } else {
      timeoutId = window.setTimeout(callback, 1200);
    }
  };

  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });

  return () => {
    window.removeEventListener("load", schedule);
    if (idleId) window.cancelIdleCallback(idleId);
    if (timeoutId) window.clearTimeout(timeoutId);
  };
}

export function LazyGlobe() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [idle, setIdle] = useState(false);

  useEffect(() => whenPageIsIdle(() => setIdle(true)), []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { rootMargin: "200px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="absolute inset-0">
      {visible && idle ? <DotGlobe /> : null}
    </div>
  );
}
