"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// The globe's code loads only once its box is near the screen; until then the CSS sphere
// behind it stands in, in the same space, so nothing shifts when it arrives.
const DotGlobe = dynamic(() => import("./DotGlobe").then((module) => module.DotGlobe), {
  ssr: false,
});

export function LazyGlobe() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

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
      {visible ? <DotGlobe /> : null}
    </div>
  );
}
