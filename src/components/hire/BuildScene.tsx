"use client";

import { useEffect, useRef, type RefObject } from "react";

import {
  AdditiveBlending,
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  EdgesGeometry,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  Line,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PointLight,
  Scene,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  Vector3,
  WebGLRenderer,
} from "three";

import { readCssVar } from "@/lib/css-vars";
import { BUILD_NODES } from "@/lib/hire";

type BuildSceneProps = {
  labelRefs: RefObject<(HTMLLIElement | null)[]>;
  activeRef: RefObject<number | null>;
  onReady: () => void;
  description: string;
};

const NODE_COUNT = BUILD_NODES.length;
const ORBIT = 2.55;
const SPIN_SECONDS = 40;
const MAX_TILT = (12 * Math.PI) / 180;
const PACKET_SECONDS = 3.2;

// A soft round glow, drawn once on a small canvas, used behind the core.
function glowTexture(color: string): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
  }
  return new CanvasTexture(canvas);
}

// The build diagram in WebGL: a faceted core with gold edges, six orbiting nodes, spokes and an
// outer ring, packets travelling node → core → node, a slow spin and a pointer tilt. It draws only
// while on screen and the tab is visible. Labels are real HTML (owned by BuildDiagram); this
// component only moves them to follow their nodes.
export function BuildScene({ labelRefs, activeRef, onReady, description }: BuildSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  // Kept in a ref, so a new callback from the parent never rebuilds the whole scene.
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onReadyRef.current = onReady;
  });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const gold = new Color(readCssVar("--c1") || "#c9a45c");
    const nodeColor = new Color(readCssVar("--surface-2") || "#1a1e27");
    const coreColor = new Color(readCssVar("--surface-solid") || "#12151c");

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", description);
    canvas.className = "absolute inset-0 size-full";
    host.appendChild(canvas);

    const scene = new Scene();
    const camera = new PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.6, 10.2);
    camera.lookAt(0, 0, 0);

    scene.add(new AmbientLight(0xffffff, 0.55));
    const key = new DirectionalLight(0xf4f1ea, 1.1);
    key.position.set(3, 5, 6);
    scene.add(key);
    const coreLight = new PointLight(gold, 6, 9, 1.6);
    scene.add(coreLight);

    // Tilt (pointer) wraps spin (time), so the ring tips towards the reader as it turns.
    const tilt = new Group();
    const spin = new Group();
    tilt.rotation.x = 0.38;
    tilt.add(spin);
    scene.add(tilt);

    const disposables: { dispose: () => void }[] = [];
    const track = <T extends { dispose: () => void }>(item: T): T => {
      disposables.push(item);
      return item;
    };

    // Core: dark facets, gold edges, a glow behind.
    const coreGeometry = track(new IcosahedronGeometry(1.05, 0));
    const core = new Mesh(
      coreGeometry,
      track(
        new MeshStandardMaterial({
          color: coreColor,
          emissive: gold,
          emissiveIntensity: 0.08,
          metalness: 0.4,
          roughness: 0.45,
          flatShading: true,
        }),
      ),
    );
    const edges = new LineSegments(
      track(new EdgesGeometry(coreGeometry)),
      track(new LineBasicMaterial({ color: gold, transparent: true, opacity: 0.95 })),
    );
    core.add(edges);
    const glow = new Sprite(
      track(
        new SpriteMaterial({
          map: track(glowTexture("rgba(201,164,92,0.55)")),
          blending: AdditiveBlending,
          depthWrite: false,
          transparent: true,
        }),
      ),
    );
    glow.scale.setScalar(4.2);
    spin.add(glow, core);

    // Nodes on a ring, each with a spoke to the core.
    const nodeGeometry = track(new SphereGeometry(0.24, 24, 16));
    const nodes = BUILD_NODES.map((_, index) => {
      const angle = (index / NODE_COUNT) * Math.PI * 2;
      const mesh = new Mesh(
        nodeGeometry,
        track(
          new MeshStandardMaterial({
            color: nodeColor,
            emissive: gold,
            emissiveIntensity: 0.18,
            metalness: 0.3,
            roughness: 0.3,
          }),
        ),
      );
      const home = new Vector3(Math.cos(angle) * ORBIT, 0, Math.sin(angle) * ORBIT);
      mesh.position.copy(home);
      spin.add(mesh);

      const spokeGeometry = track(new BufferGeometry());
      spokeGeometry.setAttribute("position", new BufferAttribute(new Float32Array(6), 3));
      const spokeMaterial = track(
        new LineBasicMaterial({ color: gold, transparent: true, opacity: 0.32 }),
      );
      spin.add(new Line(spokeGeometry, spokeMaterial));
      return { mesh, home, spokeGeometry, spokeMaterial, phase: index * 1.3, scale: 1 };
    });

    const ringGeometry = track(new BufferGeometry());
    ringGeometry.setAttribute("position", new BufferAttribute(new Float32Array(NODE_COUNT * 3), 3));
    spin.add(
      new LineLoop(
        ringGeometry,
        track(new LineBasicMaterial({ color: gold, transparent: true, opacity: 0.14 })),
      ),
    );

    // One packet per node, each on its own route: node i → core → node i + 2.
    const packets = new InstancedMesh(
      track(new SphereGeometry(0.075, 10, 8)),
      track(new MeshBasicMaterial({ color: gold })),
      NODE_COUNT,
    );
    spin.add(packets);
    const dummy = new Object3D();
    const from = new Vector3();
    const to = new Vector3();
    const point = new Vector3();
    const origin = new Vector3();

    // Pointer tilt, eased.
    const target = { x: 0, y: 0 };
    const onPointer = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      target.y = Math.max(-1, Math.min(1, nx)) * MAX_TILT;
      target.x = Math.max(-1, Math.min(1, ny)) * MAX_TILT;
    };
    const onLeave = () => {
      target.x = 0;
      target.y = 0;
    };
    host.parentElement?.addEventListener("pointermove", onPointer);
    host.parentElement?.addEventListener("pointerleave", onLeave);

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      // Narrow boxes (phones) pull the camera back, so the ring and its labels stay inside.
      camera.position.z = Math.max(10.2, 10.8 / camera.aspect);
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    const projected = new Vector3();
    let frame = 0;
    let running = false;
    let last = performance.now();
    let elapsed = 0;
    let readied = false;
    // Eases to 0 while a node is hovered or focused, so its label holds still to be read.
    let spinSpeed = 1;

    const render = (now: number) => {
      const delta = Math.min(0.05, (now - last) / 1000);
      last = now;
      elapsed += delta;

      spinSpeed += ((activeRef.current === null ? 1 : 0) - spinSpeed) * 0.08;
      spin.rotation.y += (delta * Math.PI * 2 * spinSpeed) / SPIN_SECONDS;
      tilt.rotation.x += (0.38 + target.x - tilt.rotation.x) * 0.06;
      tilt.rotation.y += (target.y - tilt.rotation.y) * 0.06;
      core.rotation.y -= delta * 0.25;
      core.rotation.x += delta * 0.12;

      const active = activeRef.current;
      const ring = ringGeometry.attributes.position as BufferAttribute;
      nodes.forEach((node, index) => {
        node.mesh.position.set(
          node.home.x,
          Math.sin(elapsed * 0.9 + node.phase) * 0.18,
          node.home.z,
        );
        node.scale += ((active === index ? 1.15 : 1) - node.scale) * 0.15;
        node.mesh.scale.setScalar(node.scale);
        node.spokeMaterial.opacity +=
          ((active === index ? 1 : 0.32) - node.spokeMaterial.opacity) * 0.15;
        const spoke = node.spokeGeometry.attributes.position as BufferAttribute;
        spoke.setXYZ(1, node.mesh.position.x, node.mesh.position.y, node.mesh.position.z);
        spoke.needsUpdate = true;
        ring.setXYZ(index, node.mesh.position.x, node.mesh.position.y, node.mesh.position.z);
      });
      ring.needsUpdate = true;

      nodes.forEach((node, index) => {
        const next = nodes[(index + 2) % NODE_COUNT] ?? node;
        const t = ((elapsed / PACKET_SECONDS + index / NODE_COUNT) % 1) * 2;
        if (t < 1) {
          from.copy(node.mesh.position);
          to.copy(origin);
        } else {
          from.copy(origin);
          to.copy(next.mesh.position);
        }
        point.lerpVectors(from, to, t < 1 ? t : t - 1);
        dummy.position.copy(point);
        dummy.updateMatrix();
        packets.setMatrixAt(index, dummy.matrix);
      });
      packets.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);

      // Labels follow their nodes, as percentages of the box.
      const labels = labelRefs.current ?? [];
      nodes.forEach((node, index) => {
        const label = labels[index];
        if (!label) return;
        node.mesh.getWorldPosition(projected).project(camera);
        label.style.left = `${((projected.x + 1) / 2) * 100}%`;
        label.style.top = `${((1 - projected.y) / 2) * 100}%`;
        label.style.zIndex = projected.z < 0.985 ? "2" : "1";
      });

      if (!readied) {
        readied = true;
        onReadyRef.current();
      }
      if (running) frame = window.requestAnimationFrame(render);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      frame = window.requestAnimationFrame(render);
    };
    const stop = () => {
      running = false;
      window.cancelAnimationFrame(frame);
    };

    let onScreen = false;
    const sync = () => (onScreen && document.visibilityState === "visible" ? start() : stop());
    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = Boolean(entry?.isIntersecting);
      sync();
    });
    visibility.observe(host);
    document.addEventListener("visibilitychange", sync);

    return () => {
      stop();
      visibility.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
      host.parentElement?.removeEventListener("pointermove", onPointer);
      host.parentElement?.removeEventListener("pointerleave", onLeave);
      packets.dispose();
      for (const item of disposables) item.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, [labelRefs, activeRef, description]);

  return <div ref={hostRef} className="absolute inset-0" />;
}
