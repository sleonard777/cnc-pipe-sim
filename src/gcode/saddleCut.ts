import { JobState } from '../types/job';
import { fmtCoord } from './utils';
import { saddleX, saddleAAngle, toRad } from '../utils/math';

export function generateSaddleCut(job: JobState): string {
  const { cut, pipe } = job;
  const rMain = pipe.od / 2;
  const rBranch = (cut.branchOD ?? pipe.od * 0.5) / 2;
  const steps = 360;
  const lines: string[] = [
    `(--- Saddle Cut ---)`,
    `(Main OD: ${pipe.od}" Branch OD: ${(cut.branchOD ?? pipe.od * 0.5)}")`,
  ];

  // Find start angle (top of pipe)
  const startTheta = 0;
  const startX = saddleX(cut.xOffset, rMain, rBranch, startTheta);

  lines.push(`G0 X${fmtCoord(startX)} B0.0000 (Position to start)`);
  lines.push(`G0 Z${fmtCoord(cut.pierceHeight)}`);
  lines.push(`M3 (Plasma On)`);
  lines.push(`G4 P0.5`);
  lines.push(`G1 Z${fmtCoord(cut.cutHeight)} F${cut.feedRate}`);

  for (let i = 0; i <= steps; i++) {
    const theta = toRad((360 * i) / steps);
    const b = (360 * i) / steps;
    const x = saddleX(cut.xOffset, rMain, rBranch, theta);
    const a = saddleAAngle(rMain, rBranch, theta);
    if (!isNaN(x)) {
      lines.push(`G1 X${fmtCoord(x)} B${fmtCoord(b)} A${fmtCoord(a)} F${cut.feedRate}`);
    }
  }

  lines.push(`M5 (Plasma Off)`);
  lines.push(`G0 Z${fmtCoord(cut.pierceHeight)}`);
  return lines.join('\n');
}
