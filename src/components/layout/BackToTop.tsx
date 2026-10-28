"use client";

import { useEffect, useState } from "react";

import { Icon } from "@/components/ui/Icon";
import { scrollToTop } from "@/lib/smooth-scroll";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    function update() {
      frame = 0;
      setVisible(window.scrollY > window.innerHeight);
    }
    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  function handleClick() {
    scrollToTop();
    document.getElementById("main")?.focus({ preventScroll: true });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      data-visible={visible}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className="back-to-top glass fixed right-[max(20px,env(safe-area-inset-right))] bottom-[max(20px,env(safe-area-inset-bottom))] z-(--z-header) grid size-12 place-items-center rounded-pill text-fg"
    >
      <Icon name="arrow-up" />
      <span className="sr-only">Back to top</span>
    </button>
  );
}
