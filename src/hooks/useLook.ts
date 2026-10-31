"use client";

import { useSyncExternalStore } from "react";

import { DEFAULT_LOOK, getDocumentLook, type Look } from "@/lib/look";

function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-look"] });
  return () => observer.disconnect();
}

export function useLook(): Look {
  return useSyncExternalStore(subscribe, getDocumentLook, () => DEFAULT_LOOK);
}
