import type { Step } from "@/components/ui/Steps";

// How a build goes, start to finish. Shown on the home and Work pages.
export const PROCESS: Step[] = [
  {
    title: "Reproduce the problem",
    body: "Start from what people actually do: the desk, the ticket, the shift. Nothing gets designed before the problem is clear.",
  },
  {
    title: "Model it",
    body: "Tenants, shifts, payments, subnets: get the shape of the data and the network right before the screens.",
  },
  {
    title: "Build and verify",
    body: "Ship in small pieces and check each one, the way a config change ends with a show command.",
  },
  {
    title: "Hand over",
    body: "Write down how it works and keep supporting it. Support is where the next version starts.",
  },
];
