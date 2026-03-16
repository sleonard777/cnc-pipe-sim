import { JobState } from '../types/job';
import { fmtCoord, applyKerfOffset } from './utils';

export function generateStraightCut(job: JobState): string {
  const { cut, machine } = job;
  const x = applyKerfOffset(cut.xOffset, machine.kerfWidth);
  const lines: string[] = [
    `(--- Straight Cut ---)`,
    `G0 X${fmtCoord(cut.xOffset)} B${fmtCoord(cut.bRotation)} (Position)`,
    `G0 Z${fmtCoord(cut.pierceHeight)} (Pierce height)`,
    `M3 (Plasma On)`,
    `G4 P0.5 (Pierce delay 0.5s)`,
    `G1 Z${fmtCoord(cut.cutHeight)} F${cut.feedRate} (Drop to cut height)`,
    `G1 X${fmtCoord(x)} A${fmtCoord(cut.miterAngle)} F${cut.feedRate} (Straight cut with miter)`,
    `M5 (Plasma Off)`,
    `G0 Z${fmtCoord(cut.pierceHeight)} (Retract)`,
  ];
  return lines.join('\n');
}
