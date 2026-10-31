import type { BlockCell, Ebook } from "../types";

const ORANGE = "#ef8a2a";
const GREEN = "#2fa552";
const BLUE = "#2f6fd8";
const BROWN = "#8b5a2e";

const T568A: BlockCell[] = [
  { label: "1", sub: "TX+", color: GREEN, striped: true },
  { label: "2", sub: "TX−", color: GREEN },
  { label: "3", sub: "RX+", color: ORANGE, striped: true },
  { label: "4", color: BLUE },
  { label: "5", color: BLUE, striped: true },
  { label: "6", sub: "RX−", color: ORANGE },
  { label: "7", color: BROWN, striped: true },
  { label: "8", color: BROWN },
];

const T568B: BlockCell[] = [
  { label: "1", sub: "TX+", color: ORANGE, striped: true },
  { label: "2", sub: "TX−", color: ORANGE },
  { label: "3", sub: "RX+", color: GREEN, striped: true },
  { label: "4", color: BLUE },
  { label: "5", color: BLUE, striped: true },
  { label: "6", sub: "RX−", color: GREEN },
  { label: "7", color: BROWN, striped: true },
  { label: "8", color: BROWN },
];

export const LAYER_1: Ebook = {
  slug: "layer-1-physical",
  layer: 1,
  layerName: "Physical",
  title: "Copper, Pins and Hardware",
  subtitle: "Layer 1 · Physical",
  summary:
    "Everything starts with a working link: wiring standards, terminating and testing a cable, how a building is cabled, and a calm order for fixing hardware.",
  chapters: [
    {
      slug: "t568a-t568b",
      title: "T568A and T568B",
      skill: "T568A / T568B",
      summary:
        "The two colour orders for an RJ45 plug, and why one cable uses one standard at both ends.",
      caption:
        "Pin 1 to pin 8, looking at the plug with the clip underneath. Only the orange and green pairs swap.",
      diagram: {
        type: "blocks",
        rows: [
          { label: "T568A", cells: T568A },
          { label: "T568B", cells: T568B },
        ],
      },
    },
    {
      slug: "crimping-and-testing",
      title: "Crimping and Testing a Cable",
      skill: "Crimping and testing",
      summary:
        "Terminating an RJ45 plug that passes first time, and reading what a cable tester tells you.",
      caption:
        "The six steps, then a wiremap: the tester lights each pin in turn. Here pin 7 is open.",
      diagram: {
        type: "blocks",
        rows: [
          {
            label: "Steps",
            cells: [
              { label: "Strip", sub: "25 mm", tone: "c1" },
              { label: "Untwist", sub: "keep short", tone: "c1" },
              { label: "Order", sub: "T568B", tone: "c2" },
              { label: "Trim", sub: "13 mm flat", tone: "c2" },
              { label: "Insert", sub: "to the tip", tone: "c1" },
              { label: "Crimp", sub: "jacket inside", tone: "ok" },
            ],
          },
          {
            label: "Wiremap",
            cells: [
              { label: "1↔1", tone: "ok" },
              { label: "2↔2", tone: "ok" },
              { label: "3↔3", tone: "ok" },
              { label: "4↔4", tone: "ok" },
              { label: "5↔5", tone: "ok" },
              { label: "6↔6", tone: "ok" },
              { label: "7 ✕", sub: "open", tone: "bad" },
              { label: "8↔8", tone: "ok" },
            ],
          },
        ],
      },
    },
    {
      slug: "structured-cabling",
      title: "Structured Cabling",
      skill: "Structured cabling",
      summary: "How a building is wired: outlets, horizontal runs, patch panels and the backbone.",
      caption:
        "A desk reaches the core through fixed, labelled pieces. Only the two short patch cords ever move.",
      diagram: {
        type: "topology",
        zones: [
          { x: 3, y: 24, w: 30, h: 32, label: "Work area", tone: "c1" },
          { x: 38, y: 4, w: 59, h: 52, label: "Telecom room (IDF)", tone: "c2" },
        ],
        nodes: [
          { id: "pc", kind: "pc", label: "Desk PC", x: 10, y: 48 },
          { id: "jack", kind: "outlet", label: "Wall outlet", sub: "D-214", x: 25, y: 38 },
          {
            id: "panel",
            kind: "panel",
            label: "Patch panel",
            sub: "port 14",
            x: 50,
            y: 42,
            tone: "c2",
          },
          {
            id: "sw",
            kind: "switch",
            label: "Access switch",
            sub: "Gi1/0/14",
            x: 72,
            y: 42,
            tone: "c2",
          },
          { id: "core", kind: "router", label: "Core / MDF", x: 86, y: 14, tone: "ok" },
        ],
        links: [
          { from: "pc", to: "jack", style: "dashed" },
          { from: "jack", to: "panel", label: "horizontal ≤ 90 m" },
          { from: "panel", to: "sw", style: "dashed", label: "patch cord" },
          { from: "sw", to: "core", style: "trunk", label: "backbone" },
        ],
        flows: [{ path: ["pc", "jack", "panel", "sw", "core"], label: "Desk to core", tone: "c1" }],
      },
    },
    {
      slug: "hardware-troubleshooting",
      title: "Hardware Troubleshooting",
      skill: "Hardware troubleshooting",
      summary: "A fixed order for a machine that will not start, will not boot or keeps failing.",
      caption:
        "Check from the bottom of the stack up: each layer needs the one beneath it working.",
      diagram: {
        type: "stack",
        direction: "up",
        packet: "check",
        layers: [
          { label: "Application", note: "crashes, errors", tone: "c2" },
          { label: "Drivers & devices", note: "Device Manager" },
          { label: "Operating system", note: "boots? safe mode", tone: "c2" },
          { label: "Firmware & boot order", note: "BIOS / UEFI" },
          { label: "POST", note: "beeps, LEDs", tone: "c2" },
          { label: "Power & cables", note: "outlet, PSU, seated", tone: "warn" },
        ],
      },
    },
  ],
};
