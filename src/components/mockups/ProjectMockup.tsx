import type { ComponentType } from "react";

import type { ProjectVisual } from "@/generated/prisma/enums";

import { ClinicConsole } from "./ClinicConsole";
import { SeatMap } from "./SeatMap";
import { StorefrontMockup } from "./StorefrontMockup";

const MOCKUPS: Record<ProjectVisual, ComponentType> = {
  CLINIC_CONSOLE: ClinicConsole,
  STOREFRONT: StorefrontMockup,
  SEAT_MAP: SeatMap,
};

export function ProjectMockup({ visual }: { visual: ProjectVisual }) {
  const Mockup = MOCKUPS[visual];
  return <Mockup />;
}
