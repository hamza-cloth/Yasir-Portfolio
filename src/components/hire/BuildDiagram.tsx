"use client";

import { useEffect, useId, useRef, useState } from "react";
import dynamic from "next/dynamic";

import { afterFirstInteraction } from "@/lib/after-interaction";
import { cn } from "@/lib/cn";
import { BUILD_NODES } from "@/lib/hire";
import { REDUCED_MOTION_QUERY } from "@/lib/motion";

import { STATIC_NODE_POSITIONS } from "./build-layout";
import { BuildDiagramStatic } from "./BuildDiagramStatic";

// The WebGL scene is its own chunk (three.js), fetched only when it is about to be seen.
const BuildScene = dynamic(() => import("./BuildScene").then((module) => module.BuildScene), {
  ssr: false,
});

const DESCRIPTION =
  "Diagram: a gold core joined to six orbiting stages of a build, Design, Frontend, Backend, Database, Cloud & Hosting and Security & Network, linked in a ring, with data packets flowing between them.";

// Cheap checks, safe to run on load: motion allowed, and not a low-end phone.
function mayRun3d(): boolean {
  if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return false;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  return !(coarse && (navigator.hardwareConcurrency ?? 8) <= 4);
}

// Creating a WebGL context is costly (it can start the GPU process), so this runs only at the
// moment the scene is about to load, never during the first load.
function hasWebGl(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function BuildDiagram({ className }: { className?: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLLIElement | null)[]>([]);
  const activeRef = useRef<number | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [mode, setMode] = useState<"static" | "3d">("static");
  const [sceneReady, setSceneReady] = useState(false);
  const tooltipId = useId();

  // Load the scene once the box is near the screen and the visitor has first interacted with
  // the page. Until then the still diagram stands in, so three.js never slows the first load.
  useEffect(() => {
    const box = boxRef.current;
    if (!box || !mayRun3d()) return;
    let near = false;
    let interacted = false;
    const maybeStart = () => {
      if (near && interacted && hasWebGl()) setMode("3d");
    };
    const stopWaiting = afterFirstInteraction(() => {
      interacted = true;
      maybeStart();
    });
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        near = true;
        observer.disconnect();
        maybeStart();
      },
      { rootMargin: "300px" },
    );
    observer.observe(box);
    return () => {
      observer.disconnect();
      stopWaiting();
    };
  }, []);

  function select(index: number | null) {
    activeRef.current = index;
    setActive(index);
  }

  return (
    <div className={cn("build", className)}>
      <div ref={boxRef} className="build-box" data-scene={sceneReady ? "3d" : "static"}>
        <div aria-hidden="true" className="build-glow" />
        {!sceneReady ? <BuildDiagramStatic /> : null}
        {mode === "3d" ? (
          <BuildScene
            labelRefs={labelRefs}
            activeRef={activeRef}
            onReady={() => setSceneReady(true)}
            description={DESCRIPTION}
          />
        ) : (
          <span role="img" aria-label={DESCRIPTION} className="absolute inset-0" />
        )}

        <ul className="build-labels" aria-label="Build stages">
          {BUILD_NODES.map((node, index) => {
            const position = STATIC_NODE_POSITIONS[index] ?? { x: 50, y: 50 };
            return (
              <li
                key={node.label}
                ref={(element) => {
                  labelRefs.current[index] = element;
                }}
                className="build-label"
                data-active={active === index ? "" : undefined}
                style={{ left: `${position.x}%`, top: `${position.y}%` }}
              >
                <button
                  type="button"
                  aria-describedby={active === index ? `${tooltipId}-${index}` : undefined}
                  onMouseEnter={() => select(index)}
                  onMouseLeave={() => select(null)}
                  onFocus={() => select(index)}
                  onBlur={() => select(null)}
                  onClick={() => select(active === index ? null : index)}
                >
                  {node.label}
                </button>
                <span id={`${tooltipId}-${index}`} role="tooltip" className="build-tooltip">
                  {node.detail}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
