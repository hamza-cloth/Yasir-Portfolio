"use client";

import { useEffect, useState, type ReactNode } from "react";

import { cn } from "@/lib/cn";

import { buttonClassName, type ButtonVariant } from "./Button";
import { Icon } from "./Icon";

type CopyState = "idle" | "copied" | "failed";

type CopyButtonProps = {
  value: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
};

const STATUS: Record<CopyState, string> = {
  idle: "",
  copied: "Copied to clipboard",
  failed: "Copy failed. Select the text and copy it instead.",
};

export function CopyButton({ value, children, variant = "line", className }: CopyButtonProps) {
  const [state, setState] = useState<CopyState>("idle");

  useEffect(() => {
    if (state === "idle") return;
    const timer = window.setTimeout(() => setState("idle"), 2400);
    return () => window.clearTimeout(timer);
  }, [state]);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      setState("failed");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={cn(buttonClassName(variant, "md"), className)}
      >
        <Icon name="copy" />
        {state === "copied" ? "Copied" : children}
      </button>
      <span role="status" className="sr-only">
        {STATUS[state]}
      </span>
    </>
  );
}
