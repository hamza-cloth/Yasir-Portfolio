import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/cn";

type ButtonVariant = "solid" | "cyan" | "line";
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
  solid: "bg-fg text-bg",
  cyan: "bg-c1 text-c1-ink",
  line: "border border-line-2 text-fg hover:border-c1",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "min-h-11 px-4 text-sm",
  md: "min-h-12 px-6 text-[0.95rem]",
  lg: "min-h-14 px-8 text-base",
};

export function buttonClassName(variant: ButtonVariant, size: ButtonSize, className?: string) {
  return cn(
    "glow-hover inline-flex items-center justify-center gap-2 rounded-pill font-semibold whitespace-nowrap",
    "transition-transform duration-300 ease-entrance active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
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
    const { variant = "solid", size = "md", className, children, href, ...rest } = props;
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

  const { variant = "solid", size = "md", className, children, type = "button", ...rest } = props;
  return (
    <button type={type} className={buttonClassName(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}
