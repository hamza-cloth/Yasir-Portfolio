"use client";

import { useEffect, useState, type RefObject } from "react";

type InViewOptions = {
  once?: boolean;
  rootMargin?: string;
};

export function useInView(
  ref: RefObject<Element | null>,
  { once = false, rootMargin = "0px" }: InViewOptions = {},
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry?.isIntersecting ?? false;
        setInView(visible);
        if (visible && once) observer.disconnect();
      },
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, once, rootMargin]);

  return inView;
}
