export type Vec3 = { x: number; y: number; z: number };

const DEG = Math.PI / 180;

export function latLonToVector(lat: number, lon: number): Vec3 {
  const phi = lat * DEG;
  const lambda = lon * DEG;
  return {
    x: Math.cos(phi) * Math.sin(lambda),
    y: Math.sin(phi),
    z: Math.cos(phi) * Math.cos(lambda),
  };
}

// Yaw turns the globe around its axis; pitch tilts it toward the viewer.
export function rotate(vector: Vec3, yaw: number, pitch: number): Vec3 {
  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);
  const x = vector.x * cosYaw + vector.z * sinYaw;
  const z1 = -vector.x * sinYaw + vector.z * cosYaw;

  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);
  return {
    x,
    y: vector.y * cosPitch - z1 * sinPitch,
    z: vector.y * sinPitch + z1 * cosPitch,
  };
}

export function fibonacciSphere(count: number): Vec3[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: count }, (_, index) => {
    const y = 1 - (index / Math.max(count - 1, 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = golden * index;
    return { x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius };
  });
}

export function slerp(a: Vec3, b: Vec3, t: number): Vec3 {
  const dot = Math.min(1, Math.max(-1, a.x * b.x + a.y * b.y + a.z * b.z));
  const omega = Math.acos(dot);
  if (omega < 1e-6) return a;
  const sinOmega = Math.sin(omega);
  const wa = Math.sin((1 - t) * omega) / sinOmega;
  const wb = Math.sin(t * omega) / sinOmega;
  return { x: a.x * wa + b.x * wb, y: a.y * wa + b.y * wb, z: a.z * wa + b.z * wb };
}

// A point on the great-circle arc, lifted off the surface in the middle so arcs read as flights.
export function arcPoint(a: Vec3, b: Vec3, t: number, maxLift: number): Vec3 {
  const point = slerp(a, b, t);
  const lift = 1 + maxLift * Math.sin(Math.PI * t);
  return { x: point.x * lift, y: point.y * lift, z: point.z * lift };
}

// A projected point is hidden when it is behind the globe and inside its silhouette.
export function isOccluded(point: Vec3): boolean {
  return point.z < 0 && point.x * point.x + point.y * point.y < 1;
}
