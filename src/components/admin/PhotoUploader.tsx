"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";

import { Avatar } from "@/components/ui/Avatar";
import { buttonClassName } from "@/components/ui/Button";

import { InlineAction, type FormResult } from "./AdminForm";
import { toast } from "./Toaster";

const VIEW = 280;
const OUTPUT = 1024;
const MAX_BYTES = 2 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

type Crop = { scale: number; min: number; x: number; y: number };

type PhotoUploaderProps = {
  photo: { src: string; blurDataURL: string } | null;
  upload: (previous: FormResult, formData: FormData) => Promise<FormResult>;
  remove: (formData: FormData) => Promise<void>;
};

function clamp(crop: Crop, width: number, height: number): Crop {
  const w = width * crop.scale;
  const h = height * crop.scale;
  return {
    ...crop,
    x: Math.min(0, Math.max(VIEW - w, crop.x)),
    y: Math.min(0, Math.max(VIEW - h, crop.y)),
  };
}

// Pick a photo, drag and zoom it inside a square, and upload the 1:1 crop. The server checks the
// file signature again and makes 800px and 256px versions.
export function PhotoUploader({ photo, upload, remove }: PhotoUploaderProps) {
  const [state, action, pending] = useActionState(upload, {});
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<Crop>({ scale: 1, min: 1, x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number } | null>(null);
  const urlRef = useRef<string | null>(null);

  const [seenState, setSeenState] = useState(state);
  if (state !== seenState) {
    setSeenState(state);
    if (state.ok) setImage(null);
  }

  useEffect(() => {
    if (state.ok) toast("ok", state.ok);
    else if (state.error) toast("error", state.error);
  }, [state]);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  function choose(file: File | undefined) {
    if (!file) return;
    if (!TYPES.includes(file.type)) return toast("error", "Only JPG, PNG or WebP images.");
    if (file.size > MAX_BYTES) return toast("error", "That image is over 2 MB.");
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const url = URL.createObjectURL(file);
    urlRef.current = url;
    const next = new Image();
    next.onload = () => {
      const min = Math.max(VIEW / next.naturalWidth, VIEW / next.naturalHeight);
      setImage(next);
      setCrop(
        clamp(
          {
            scale: min,
            min,
            x: (VIEW - next.naturalWidth * min) / 2,
            y: (VIEW - next.naturalHeight * min) / 2,
          },
          next.naturalWidth,
          next.naturalHeight,
        ),
      );
    };
    next.onerror = () => toast("error", "That file could not be read as an image.");
    next.src = url;
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    drag.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current || !image) return;
    const dx = event.clientX - drag.current.x;
    const dy = event.clientY - drag.current.y;
    drag.current = { x: event.clientX, y: event.clientY };
    setCrop((current) =>
      clamp(
        { ...current, x: current.x + dx, y: current.y + dy },
        image.naturalWidth,
        image.naturalHeight,
      ),
    );
  }

  function zoom(scale: number) {
    if (!image) return;
    setCrop((current) => {
      // Zoom around the centre of the square.
      const cx = (VIEW / 2 - current.x) / current.scale;
      const cy = (VIEW / 2 - current.y) / current.scale;
      return clamp(
        { ...current, scale, x: VIEW / 2 - cx * scale, y: VIEW / 2 - cy * scale },
        image.naturalWidth,
        image.naturalHeight,
      );
    });
  }

  function save() {
    if (!image) return;
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const context = canvas.getContext("2d");
    if (!context) return toast("error", "This browser cannot crop images.");
    const size = VIEW / crop.scale;
    context.drawImage(
      image,
      -crop.x / crop.scale,
      -crop.y / crop.scale,
      size,
      size,
      0,
      0,
      OUTPUT,
      OUTPUT,
    );
    canvas.toBlob(
      (blob) => {
        if (!blob) return toast("error", "Cropping failed. Try another image.");
        const form = new FormData();
        form.set("photo", new File([blob], "photo.jpg", { type: "image/jpeg" }));
        startTransition(() => action(form));
      },
      "image/jpeg",
      0.92,
    );
  }

  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-start">
      <div className="flex flex-col items-center gap-3">
        <Avatar photo={photo} size={128} ring online />
        <span className="text-xs text-muted">Current</span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {image ? (
          <>
            <div
              role="img"
              aria-label="Drag to position the photo inside the square"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={() => (drag.current = null)}
              className="relative cursor-grab touch-none overflow-hidden rounded-card bg-surface-2 active:cursor-grabbing"
              style={{ width: VIEW, height: VIEW }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- a local object URL being cropped */}
              <img
                src={image.src}
                alt=""
                draggable={false}
                className="pointer-events-none absolute top-0 left-0 max-w-none select-none"
                style={{
                  width: image.naturalWidth * crop.scale,
                  height: image.naturalHeight * crop.scale,
                  transform: `translate(${crop.x}px, ${crop.y}px)`,
                }}
              />
              <span className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_0_999px_rgba(0,0,0,0.35)]" />
            </div>
            <label className="flex max-w-[280px] items-center gap-3 text-sm text-muted">
              Zoom
              <input
                type="range"
                min={crop.min}
                max={crop.min * 4}
                step={0.001}
                value={crop.scale}
                onChange={(event) => zoom(Number(event.target.value))}
                className="flex-1 accent-(--c1)"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={save}
                disabled={pending}
                className={buttonClassName("accent", "md")}
              >
                {pending ? "Uploading…" : "Save photo"}
              </button>
              <button
                type="button"
                onClick={() => setImage(null)}
                className={buttonClassName("line", "md")}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-3">
            <label className={buttonClassName("line", "md", "w-fit cursor-pointer")}>
              Choose a photo…
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => choose(event.target.files?.[0])}
              />
            </label>
            <p className="text-sm text-muted">
              JPG, PNG or WebP, up to 2 MB. You will crop it to a square next. Use a real photo of
              yourself.
            </p>
            {photo ? (
              <InlineAction
                action={remove}
                label="Remove photo"
                tone="danger"
                confirm="Remove your profile photo? The site will show your initials instead."
              />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
