"use client";

import { useSyncExternalStore } from "react";

import { DEFAULT_SKIN, getDocumentSkin, type Skin } from "@/lib/skin";

function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-skin"] });
  return () => observer.disconnect();
}

export function useSkin(): Skin {
  return useSyncExternalStore(subscribe, getDocumentSkin, () => DEFAULT_SKIN);
}
