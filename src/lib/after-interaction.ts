// Runs `callback` once, after the visitor first does something (moves the mouse, presses, wheels,
// touches or types) and the main thread is then idle. Decorative heavy work (the dot globe, the 3D
// build diagram) waits for this, so it never competes with the first load. Programmatic scrolls
// do not count; real scrolling starts with a wheel or a touch, which do. Returns a cleanup.
const EVENTS = ["pointermove", "pointerdown", "wheel", "touchstart", "keydown"] as const;

export function afterFirstInteraction(callback: () => void): () => void {
  let idle = 0;
  let timeout = 0;

  const run = () => {
    for (const name of EVENTS) window.removeEventListener(name, run);
    if (typeof window.requestIdleCallback === "function") {
      idle = window.requestIdleCallback(callback, { timeout: 1500 });
    } else {
      timeout = window.setTimeout(callback, 300);
    }
  };

  for (const name of EVENTS) window.addEventListener(name, run, { passive: true });

  return () => {
    for (const name of EVENTS) window.removeEventListener(name, run);
    if (idle && typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
    if (timeout) window.clearTimeout(timeout);
  };
}
