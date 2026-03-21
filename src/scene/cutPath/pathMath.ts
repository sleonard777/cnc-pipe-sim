/**
 * Single source of parametric path math — used by both gcode/ and animation/.
 * All values in inches. Angles in degrees unless noted.
 *
 * Coordinate convention (pipe-local space, pipeGroup.rotation.x = +b_rad):
 *   localX = position along pipe axis
 *   localY =  (radius + z) * cos(b_rad)
 *   localZ = -(radius + z) * sin(b_rad)   ← negative so world-top stays at Y+ as pipe rotates
 *
 * For flat-face cuts (square/rectangular pipe holes/slots):
 *   tz  = torch lateral world-Z position (inches from pipe centre-line)
 *   b   = 0 (pipe does not rotate)
 *   localY = od/2  (flat top surface)
 *   localZ = -tz   (lateral position on flat face)
 */
import { JobState } from '../../types/job';
import { saddleX, saddleAAngle, miterX, toRad } from '../../utils/math';

export interface PathPoint {
  x: number;      // along pipe axis (inches from drive chuck end)
  b: number;      // pipe rotation (degrees)
  a: number;      // torch bevel tilt (degrees)
  z: number;      // torch height above pipe surface (inches)
  tz: number;     // torch lateral world-Z offset (inches); 0 for all rotary cuts
  plasma: boolean;
}

export function buildPathPoints(job: JobState): PathPoint[] {
  const { cut, pipe } = job;
  const rMain = pipe.od / 2;
  switch (cut.cutType) {
    case 'straight': return buildStraightPath(job);
    case 'miter':    return buildMiterPath(job, rMain);
    case 'saddle':   return buildSaddlePath(job, rMain);
    case 'bevel':    return buildBevelPath(job);
    case 'hole':
    case 'slot':     return buildHoleSlotPath(job, rMain);
    default:         return [];
  }
}

// ── Shorthand for a path point with tz=0 ─────────────────────────────────────
const pt = (x: number, b: number, a: number, z: number, plasma: boolean): PathPoint =>
  ({ x, b, a, z, tz: 0, plasma });

// ── Straight cut ──────────────────────────────────────────────────────────────
function buildStraightPath(job: JobState): PathPoint[] {
  const { cut } = job;
  const steps = 180;
  const pts: PathPoint[] = [];
  const b0 = cut.bRotation;
  pts.push(pt(cut.xOffset, b0, 0, cut.pierceHeight, false));
  pts.push(pt(cut.xOffset, b0, 0, cut.cutHeight,    false));
  for (let i = 0; i <= steps; i++) {
    const b = b0 + (360 * i) / steps;
    pts.push(pt(cut.xOffset, b, cut.miterAngle, cut.cutHeight, true));
  }
  pts.push(pt(cut.xOffset, b0 + 360, 0, cut.pierceHeight, false));
  return pts;
}

// ── Miter cut ─────────────────────────────────────────────────────────────────
function buildMiterPath(job: JobState, _rMain: number): PathPoint[] {
  const { cut, pipe } = job;
  const steps = 180;
  const pts: PathPoint[] = [];
  const b0 = cut.bRotation;
  const startX = miterX(cut.xOffset, pipe.od, cut.miterAngle, toRad(b0));
  pts.push(pt(startX, b0, 0,              cut.pierceHeight, false));
  pts.push(pt(startX, b0, cut.miterAngle, cut.cutHeight,    true));
  for (let i = 1; i <= steps; i++) {
    const b     = b0 + (360 * i) / steps;
    const theta = toRad(b);
    const x     = miterX(cut.xOffset, pipe.od, cut.miterAngle, theta);
    pts.push(pt(x, b, cut.miterAngle, cut.cutHeight, true));
  }
  pts.push(pt(startX, b0 + 360, cut.miterAngle, cut.cutHeight,    true));
  pts.push(pt(startX, b0 + 360, 0,              cut.pierceHeight, false));
  return pts;
}

// ── Saddle cut ────────────────────────────────────────────────────────────────
function buildSaddlePath(job: JobState, rMain: number): PathPoint[] {
  const { cut } = job;
  const rBranch = (cut.branchOD ?? job.pipe.od * 0.5) / 2;
  const steps = 180;
  const pts: PathPoint[] = [];
  const b0 = cut.bRotation;
  const startX = saddleX(cut.xOffset, rMain, rBranch, toRad(b0));
  pts.push(pt(startX, b0, 0, cut.pierceHeight, false));
  pts.push(pt(startX, b0, 0, cut.cutHeight,    true));
  for (let i = 1; i <= steps; i++) {
    const b     = b0 + (360 * i) / steps;
    const theta = toRad(b);
    const x     = saddleX(cut.xOffset, rMain, rBranch, theta);
    const a     = saddleAAngle(rMain, rBranch, theta);
    if (!isNaN(x)) pts.push(pt(x, b, a, cut.cutHeight, true));
  }
  pts.push(pt(startX, b0 + 360, 0, cut.pierceHeight, false));
  return pts;
}

// ── Bevel cut ─────────────────────────────────────────────────────────────────
function buildBevelPath(job: JobState): PathPoint[] {
  const { cut } = job;
  const steps = 180;
  const pts: PathPoint[] = [];
  const b0 = cut.bRotation;
  pts.push(pt(cut.xOffset, b0, 0,              cut.pierceHeight, false));
  pts.push(pt(cut.xOffset, b0, cut.bevelAngle, cut.cutHeight,    true));
  for (let i = 1; i <= steps; i++) {
    pts.push(pt(cut.xOffset, b0 + (360 * i) / steps, cut.bevelAngle, cut.cutHeight, true));
  }
  pts.push(pt(cut.xOffset, b0 + 360, 0, cut.pierceHeight, false));
  return pts;
}

// ── Hole / Slot dispatcher ────────────────────────────────────────────────────
function buildHoleSlotPath(job: JobState, rMain: number): PathPoint[] {
  const isFlat = job.pipe.shape === 'square' || job.pipe.shape === 'rectangular';
  return isFlat ? buildHoleSlotFlat(job) : buildHoleSlotRound(job, rMain);
}

/**
 * Round-pipe hole/slot:
 *   Torch static (A=0, Z=constant), pipe moves in X + small B rotation.
 *   B rotation maps lateral surface arc → world-Z displacement at pipe top.
 */
function buildHoleSlotRound(job: JobState, rMain: number): PathPoint[] {
  const { cut, pipe } = job;
  const isSlot  = cut.cutType === 'slot';
  const rH      = (cut.holeWidth  ?? pipe.od * 0.4) / 2;
  const halfLen = (cut.holeHeight ?? rH * 2)         / 2;
  const pts: PathPoint[] = [];
  const b0 = cut.bRotation;

  const lateralToB = (lateral: number): number =>
    b0 + Math.asin(Math.min(1, Math.max(-1, lateral / rMain))) * 180 / Math.PI;

  if (!isSlot) {
    // Circle on pipe top: X + small B traces the circle
    const pierceX = cut.xOffset + rH;
    pts.push(pt(pierceX, b0, 0, cut.pierceHeight, false));
    pts.push(pt(pierceX, b0, 0, cut.cutHeight,    true));
    for (let i = 0; i <= 90; i++) {
      const phi = (2 * Math.PI * i) / 90;
      pts.push(pt(cut.xOffset + rH * Math.cos(phi), lateralToB(rH * Math.sin(phi)), 0, cut.cutHeight, true));
    }
    pts.push(pt(pierceX, b0, 0, cut.pierceHeight, false));
  } else {
    // Rectangle on pipe top: straight X edges + straight B-rotation edges
    const bHalf = lateralToB(rH);
    const bNeg  = lateralToB(-rH);
    const xL = cut.xOffset - halfLen;
    const xR = cut.xOffset + halfLen;
    const sideSteps = 18;
    pts.push(pt(xL, bNeg, 0, cut.pierceHeight, false));
    pts.push(pt(xL, bNeg, 0, cut.cutHeight,    true));
    // Bottom edge: xL → xR at bNeg
    pts.push(pt(xR, bNeg, 0, cut.cutHeight, true));
    // Right side: B rotates bNeg → bHalf at xR (straight end, no X movement)
    for (let i = 1; i <= sideSteps; i++) {
      const b = bNeg + (bHalf - bNeg) * i / sideSteps;
      pts.push(pt(xR, b, 0, cut.cutHeight, true));
    }
    // Top edge: xR → xL at bHalf
    pts.push(pt(xL, bHalf, 0, cut.cutHeight, true));
    // Left side: B rotates bHalf → bNeg at xL (straight end, no X movement)
    for (let i = 1; i <= sideSteps; i++) {
      const b = bHalf + (bNeg - bHalf) * i / sideSteps;
      pts.push(pt(xL, b, 0, cut.cutHeight, true));
    }
    pts.push(pt(xL, bNeg, 0, cut.cutHeight,    true));
    pts.push(pt(xL, bNeg, 0, cut.pierceHeight, false));
  }
  return pts;
}

/**
 * Square / rectangular pipe hole/slot — flat top face:
 *   Chuck moves pipe in X (along its axis).
 *   Torch carriage traverses laterally (world-Z = tz field).
 *   No pipe rotation (B stays at bRotation), no bevel (A=0).
 *   Torch height (Z) stays at cut.cutHeight throughout.
 */
function buildHoleSlotFlat(job: JobState): PathPoint[] {
  const { cut, pipe } = job;
  const isSlot  = cut.cutType === 'slot';
  const rH      = (cut.holeWidth  ?? pipe.od * 0.4) / 2;  // half-width (torch lateral span)
  const halfLen = (cut.holeHeight ?? rH * 2)         / 2;  // half-length along pipe axis
  const b0      = cut.bRotation;
  const pts: PathPoint[] = [];

  // Helper — point with torch lateral position tz
  const fpt = (x: number, tz: number, z: number, plasma: boolean): PathPoint =>
    ({ x, b: b0, a: 0, z, tz, plasma });

  if (!isSlot) {
    // ── Circular hole on flat top face ─────────────────────────────────────
    // Pierce at rightmost X extent, torch at tz=0 (centre-line)
    pts.push(fpt(cut.xOffset + rH, 0, cut.pierceHeight, false));
    pts.push(fpt(cut.xOffset + rH, 0, cut.cutHeight,    true));
    // Trace circle: X = xOffset + rH·cos(φ),  tz = rH·sin(φ)
    for (let i = 0; i <= 90; i++) {
      const phi = (2 * Math.PI * i) / 90;
      pts.push(fpt(cut.xOffset + rH * Math.cos(phi), rH * Math.sin(phi), cut.cutHeight, true));
    }
    pts.push(fpt(cut.xOffset + rH, 0, cut.pierceHeight, false));

  } else {
    // ── Rectangular slot on flat top face ───────────────────────────────────
    const xL = cut.xOffset - halfLen;
    const xR = cut.xOffset + halfLen;
    pts.push(fpt(xL, 0, cut.pierceHeight, false));
    pts.push(fpt(xL, -rH, cut.cutHeight, true));
    // Bottom edge L → R
    pts.push(fpt(xR, -rH, cut.cutHeight, true));
    // Right edge: straight lateral move -rH → +rH (X fixed at xR)
    pts.push(fpt(xR, rH, cut.cutHeight, true));
    // Top edge R → L
    pts.push(fpt(xL, rH, cut.cutHeight, true));
    // Left edge: straight lateral move +rH → -rH (X fixed at xL)
    pts.push(fpt(xL, -rH, cut.cutHeight, true));
    // Close and retract
    pts.push(fpt(xL, 0, cut.pierceHeight, false));
  }

  return pts;
}
