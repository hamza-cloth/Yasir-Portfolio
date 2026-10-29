import { describe, expect, it } from "vitest";

import { completeInput, findCommand, runCommand } from "@/lib/terminal/run";
import type { TerminalContext } from "@/lib/terminal/types";

const context: TerminalContext = {
  name: "Yasir Abdullah",
  roleLine: "Software & Network Engineer · CCNA-trained · India",
  email: "yasirabdullahearthix@gmail.com",
  availability: "Open to Technical Support, IT Support and Network Engineering roles",
  projects: [{ slug: "hamza-cloth", title: "Hamza Cloth", statusLabel: "v2 in progress" }],
  layers: [{ layer: 3, name: "Network", summary: "Routing", skills: ["OSPF", "ACLs"] }],
};

const texts = (input: string) => runCommand(input, context).lines.map((line) => line.text);

describe("findCommand", () => {
  it("prefers the longest multi-word command and keeps arguments", () => {
    expect(findCommand("show ip int brief")?.command.name).toBe("show ip int brief");
    expect(findCommand("sh ip int br")?.command.name).toBe("show ip int brief");
    expect(findCommand("ping   10.0.12.2")?.args).toEqual(["10.0.12.2"]);
  });

  it("is case-insensitive for the command but keeps argument case", () => {
    expect(findCommand("CD Work")).toMatchObject({ command: { name: "cd" }, args: ["Work"] });
  });
});

describe("runCommand", () => {
  it("answers whoami from the site settings", () => {
    expect(texts("whoami")).toEqual(["yasir abdullah", context.roleLine]);
  });

  it("lists projects with their status", () => {
    expect(texts("projects")[0]).toContain("[v2 in progress]");
  });

  it("pings an IPv4 address and rejects anything else", () => {
    expect(texts("ping 8.8.8.8").at(-1)).toContain("Success rate is 100 percent");
    expect(texts("ping example")[0]).toContain("Unrecognized host");
    expect(texts("ping 300.1.1.1")[0]).toContain("Unrecognized host");
  });

  it("navigates with cd and reports unknown pages", () => {
    expect(runCommand("cd work", context).effect).toEqual({ type: "navigate", href: "/work" });
    expect(runCommand("cd ~", context).effect).toEqual({ type: "navigate", href: "/" });
    expect(runCommand("cd nowhere", context).effect).toBeUndefined();
  });

  it("switches looks only to known looks", () => {
    expect(runCommand("theme porcelain", context).effect).toEqual({
      type: "theme",
      look: "porcelain",
    });
    expect(runCommand("theme neon", context).lines[0]?.kind).toBe("error");
  });

  it("returns clear and exit effects", () => {
    expect(runCommand("clear", context).effect).toEqual({ type: "clear" });
    expect(runCommand("exit", context).effect).toEqual({ type: "exit" });
  });

  it("explains unknown input and ignores blank input", () => {
    expect(texts("rm -rf /")[0]).toContain("Invalid input");
    expect(texts("   ")).toEqual([]);
  });
});

describe("completeInput", () => {
  it("completes unique command and argument prefixes", () => {
    expect(completeInput("who")).toBe("whoami");
    expect(completeInput("cd exp")).toBe("cd experience");
    expect(completeInput("theme te")).toBe("theme terminal");
  });

  it("returns null when the prefix is ambiguous or already complete", () => {
    expect(completeInput("c")).toBeNull();
    expect(completeInput("clear")).toBeNull();
    expect(completeInput("")).toBeNull();
  });
});
