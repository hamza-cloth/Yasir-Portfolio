import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "accent" | "line";
type ButtonSize = "sm" | "md" | "lg";

type SharedProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

type LinkButtonProps = SharedProps &
  Omit<ComponentProps<typeof Link>, keyof SharedProps | "href"> & { href: string };

type NativeButtonProps = SharedProps &
  Omit<ComponentProps<"button">, keyof SharedProps> & { href?: undefined };

export type ButtonProps = LinkButtonProps | NativeButtonProps;

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "btn-shine bg-fg text-bg shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_8px_24px_-8px_var(--glow)] hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_14px_36px_-10px_var(--glow)] terminal:bg-c1 terminal:text-c1-ink",
  accent: "bg-c1 text-c1-ink hover:bg-c1/90",
  line: "border border-line-2 bg-surface/50 text-fg backdrop-blur-md hover:border-fg/25 hover:bg-surface-2",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 text-sm",
  md: "min-h-12 px-6 text-[0.95rem]",
  lg: "min-h-13 px-7 text-[0.98rem]",
};

export function buttonClassName(variant: ButtonVariant, size: ButtonSize, className?: string) {
  return cn(
    "group/button inline-flex items-center justify-center gap-2 rounded-pill font-medium tracking-[-0.01em] whitespace-nowrap",
    "transition-[transform,background-color,border-color] duration-300 ease-entrance active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:transition-transform [&_svg]:duration-300 [&_svg]:ease-entrance hover:[&_svg]:translate-x-0.5",
    "terminal:text-shadow-none",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

function isInternalHref(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

export function Button(props: ButtonProps) {
  if (props.href !== undefined) {
    const { variant = "primary", size = "md", className, children, href, ...rest } = props;
    const classes = buttonClassName(variant, size, className);
    if (isInternalHref(href)) {
      return (
        <Link href={href} className={classes} {...rest}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  const { variant = "primary", size = "md", className, children, type = "button", ...rest } = props;
  return (
    <button type={type} className={buttonClassName(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}
