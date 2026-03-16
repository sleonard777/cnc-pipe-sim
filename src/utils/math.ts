export const DEG2RAD = Math.PI / 180;
export const RAD2DEG = 180 / Math.PI;

export function toRad(deg: number): number {
  return deg * DEG2RAD;
}

export function toDeg(rad: number): number {
  return rad * RAD2DEG;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpAngle(a: number, b: number, t: number): number {
  let delta = ((b - a + 540) % 360) - 180;
  return a + delta * t;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function fmt(n: number, decimals = 4): string {
  return n.toFixed(decimals);
}

/**
 * Saddle cut parametric: X position as function of B angle (theta in radians)
 * x(θ) = xOffset - sqrt(R_branch² - (R_main * sin(θ))²)
 * Returns NaN when branch doesn't intersect at this angle.
 */
export function saddleX(
  xOffset: number,
  rMain: number,
  rBranch: number,
  theta: number
): number {
  const discriminant = rBranch * rBranch - Math.pow(rMain * Math.sin(theta), 2);
  if (discriminant < 0) return NaN;
  return xOffset - Math.sqrt(discriminant);
}

/**
 * Saddle surface normal A-axis angle at given theta
 */
export function saddleAAngle(rMain: number, rBranch: number, theta: number): number {
  const sinT = Math.sin(theta);
  const discriminant = rBranch * rBranch - Math.pow(rMain * sinT, 2);
  if (discriminant <= 0) return 0;
  const dxdtheta = (rMain * rMain * sinT * Math.cos(theta)) / Math.sqrt(discriminant);
  return toDeg(Math.atan(dxdtheta / rMain));
}

/**
 * Miter cut parametric: X position as function of B angle (theta in radians)
 * x(θ) = xOffset + (OD/2) * sin(miterAngle) * cos(θ)
 */
export function miterX(
  xOffset: number,
  od: number,
  miterAngleDeg: number,
  theta: number
): number {
  return xOffset + (od / 2) * Math.sin(toRad(miterAngleDeg)) * Math.cos(theta);
}

/**
 * Z height on pipe surface for round pipe at B angle
 * z(θ) = R * cos(θ) + zCenter
 */
export function pipeSurfaceZ(radius: number, theta: number, zCenter: number): number {
  return zCenter + radius * Math.cos(theta);
}
