import { formatIstTime } from "@/lib/ist-time";
import { isLook, LOOK_LABELS, LOOKS } from "@/lib/look";
import { ALL_PAGES } from "@/lib/site-nav";

import {
  isIpv4,
  pingOutput,
  SHOW_IP_INTERFACE_BRIEF,
  tracerouteOutput,
  UNKNOWN_HOST,
} from "./network-output";
import type { TerminalCommand, TerminalLine, TerminalResult } from "./types";

const out = (text: string): TerminalLine => ({ kind: "output", text });
const accent = (text: string): TerminalLine => ({ kind: "accent", text });
const error = (text: string): TerminalLine => ({ kind: "error", text });
const lines = (...items: TerminalLine[]): TerminalResult => ({ lines: items });

export const PAGE_NAMES = ALL_PAGES.map((page) =>
  page.href === "/" ? "home" : page.href.slice(1),
);

function pageHref(target: string): string | null {
  const name = target.replace(/^\/+|\/+$/g, "").toLowerCase();
  if (["", "~", "..", "home"].includes(name)) return "/";
  return PAGE_NAMES.includes(name) ? `/${name}` : null;
}

function hostResult(args: string[], render: (host: string) => string[]): TerminalResult {
  const host = args[0] ?? "8.8.8.8";
  if (!isIpv4(host)) return lines(error(UNKNOWN_HOST));
  return { lines: render(host).map(out) };
}

export const COMMANDS: TerminalCommand[] = [
  {
    name: "help",
    summary: "list commands",
    run: () => ({
      lines: COMMANDS.map((command) =>
        out(`  ${(command.usage ?? command.name).padEnd(22)} ${command.summary}`),
      ),
    }),
  },
  {
    name: "ls",
    summary: "list pages",
    run: () => lines(out(PAGE_NAMES.join("  "))),
  },
  {
    name: "cd",
    usage: "cd <page>",
    summary: "open a page",
    run: (args) => {
      const href = pageHref(args[0] ?? "");
      if (!href) return lines(error(`cd: no such page: ${args[0] ?? ""}. Try ls.`));
      return { lines: [accent(`→ ${href}`)], effect: { type: "navigate", href } };
    },
  },
  {
    name: "whoami",
    summary: "who runs this site",
    run: (_args, context) => lines(out(context.name.toLowerCase()), out(context.roleLine)),
  },
  {
    name: "skills",
    summary: "skills by OSI layer",
    run: (_args, context) => ({
      lines: context.layers
        .filter((group) => group.skills.length > 0)
        .map((group) => out(`L${group.layer} ${group.name.padEnd(13)} ${group.skills.join(", ")}`)),
    }),
  },
  {
    name: "projects",
    summary: "what I am building",
    run: (_args, context) => ({
      lines: context.projects.map((project) =>
        out(`${project.title.padEnd(26)} [${project.statusLabel}]`),
      ),
    }),
  },
  {
    name: "show ip int brief",
    aliases: ["show ip interface brief", "sh ip int br", "sh ip int brief"],
    summary: "interfaces on lab router R1",
    run: () => ({ lines: SHOW_IP_INTERFACE_BRIEF.map(out) }),
  },
  {
    name: "ping",
    usage: "ping <ip>",
    summary: "simulated ICMP echo",
    run: (args) => hostResult(args, pingOutput),
  },
  {
    name: "traceroute",
    aliases: ["tracert"],
    usage: "traceroute <ip>",
    summary: "simulated path through the lab",
    run: (args) => hostResult(args, tracerouteOutput),
  },
  {
    name: "contact",
    summary: "how to reach me",
    run: (_args, context) => lines(out(`email  ${context.email}`), out(context.availability)),
  },
  {
    name: "theme",
    usage: "theme <ops|paper|terminal>",
    summary: "switch the look",
    run: (args) => {
      const look = args[0]?.toLowerCase();
      if (!isLook(look)) return lines(error(`theme: choose one of ${LOOKS.join(", ")}`));
      return { lines: [accent(`look → ${LOOK_LABELS[look]}`)], effect: { type: "theme", look } };
    },
  },
  {
    name: "date",
    summary: "time in India",
    run: () => lines(out(`${formatIstTime(new Date())} IST (UTC+05:30)`)),
  },
  {
    name: "clear",
    summary: "clear the screen",
    run: () => ({ lines: [], effect: { type: "clear" } }),
  },
  {
    name: "exit",
    summary: "close the terminal",
    run: () => ({ lines: [], effect: { type: "exit" } }),
  },
  {
    name: "sudo hire-yasir",
    summary: "you know you want to",
    run: () => ({
      lines: [
        out("[sudo] password for recruiter: ********"),
        accent("Access granted. Opening contact…"),
      ],
      effect: { type: "navigate", href: "/contact" },
    }),
  },
];
