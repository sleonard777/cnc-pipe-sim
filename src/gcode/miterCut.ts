import { JobState } from '../types/job';
import { fmtCoord } from './utils';
import { miterX, toRad } from '../utils/math';

export function generateMiterCut(job: JobState): string {
  const { cut, pipe } = job;
  const steps = 360;
  const lines: string[] = [
    `(--- Miter Cut ---)`,
    `(Miter Angle: ${cut.miterAngle}°)`,
  ];

  const startX = miterX(cut.xOffset, pipe.od, cut.miterAngle, 0);
  lines.push(`G0 X${fmtCoord(startX)} B0.0000`);
  lines.push(`G0 Z${fmtCoord(cut.pierceHeight)}`);
  lines.push(`M3 (Plasma On)`);
  lines.push(`G4 P0.5`);
  lines.push(`G1 Z${fmtCoord(cut.cutHeight)} F${cut.feedRate}`);

  for (let i = 0; i <= steps; i++) {
    const theta = toRad((360 * i) / steps);
    const b = (360 * i) / steps;
    const x = miterX(cut.xOffset, pipe.od, cut.miterAngle, theta);
    lines.push(`G1 X${fmtCoord(x)} B${fmtCoord(b)} F${cut.feedRate}`);
  }

  lines.push(`M5 (Plasma Off)`);
  lines.push(`G0 Z${fmtCoord(cut.pierceHeight)}`);
  return lines.join('\n');
}
