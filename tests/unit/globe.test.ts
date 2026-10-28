import { describe, expect, it } from "vitest";

import {
  arcPoint,
  fibonacciSphere,
  isOccluded,
  latLonToVector,
  rotate,
  slerp,
} from "@/lib/canvas/globe";
import { HUB } from "@/lib/globe-cities";

const length = (v: { x: number; y: number; z: number }) => Math.hypot(v.x, v.y, v.z);

describe("globe maths", () => {
  it("places points on the unit sphere", () => {
    expect(length(latLonToVector(28.54, 77.39))).toBeCloseTo(1, 10);
    const points = fibonacciSphere(1300);
    expect(points).toHaveLength(1300);
    expect(points.every((point) => Math.abs(length(point) - 1) < 1e-9)).toBe(true);
  });

  it("turns Noida to face the viewer with yaw = -longitude and pitch = latitude", () => {
    const noida = latLonToVector(HUB.lat, HUB.lon);
    const facing = rotate(noida, (-HUB.lon * Math.PI) / 180, (HUB.lat * Math.PI) / 180);
    expect(facing.x).toBeCloseTo(0, 10);
    expect(facing.y).toBeCloseTo(0, 10);
    expect(facing.z).toBeCloseTo(1, 10);
  });

  it("interpolates along the great circle and lifts the middle of an arc", () => {
    const a = latLonToVector(0, 0);
    const b = latLonToVector(0, 90);
    expect(length(slerp(a, b, 0.5))).toBeCloseTo(1, 10);
    expect(length(arcPoint(a, b, 0.5, 0.12))).toBeCloseTo(1.12, 10);
    expect(length(arcPoint(a, b, 0, 0.12))).toBeCloseTo(1, 10);
  });

  it("hides points behind the globe but not those beyond its edge", () => {
    expect(isOccluded({ x: 0, y: 0, z: -1 })).toBe(true);
    expect(isOccluded({ x: 1.1, y: 0, z: -0.2 })).toBe(false);
    expect(isOccluded({ x: 0, y: 0, z: 1 })).toBe(false);
  });
});
