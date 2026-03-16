/**
 * Single source of parametric path math — used by both gcode/ and animation/.
 * All values in inches. Angles in radians unless noted.
 */
import { JobState } from '../../types/job';
import { saddleX, saddleAAngle, miterX, toRad } from '../../utils/math';

export interface PathPoint {
  x: number;   // along pipe axis (inches)
  b: number;   // B-axis rotation (degrees)
  a: number;   // A-axis tilt (degrees)
  z: number;   // Z torch height (inches above pipe center)
  plasma: boolean;
}

/** Build full path point array for animation and visualization */
export function buildPathPoints(job: JobState): PathPoint[] {
  const { cut, pipe } = job;
  const rMain = pipe.od / 2;

  switch (cut.cutType) {
    case 'straight':
      return buildStraightPath(job);
    case 'miter':
      return buildMiterPath(job, rMain);
    case 'saddle':
      return buildSaddlePath(job, rMain);
    case 'bevel':
      return buildBevelPath(job);
    case 'hole':
    case 'slot':
      return buildHoleSlotPath(job, rMain);
    default:
      return [];
  }
}

function buildStraightPath(job: JobState): PathPoint[] {
  const { cut } = job;
  return [
    { x: cut.xOffset, b: cut.bRotation, a: 0, z: cut.pierceHeight, plasma: false },
    { x: cut.xOffset, b: cut.bRotation, a: 0, z: cut.cutHeight, plasma: false },
    { x: cut.xOffset, b: cut.bRotation, a: cut.miterAngle, z: cut.cutHeight, plasma: true },
    { x: cut.xOffset, b: cut.bRotation, a: cut.miterAngle, z: cut.pierceHeight, plasma: false },
  ];
}

function buildMiterPath(job: JobState, rMain: number): PathPoint[] {
  const { cut, pipe } = job;
  const steps = 180;
  const points: PathPoint[] = [];
  const startX = miterX(cut.xOffset, pipe.od, cut.miterAngle, 0);
  points.push({ x: startX, b: 0, a: 0, z: cut.pierceHeight, plasma: false });
  points.push({ x: startX, b: 0, a: 0, z: cut.cutHeight, plasma: true });
  for (let i = 1; i <= steps; i++) {
    const theta = toRad((360 * i) / steps);
    const b = (360 * i) / steps;
    const x = miterX(cut.xOffset, pipe.od, cut.miterAngle, theta);
    points.push({ x, b, a: 0, z: cut.cutHeight + rMain * Math.cos(theta), plasma: true });
  }
  points.push({ x: startX, b: 360, a: 0, z: cut.pierceHeight, plasma: false });
  return points;
}

function buildSaddlePath(job: JobState, rMain: number): PathPoint[] {
  const { cut } = job;
  const rBranch = (cut.branchOD ?? job.pipe.od * 0.5) / 2;
  const steps = 180;
  const points: PathPoint[] = [];

  const startX = saddleX(cut.xOffset, rMain, rBranch, 0);
  points.push({ x: startX, b: 0, a: 0, z: cut.pierceHeight, plasma: false });
  points.push({ x: startX, b: 0, a: 0, z: cut.cutHeight, plasma: true });

  for (let i = 1; i <= steps; i++) {
    const theta = toRad((360 * i) / steps);
    const b = (360 * i) / steps;
    const x = saddleX(cut.xOffset, rMain, rBranch, theta);
    const a = saddleAAngle(rMain, rBranch, theta);
    if (!isNaN(x)) {
      points.push({ x, b, a, z: cut.cutHeight, plasma: true });
    }
  }
  points.push({ x: startX, b: 360, a: 0, z: cut.pierceHeight, plasma: false });
  return points;
}

function buildBevelPath(job: JobState): PathPoint[] {
  const { cut } = job;
  const steps = 180;
  const points: PathPoint[] = [];
  points.push({ x: cut.xOffset, b: 0, a: 0, z: cut.pierceHeight, plasma: false });
  points.push({ x: cut.xOffset, b: 0, a: cut.bevelAngle, z: cut.cutHeight, plasma: true });
  for (let i = 1; i <= steps; i++) {
    const b = (360 * i) / steps;
    points.push({ x: cut.xOffset, b, a: cut.bevelAngle, z: cut.cutHeight, plasma: true });
  }
  points.push({ x: cut.xOffset, b: 360, a: 0, z: cut.pierceHeight, plasma: false });
  return points;
}

function buildHoleSlotPath(job: JobState, rMain: number): PathPoint[] {
  const { cut, pipe } = job;
  const isSlot = cut.cutType === 'slot';
  const hW = (cut.holeWidth ?? pipe.od * 0.4) / 2;
  const hH = (cut.holeHeight ?? hW * 2) / 2;
  const points: PathPoint[] = [];

  points.push({ x: cut.xOffset, b: 0, a: 0, z: cut.pierceHeight, plasma: false });
  points.push({ x: cut.xOffset, b: 0, a: 0, z: cut.cutHeight, plasma: true });

  if (isSlot) {
    points.push({ x: cut.xOffset - hH, b: -hW, a: 0, z: cut.cutHeight, plasma: true });
    points.push({ x: cut.xOffset + hH, b: -hW, a: 0, z: cut.cutHeight, plasma: true });
    points.push({ x: cut.xOffset + hH, b: hW, a: 0, z: cut.cutHeight, plasma: true });
    points.push({ x: cut.xOffset - hH, b: hW, a: 0, z: cut.cutHeight, plasma: true });
    points.push({ x: cut.xOffset - hH, b: -hW, a: 0, z: cut.cutHeight, plasma: true });
  } else {
    const steps = 72;
    points.push({ x: cut.xOffset + hW, b: 0, a: 0, z: cut.cutHeight, plasma: true });
    for (let i = 1; i <= steps; i++) {
      const angle = (2 * Math.PI * i) / steps;
      const b = (360 * i) / steps;
      const x = cut.xOffset + hW * Math.cos(angle);
      const z = cut.cutHeight + rMain * Math.cos(toRad(b));
      points.push({ x, b, a: 0, z, plasma: true });
    }
  }

  points.push({ x: cut.xOffset, b: 0, a: 0, z: cut.pierceHeight, plasma: false });
  return points;
}
