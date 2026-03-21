import { JobState } from '../types/job';
import { fmtCoord, applyKerfOffset } from './utils';

export function generateStraightCut(job: JobState): string {
  const { cut, machine } = job;
  const x = applyKerfOffset(cut.xOffset, machine.kerfWidth);
  return [
    `(--- Straight Cut / ${cut.miterAngle !== 0 ? `Miter ${cut.miterAngle}°` : 'Perpendicular'} ---)`,
    `G0 X${fmtCoord(x)} B0.0000 (Position)`,
    `G0 Z${fmtCoord(cut.pierceHeight)} (Pierce height)`,
    `M3 (Plasma On)`,
    `G4 P0.5 (Pierce delay)`,
    `G1 Z${fmtCoord(cut.cutHeight)} F${cut.feedRate} (Drop to cut height)`,
    `G1 B360.0000 A${fmtCoord(cut.miterAngle)} F${cut.feedRate} (Full rotation cut)`,
    `M5 (Plasma Off)`,
    `G0 Z${fmtCoord(cut.pierceHeight)} (Retract)`,
  ].join('\n');
}
